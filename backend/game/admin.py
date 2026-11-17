from django.contrib import admin
from .models import GameSession, PuzzleAttempt, StudentBadge


@admin.register(GameSession)
class GameSessionAdmin(admin.ModelAdmin):
    list_display = (
        "student",
        "status",
        "total_score",
        "total_errors",
        "total_time_spent_seconds",
        "started_at",
    )
    list_filter = ("status",)
    search_fields = ("student__student_id", "student__full_name")


@admin.register(PuzzleAttempt)
class PuzzleAttemptAdmin(admin.ModelAdmin):
    list_display = (
        "session",
        "stage_code",
        "puzzle_code",
        "is_solved",
        "attempts_count",
        "errors_count",
        "time_spent_seconds",
        "score_earned",
    )
    list_filter = ("stage_code", "is_solved")


@admin.register(StudentBadge)
class StudentBadgeAdmin(admin.ModelAdmin):
    list_display = ("student", "badge_code", "title", "earned_at")
