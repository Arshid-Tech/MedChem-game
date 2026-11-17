import csv
from django.http import HttpResponse
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import MeegaResponse
from .serializers import MeegaResponseSerializer


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
    """خروجی پژوهشی CSV برای اساتید و تیم تحقیق (دموگرافیک + عملکرد بازی + MEEGA+)"""
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
            "best_score",
            "total_errors",
            "time_spent_seconds",
            "usability_score",
            "confidence_score",
            "challenge_score",
            "satisfaction_score",
            "fun_score",
            "focused_attention_score",
            "relevance_score",
            "perceived_learning_score",
        ] + [f"q{i}" for i in range(1, 28)]
        writer.writerow(header)

        responses = MeegaResponse.objects.select_related("student").all()
        for r in responses:
            s = r.student
            best_session = s.game_sessions.order_by("-total_score").first()
            row = [
                s.student_id,
                s.full_name,
                s.age or "",
                s.gender or "",
                s.gaming_frequency or "",
                best_session.total_score if best_session else 0,
                best_session.total_errors if best_session else 0,
                best_session.total_time_spent_seconds if best_session else 0,
                r.usability_score,
                r.confidence_score,
                r.challenge_score,
                r.satisfaction_score,
                r.fun_score,
                r.focused_attention_score,
                r.relevance_score,
                r.perceived_learning_score,
            ] + [r.answers.get(f"q{i}", "") for i in range(1, 28)]
            writer.writerow(row)

        return response
