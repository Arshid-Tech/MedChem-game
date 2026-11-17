from django.conf import settings
from django.db import models


class GameSession(models.Model):
    STATUS_CHOICES = (
        ("in_progress", "در حال انجام"),
        ("completed", "تکمیل شده"),
        ("expired", "پایان زمان"),
    )

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="game_sessions"
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="in_progress")
    total_score = models.IntegerField(default=0)
    total_errors = models.PositiveIntegerField(default=0)
    time_remaining_seconds = models.IntegerField(default=3600)
    total_time_spent_seconds = models.PositiveIntegerField(default=0)
    unlocked_clues = models.JSONField(default=list)
    completed_stages = models.JSONField(default=list)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "جلسه بازی"
        verbose_name_plural = "جلسات بازی"
        ordering = ["-total_score", "total_time_spent_seconds"]

    def __str__(self):
        return f"{self.student.full_name} - امتیاز: {self.total_score}"


class PuzzleAttempt(models.Model):
    session = models.ForeignKey(
        GameSession, on_delete=models.CASCADE, related_name="puzzle_attempts"
    )
    stage_code = models.CharField(max_length=50)
    puzzle_code = models.CharField(max_length=50)
    is_solved = models.BooleanField(default=False)
    attempts_count = models.PositiveIntegerField(default=0)
    errors_count = models.PositiveIntegerField(default=0)
    time_spent_seconds = models.PositiveIntegerField(default=0)
    score_earned = models.IntegerField(default=0)
    submitted_answer = models.JSONField(default=dict, blank=True)
    solved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        verbose_name = "تلاش معما"
        verbose_name_plural = "تلاش‌های معما"
        unique_together = ("session", "stage_code", "puzzle_code")

    def __str__(self):
        return f"{self.session.student.student_id} | {self.stage_code}:{self.puzzle_code}"


class StudentBadge(models.Model):
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="badges"
    )
    badge_code = models.CharField(max_length=50)
    title = models.CharField(max_length=120)
    description = models.TextField(blank=True)
    earned_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "نشان افتخار"
        verbose_name_plural = "نشان‌های افتخار"
        unique_together = ("student", "badge_code")

    def __str__(self):
        return f"{self.student.full_name} - {self.title}"
