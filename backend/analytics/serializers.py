from rest_framework import serializers
from .models import MeegaResponse, KnowledgeAssessment


ASSESSMENT_ANSWER_KEY = {
    "k1": "b",
    "k2": "c",
    "k3": "a",
    "k4": "d",
    "k5": "b",
}


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
        expected_keys = {f"q{i}" for i in range(1, 28)}
        missing_keys = expected_keys - set(value)
        unexpected_keys = set(value) - expected_keys
        if missing_keys:
            raise serializers.ValidationError(
                "لطفاً به همه ۲۷ پرسش MEEGA+ پاسخ دهید."
            )
        if unexpected_keys:
            raise serializers.ValidationError("پاسخی برای پرسش نامعتبر ارسال شده است.")
        for key, score in value.items():
            if type(score) is not int or not (1 <= score <= 5):
                raise serializers.ValidationError(f"امتیاز سوال {key} باید بین ۱ تا ۵ باشد.")
        return value


class KnowledgeAssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = KnowledgeAssessment
        fields = (
            "id",
            "phase",
            "answers",
            "score",
            "total_questions",
            "percentage",
            "submitted_at",
        )
        read_only_fields = ("id", "score", "total_questions", "percentage", "submitted_at")

    def validate_answers(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("فرمت پاسخ‌های آزمون نامعتبر است.")
        expected = set(ASSESSMENT_ANSWER_KEY.keys())
        if set(value.keys()) != expected:
            raise serializers.ValidationError("لطفاً به هر ۵ سوال آزمون پاسخ دهید.")
        for k, v in value.items():
            if v not in ("a", "b", "c", "d"):
                raise serializers.ValidationError(f"گزینه انتخاب‌شده برای سوال {k} نامعتبر است.")
        return value
