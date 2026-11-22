from django.contrib import admin
from .models import MeegaResponse, KnowledgeAssessment


@admin.register(MeegaResponse)
class MeegaResponseAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "usability_score",
        "perceived_learning_score",
        "fun_score",
        "satisfaction_score",
        "submitted_at",
    )
    search_fields = ("student__student_id", "student__full_name")


@admin.register(KnowledgeAssessment)
class KnowledgeAssessmentAdmin(admin.ModelAdmin):
    list_display = ("student", "phase", "score", "total_questions", "percentage", "submitted_at")
    list_filter = ("phase",)
    search_fields = ("student__student_id", "student__full_name")
