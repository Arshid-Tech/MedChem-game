from rest_framework import serializers
from .models import MeegaResponse


class MeegaResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeegaResponse
        fields = (
            "id",
            "answers",
            "comments",
            "usability_score",
            "confidence_score",
            "challenge_score",
            "satisfaction_score",
            "fun_score",
            "focused_attention_score",
            "relevance_score",
            "perceived_learning_score",
            "submitted_at",
        )
        read_only_fields = (
            "id",
            "usability_score",
            "confidence_score",
            "challenge_score",
            "satisfaction_score",
            "fun_score",
            "focused_attention_score",
            "relevance_score",
            "perceived_learning_score",
            "submitted_at",
        )

    def validate_answers(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("فرمت پاسخ‌ها باید دیکشنری باشد.")
        for key, score in value.items():
            if not isinstance(score, (int, float)) or not (1 <= score <= 5):
                raise serializers.ValidationError(f"امتیاز سوال {key} باید بین ۱ تا ۵ باشد.")
        return value
