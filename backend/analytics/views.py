import csv
from django.contrib.auth import get_user_model
from django.http import HttpResponse
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import MeegaResponse, KnowledgeAssessment
from .serializers import (
    ASSESSMENT_ANSWER_KEY,
    MeegaResponseSerializer,
    KnowledgeAssessmentSerializer,
)

StudentUser = get_user_model()


class SubmitMeegaView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        existing = MeegaResponse.objects.filter(student=request.user).first()
        if not existing:
            return Response({"submitted": False, "data": None})
        return Response({"submitted": True, "data": MeegaResponseSerializer(existing).data})

    def post(self, request):
        existing = MeegaResponse.objects.filter(student=request.user).first()
        if existing:
            serializer = MeegaResponseSerializer(existing, data=request.data, partial=True)
        else:
            serializer = MeegaResponseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = serializer.save(student=request.user)
        return Response(
            {"submitted": True, "data": MeegaResponseSerializer(instance).data},
            status=status.HTTP_201_CREATED,
        )


class KnowledgeAssessmentView(APIView):
    """دریافت وضعیت و ثبت پیش‌آزمون (pre) و پس‌آزمون (post) شیمی دارویی"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        pre = KnowledgeAssessment.objects.filter(student=request.user, phase="pre").first()
        post = KnowledgeAssessment.objects.filter(student=request.user, phase="post").first()
        return Response(
            {
                "pre": KnowledgeAssessmentSerializer(pre).data if pre else None,
                "post": KnowledgeAssessmentSerializer(post).data if post else None,
            }
        )

    def post(self, request):
        serializer = KnowledgeAssessmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phase = serializer.validated_data["phase"]
        answers = serializer.validated_data["answers"]

        total = len(ASSESSMENT_ANSWER_KEY)
        score = sum(1 for k, expected in ASSESSMENT_ANSWER_KEY.items() if answers.get(k) == expected)
        percentage = round((score / total) * 100, 1) if total else 0.0

        instance, _ = KnowledgeAssessment.objects.update_or_create(
            student=request.user,
            phase=phase,
            defaults={
                "answers": answers,
                "score": score,
                "total_questions": total,
                "percentage": percentage,
            },
        )
        return Response(
            {
                "assessment": KnowledgeAssessmentSerializer(instance).data,
                "answer_key": ASSESSMENT_ANSWER_KEY if phase == "post" else None,
            },
            status=status.HTTP_201_CREATED,
        )


class ExportResearchCsvView(APIView):
    """خروجی پژوهشی CSV برای اساتید و تیم تحقیق (دموگرافیک + پیش/پس‌آزمون + عملکرد بازی + MEEGA+)"""

    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        response = HttpResponse(content_type="text/csv; charset=utf-8-sig")
        response["Content-Disposition"] = 'attachment; filename="pharmacochem_research_export.csv"'

        writer = csv.writer(response)
        header = [
            "student_id",
            "full_name",
            "age",
            "gender",
            "gaming_frequency",
            "pre_test_score",
            "pre_test_percent",
            "post_test_score",
            "post_test_percent",
            "learning_gain_percent",
            "session_status",
            "completed_stages_count",
            "best_score",
            "total_errors",
            "time_spent_seconds",
            "meega_submitted",
            "usability_score",
            "confidence_score",
            "challenge_score",
            "satisfaction_score",
            "fun_score",
            "focused_attention_score",
            "relevance_score",
            "perceived_learning_score",
            "comments",
        ] + [f"q{i}" for i in range(1, 28)]
        writer.writerow(header)

        students = (
            StudentUser.objects.filter(is_staff=False)
            .prefetch_related("game_sessions", "knowledge_assessments")
            .select_related("meega_response")
            .order_by("student_id")
        )
        for s in students:
            best_session = s.game_sessions.order_by("-total_score", "total_errors").first()
            r = getattr(s, "meega_response", None)
            assessments = {a.phase: a for a in s.knowledge_assessments.all()}
            pre = assessments.get("pre")
            post = assessments.get("post")
            gain = (
                round(post.percentage - pre.percentage, 1)
                if pre is not None and post is not None
                else ""
            )

            row = [
                s.student_id,
                s.full_name,
                s.age if s.age is not None else "",
                s.gender or "",
                s.gaming_frequency if s.gaming_frequency is not None else "",
                pre.score if pre else "",
                pre.percentage if pre else "",
                post.score if post else "",
                post.percentage if post else "",
                gain,
                best_session.status if best_session else "not_started",
                len(best_session.completed_stages) if best_session else 0,
                best_session.total_score if best_session else 0,
                best_session.total_errors if best_session else 0,
                best_session.total_time_spent_seconds if best_session else 0,
                "yes" if r else "no",
                r.usability_score if r else "",
                r.confidence_score if r else "",
                r.challenge_score if r else "",
                r.satisfaction_score if r else "",
                r.fun_score if r else "",
                r.focused_attention_score if r else "",
                r.relevance_score if r else "",
                r.perceived_learning_score if r else "",
                r.comments if r else "",
            ] + [r.answers.get(f"q{i}", "") if r else "" for i in range(1, 28)]
            writer.writerow(row)

        return response
