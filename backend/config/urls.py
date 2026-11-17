from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health_check(request):
    return JsonResponse({"status": "ok", "project": "Pharmacochem Crisis API"})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/health/", health_check, name="health_check"),
    path("api/auth/", include("accounts.urls")),
    path("api/game/", include("game.urls")),
    path("api/analytics/", include("analytics.urls")),
]
