from django.test import SimpleTestCase

from .serializers import MeegaResponseSerializer


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
