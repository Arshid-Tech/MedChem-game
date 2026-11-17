from django.urls import path
from .views import SubmitMeegaView, ExportResearchCsvView

urlpatterns = [
    path("meega/", SubmitMeegaView.as_view(), name="submit_meega"),
    path("export-csv/", ExportResearchCsvView.as_view(), name="export_research_csv"),
]
