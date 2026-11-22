from django.conf import settings
from django.db import models


class MeegaResponse(models.Model):
    """
    پرسشنامه استاندارد MEEGA+ (مقیاس لیکرت ۱ تا ۵)
    شامل سوالات ۱ تا ۹ (Usability) و ۱۰ تا ۲۷ (Player Experience)
    """

    student = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="meega_response"
    )
    answers = models.JSONField(
        help_text="دیکشنری کلید-مقدار از q1 تا q27 با مقادیر ۱ تا ۵"
    )
    comments = models.TextField("پیشنهادات و نظرات دانشجو", blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    # شاخص‌های تجمیعی محاسبه‌شده مطابق پروپوزال پژوهشی
    usability_score = models.FloatField(default=0.0)
    confidence_score = models.FloatField(default=0.0)
    challenge_score = models.FloatField(default=0.0)
    satisfaction_score = models.FloatField(default=0.0)
    fun_score = models.FloatField(default=0.0)
    focused_attention_score = models.FloatField(default=0.0)
    relevance_score = models.FloatField(default=0.0)
    perceived_learning_score = models.FloatField(default=0.0)

    class Meta:
        verbose_name = "پاسخ پرسشنامه MEEGA+"
        verbose_name_plural = "پاسخ‌های پرسشنامه MEEGA+"

    def calculate_subscales(self):
        def avg(keys):
            vals = [float(self.answers.get(k, 0)) for k in keys if k in self.answers]
            return round(sum(vals) / len(vals), 2) if vals else 0.0

        self.usability_score = avg([f"q{i}" for i in range(1, 10)])
        self.confidence_score = avg(["q10"])
        self.challenge_score = avg(["q11", "q12", "q13"])
        self.satisfaction_score = avg(["q14", "q15", "q16", "q17"])
        self.fun_score = avg(["q18", "q19", "q20", "q21"])
        self.focused_attention_score = avg(["q21", "q22", "q23"])
        self.relevance_score = avg(["q23", "q24", "q25", "q26"])
        self.perceived_learning_score = avg(["q26", "q27"])

    def save(self, *args, **kwargs):
        if isinstance(self.answers, dict):
            self.calculate_subscales()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"MEEGA+ | {self.student.full_name} ({self.student.student_id})"


class KnowledgeAssessment(models.Model):
    """
    ماژول پیش‌آزمون و پس‌آزمون (Pre-test / Post-test) برای اندازه‌گیری دقیق رشد یادگیری
    مباحث شیمی دارویی استروئیدها پیش و پس از انجام بازی.
    """

    PHASE_CHOICES = (
        ("pre", "پیش‌آزمون"),
        ("post", "پس‌آزمون"),
    )

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="knowledge_assessments",
    )
    phase = models.CharField("مرحله آزمون", max_length=10, choices=PHASE_CHOICES)
    answers = models.JSONField(default=dict)
    score = models.PositiveSmallIntegerField(default=0)
    total_questions = models.PositiveSmallIntegerField(default=5)
    percentage = models.FloatField(default=0.0)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "ارزیابی دانش (پیش/پس‌آزمون)"
        verbose_name_plural = "ارزیابی‌های دانش (پیش/پس‌آزمون)"
        unique_together = ("student", "phase")

    def __str__(self):
        return f"{self.get_phase_display()} | {self.student.full_name} ({self.score}/{self.total_questions})"
