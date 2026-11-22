from django.test import SimpleTestCase

from .serializers import MeegaResponseSerializer, KnowledgeAssessmentSerializer


class MeegaResponseSerializerTests(SimpleTestCase):
    def test_requires_all_27_answers(self):
        serializer = MeegaResponseSerializer(data={"answers": {"q1": 4}})

        self.assertFalse(serializer.is_valid())
        self.assertIn("answers", serializer.errors)

    def test_rejects_scores_outside_likert_scale(self):
        answers = {f"q{i}": 3 for i in range(1, 28)}
        answers["q12"] = 6
        serializer = MeegaResponseSerializer(data={"answers": answers})

        self.assertFalse(serializer.is_valid())
        self.assertIn("answers", serializer.errors)

    def test_accepts_complete_likert_responses(self):
        answers = {f"q{i}": 3 for i in range(1, 28)}
        serializer = MeegaResponseSerializer(data={"answers": answers})

        self.assertTrue(serializer.is_valid(), serializer.errors)


class KnowledgeAssessmentSerializerTests(SimpleTestCase):
    def test_requires_all_five_questions(self):
        serializer = KnowledgeAssessmentSerializer(
            data={"phase": "pre", "answers": {"k1": "b"}}
        )
        self.assertFalse(serializer.is_valid())
        self.assertIn("answers", serializer.errors)

    def test_accepts_valid_pre_and_post_assessment(self):
        serializer = KnowledgeAssessmentSerializer(
            data={
                "phase": "post",
                "answers": {"k1": "b", "k2": "c", "k3": "a", "k4": "d", "k5": "b"},
            }
        )
        self.assertTrue(serializer.is_valid(), serializer.errors)
