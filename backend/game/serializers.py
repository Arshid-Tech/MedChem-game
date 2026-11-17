from rest_framework import serializers
from .models import GameSession, PuzzleAttempt, StudentBadge


class PuzzleAttemptSerializer(serializers.ModelSerializer):
    class Meta:
        model = PuzzleAttempt
        fields = (
            "id",
            "stage_code",
            "puzzle_code",
            "is_solved",
            "attempts_count",
            "errors_count",
            "time_spent_seconds",
            "score_earned",
            "solved_at",
        )


class StudentBadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentBadge
        fields = ("badge_code", "title", "description", "earned_at")


class GameSessionSerializer(serializers.ModelSerializer):
    puzzle_attempts = PuzzleAttemptSerializer(many=True, read_only=True)
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    student_id = serializers.CharField(source="student.student_id", read_only=True)

    class Meta:
        model = GameSession
        fields = (
            "id",
            "student_id",
            "student_name",
            "status",
            "total_score",
            "total_errors",
            "time_remaining_seconds",
            "total_time_spent_seconds",
            "unlocked_clues",
            "completed_stages",
            "started_at",
            "completed_at",
            "puzzle_attempts",
        )


class PuzzleSubmitSerializer(serializers.Serializer):
    stage_code = serializers.CharField(max_length=50)
    puzzle_code = serializers.CharField(max_length=50)
    answer = serializers.JSONField()
    time_spent_seconds = serializers.IntegerField(min_value=0, default=0)
    time_remaining_seconds = serializers.IntegerField(min_value=0, default=3600)
