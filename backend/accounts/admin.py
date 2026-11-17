from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import StudentUser


@admin.register(StudentUser)
class StudentUserAdmin(UserAdmin):
    model = StudentUser
    list_display = ("student_id", "full_name", "age", "gender", "is_staff", "date_joined")
    list_filter = ("gender", "is_staff", "is_active")
    search_fields = ("student_id", "full_name")
    ordering = ("-date_joined",)

    fieldsets = (
        (None, {"fields": ("student_id", "password")}),
        ("اطلاعات دانشجو", {"fields": ("full_name", "age", "gender", "gaming_frequency")}),
        ("دسترسی‌ها", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("student_id", "full_name", "password1", "password2", "is_staff", "is_active"),
            },
        ),
    )
