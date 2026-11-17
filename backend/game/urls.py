from django.urls import path
from .views import ActiveSessionView, SubmitPuzzleView, LeaderboardView

urlpatterns = [
    path("session/", ActiveSessionView.as_view(), name="game_session"),
    path("submit/", SubmitPuzzleView.as_view(), name="game_submit"),
    path("leaderboard/", LeaderboardView.as_view(), name="game_leaderboard"),
]
