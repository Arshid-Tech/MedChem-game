from django.urls import path
from .views import SubmitMeegaView, KnowledgeAssessmentView, ExportResearchCsvView

urlpatterns = [
    path("meega/", SubmitMeegaView.as_view(), name="submit_meega"),
    path("assessment/", KnowledgeAssessmentView.as_view(), name="knowledge_assessment"),
    path("export-csv/", ExportResearchCsvView.as_view(), name="export_research_csv"),
]
