from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import GameSession, PuzzleAttempt, StudentBadge
from .serializers import (
    GameSessionSerializer,
    PuzzleSubmitSerializer,
    StudentBadgeSerializer,
)

# کلید پاسخ‌های علمی و اعتبارسنجی سرورساید معماها
PUZZLE_SOLUTIONS = {
    ("entrance", "steroid_core"): {
        "type": "set_match",
        "expected": ["ring_a", "ring_b", "ring_c", "ring_d", "c17_sidechain"],
        "base_score": 150,
        "clue": None,
        "feedback_ok": "اسکلت سیکلوپنتانوپرهیدروفنانترن با موفقیت سنتز شد. گیت امنیتی R&D باز شد.",
        "feedback_err": "چیدمان حلقه‌های A، B، C و D یا زنجیره جانبی C17 صحیح نیست. ساختار پایه استروئید را بررسی کنید.",
    },
    ("glucocorticoid", "conformation_lock"): {
        "type": "exact_dict",
        "expected": {"H8": "beta", "H9": "alpha", "H14": "alpha"},
        "base_score": 200,
        "clue": None,
        "feedback_ok": "کانفورماسیون ترانس-آنتی-ترانس (8β, 9α, 14α) تایید شد. قفل پنل آزمایشگاه باز شد.",
        "feedback_err": "آرایش فضایی هیدروژن‌ها در اتصال حلقه‌های B/C و C/D با ایزومر فعال کورتیزول مطابقت ندارد.",
    },
    ("glucocorticoid", "sar_potency_sort"): {
        "type": "exact_list",
        "expected": ["5", "3", "4", "6", "2", "1"],
        "base_score": 250,
        "clue": {
            "id": "clue_gc_fluorine",
            "title": "سرنخ اول: فلوئوریناسیون در موقعیت 9α",
            "detail": "اهریمن یک گلوکوکورتیکوئید بسیار قوی حاوی اتم فلوئور (9α-F) و پیوند دوگانه C1=C2 است.",
        },
        "feedback_ok": "ترتیب قدرت ضدالتهابی (5 > 3 > 4 > 6 > 2 > 1) کاملاً دقیق است! وجود 9α-فلوئور و استخلاف C16 قدرت را به حداکثر رسانده است.",
        "feedback_err": "ترتیب قدرت صحیح نیست. به نقش پیوند دوگانه Δ1، فلوئور در کربن 9α و متیل/هیدروکسیل در C16 دقت کنید.",
    },
}


def evaluate_answer(puzzle_key, submitted):
    rule = PUZZLE_SOLUTIONS.get(puzzle_key)
    if not rule:
        return False, "معمای نامعتبر"

    p_type = rule["type"]
    expected = rule["expected"]

    if p_type == "set_match":
        if isinstance(submitted, list):
            is_ok = set(submitted) == set(expected) and len(submitted) == len(expected)
        else:
            is_ok = False
    elif p_type == "exact_dict":
        is_ok = isinstance(submitted, dict) and submitted == expected
    elif p_type == "exact_list":
        is_ok = isinstance(submitted, list) and [str(x) for x in submitted] == expected
    else:
        is_ok = False

    return is_ok, (rule["feedback_ok"] if is_ok else rule["feedback_err"])


class ActiveSessionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        session, _ = GameSession.objects.get_or_create(
            student=request.user,
            status="in_progress",
            defaults={"time_remaining_seconds": 3600},
        )
        badges = StudentBadge.objects.filter(student=request.user)
        return Response(
            {
                "session": GameSessionSerializer(session).data,
                "badges": StudentBadgeSerializer(badges, many=True).data,
            }
        )

    def post(self, request):
        GameSession.objects.filter(student=request.user, status="in_progress").update(
            status="expired", completed_at=timezone.now()
        )
        session = GameSession.objects.create(
            student=request.user,
            status="in_progress",
            time_remaining_seconds=3600,
        )
        return Response(
            {"session": GameSessionSerializer(session).data},
            status=status.HTTP_201_CREATED,
        )


class SubmitPuzzleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = PuzzleSubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        session, _ = GameSession.objects.get_or_create(
            student=request.user,
            status="in_progress",
        )

        stage_code = data["stage_code"]
        puzzle_code = data["puzzle_code"]
        puzzle_key = (stage_code, puzzle_code)

        attempt, _ = PuzzleAttempt.objects.get_or_create(
            session=session,
            stage_code=stage_code,
            puzzle_code=puzzle_code,
        )

        is_correct, feedback = evaluate_answer(puzzle_key, data["answer"])
        attempt.attempts_count += 1
        attempt.time_spent_seconds += data["time_spent_seconds"]
        attempt.submitted_answer = {"value": data["answer"]}

        session.time_remaining_seconds = data["time_remaining_seconds"]
        session.total_time_spent_seconds += data["time_spent_seconds"]

        new_badge = None
        unlocked_clue = None

        if is_correct:
            if not attempt.is_solved:
                rule = PUZZLE_SOLUTIONS[puzzle_key]
                penalty = attempt.errors_count * 25
                earned = max(50, rule["base_score"] - penalty)
                attempt.is_solved = True
                attempt.score_earned = earned
                attempt.solved_at = timezone.now()
                session.total_score += earned

                if rule["clue"]:
                    unlocked_clue = rule["clue"]
                    clues = list(session.unlocked_clues)
                    if not any(c.get("id") == unlocked_clue["id"] for c in clues):
                        clues.append(unlocked_clue)
                        session.unlocked_clues = clues

                # بررسی تکمیل دپارتمان گلوکوکورتیکوئیدها
                if stage_code == "glucocorticoid":
                    gc_solved = PuzzleAttempt.objects.filter(
                        session=session,
                        stage_code="glucocorticoid",
                        is_solved=True,
                    ).count()
                    if gc_solved >= 2:
                        completed = list(session.completed_stages)
                        if "glucocorticoid" not in completed:
                            completed.append("glucocorticoid")
                            session.completed_stages = completed

                        total_gc_errors = sum(
                            PuzzleAttempt.objects.filter(
                                session=session, stage_code="glucocorticoid"
                            ).values_list("errors_count", flat=True)
                        )
                        if total_gc_errors == 0:
                            badge, created = StudentBadge.objects.get_or_create(
                                student=request.user,
                                badge_code="master_glucocorticoids",
                                defaults={
                                    "title": "استاد کورتیکواستروئیدها",
                                    "description": "تکمیل بدون خطای دپارتمان گلوکوکورتیکوئیدها و تحلیل SAR",
                                },
                            )
                            if created:
                                new_badge = StudentBadgeSerializer(badge).data

                if stage_code == "entrance":
                    completed = list(session.completed_stages)
                    if "entrance" not in completed:
                        completed.append("entrance")
                        session.completed_stages = completed
        else:
            attempt.errors_count += 1
            session.total_errors += 1

        attempt.save()
        session.save()

        return Response(
            {
                "correct": is_correct,
                "feedback": feedback,
                "score_earned": attempt.score_earned,
                "unlocked_clue": unlocked_clue,
                "new_badge": new_badge,
                "session": GameSessionSerializer(session).data,
            }
        )


class LeaderboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        top_sessions = (
            GameSession.objects.select_related("student")
            .order_by("-total_score", "total_errors", "total_time_spent_seconds")[:20]
        )
        results = [
            {
                "rank": idx + 1,
                "student_id": s.student.student_id,
                "full_name": s.student.full_name,
                "total_score": s.total_score,
                "total_errors": s.total_errors,
                "time_spent_seconds": s.total_time_spent_seconds,
                "completed_stages_count": len(s.completed_stages),
            }
            for idx, s in enumerate(top_sessions)
        ]
        return Response({"leaderboard": results})
