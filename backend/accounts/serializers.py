from django.contrib.auth import authenticate
from rest_framework import serializers
from .models import StudentUser


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = StudentUser
        fields = ("student_id", "full_name", "password", "age", "gender", "gaming_frequency")

    def create(self, validated_data):
        return StudentUser.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    student_id = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        student_id = str(attrs.get("student_id", "")).strip()
        password = attrs.get("password")
        user = authenticate(username=student_id, password=password)
        if not user:
            raise serializers.ValidationError("شماره دانشجویی یا رمز عبور نادرست است.")
        if not user.is_active:
            raise serializers.ValidationError("حساب کاربری غیرفعال است.")
        attrs["user"] = user
        return attrs


class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentUser
        fields = ("id", "student_id", "full_name", "age", "gender", "gaming_frequency", "date_joined")
        read_only_fields = ("id", "student_id", "date_joined")


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("رمز عبور فعلی صحیح نیست.")
        return value
