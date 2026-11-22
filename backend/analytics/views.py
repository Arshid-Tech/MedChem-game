import csv
from django.contrib.auth import get_user_model
from django.http import HttpResponse
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import MeegaResponse
from .serializers import MeegaResponseSerializer

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


class ExportResearchCsvView(APIView):
    """خروجی پژوهشی CSV برای اساتید و تیم تحقیق (تمامی دانشجویان: دموگرافیک + عملکرد بازی + MEEGA+)"""

    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        response = HttpResponse(content_type="text/csv; charset=utf-8-sig")
        response["Content-Disposition"] = 'attachment; filename="medchem_research_export.csv"'

        writer = csv.writer(response)
        header = [
            "student_id",
            "full_name",
            "age",
            "gender",
            "gaming_frequency",
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
            .prefetch_related("game_sessions")
            .select_related("meega_response")
            .order_by("student_id")
        )
        for s in students:
            best_session = s.game_sessions.order_by("-total_score", "total_errors").first()
            r = getattr(s, "meega_response", None)
            row = [
                s.student_id,
                s.full_name,
                s.age if s.age is not None else "",
                s.gender or "",
                s.gaming_frequency if s.gaming_frequency is not None else "",
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
