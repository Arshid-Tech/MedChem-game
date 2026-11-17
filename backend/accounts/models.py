from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class StudentUserManager(BaseUserManager):
    def create_user(self, student_id, full_name, password=None, **extra_fields):
        if not student_id:
            raise ValueError("شماره دانشجویی الزامی است.")
        if not full_name:
            raise ValueError("نام و نام خانوادگی الزامی است.")

        student_id = str(student_id).strip()
        user = self.model(
            student_id=student_id,
            full_name=full_name.strip(),
            **extra_fields,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, student_id, full_name, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        return self.create_user(student_id, full_name, password, **extra_fields)


class StudentUser(AbstractBaseUser, PermissionsMixin):
    GENDER_CHOICES = (
        ("male", "مرد"),
        ("female", "زن"),
        ("other", "ترجیح می‌دهم نگویم"),
    )

    student_id = models.CharField("شماره دانشجویی", max_length=32, unique=True)
    full_name = models.CharField("نام و نام خانوادگی", max_length=150)
    age = models.PositiveSmallIntegerField("سن", null=True, blank=True)
    gender = models.CharField("جنسیت", max_length=16, choices=GENDER_CHOICES, blank=True)
    gaming_frequency = models.PositiveSmallIntegerField(
        "تواتر استفاده از بازی (ساعت در هفته)", null=True, blank=True
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    objects = StudentUserManager()

    USERNAME_FIELD = "student_id"
    REQUIRED_FIELDS = ["full_name"]

    class Meta:
        verbose_name = "دانشجو"
        verbose_name_plural = "دانشجویان"

    def __str__(self):
        return f"{self.full_name} ({self.student_id})"
