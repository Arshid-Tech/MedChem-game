from django.test import SimpleTestCase

from .views import DEPARTMENT_REQUIRED_COUNT, evaluate_answer


class AddedContentPuzzleTests(SimpleTestCase):
    def test_estrogen_potency_treats_the_tied_compounds_as_equal(self):
        self.assertEqual(
            evaluate_answer(
                ("estrogen", "estrogen_potency_sort"),
                ["3", "1", "2", "4"],
            )[0],
            True,
        )
        self.assertEqual(
            evaluate_answer(
                ("estrogen", "estrogen_potency_sort"),
                ["3", "2", "1", "4"],
            )[0],
            True,
        )
        self.assertEqual(
            evaluate_answer(
                ("estrogen", "estrogen_potency_sort"),
                ["3", "1", "4", "2"],
            )[0],
            False,
        )

    def test_estrogen_design_and_classification_scenes_are_server_checked(self):
        self.assertTrue(
            evaluate_answer(
                ("estrogen", "oral_long_acting_design"),
                ["add_17alpha_ethynyl", "methylate_3_hydroxyl"],
            )[0]
        )
        self.assertTrue(
            evaluate_answer(
                ("estrogen", "estrogen_drug_classification"),
                {
                    "serm": "B",
                    "pure_antiestrogen": "C",
                    "steroid_aromatase_inhibitor": "A",
                    "non_steroid_aromatase_inhibitor": "D",
                },
            )[0]
        )
        self.assertTrue(
            evaluate_answer(
                ("estrogen", "active_metabolite_prevention"),
                "prevent_active_metabolite",
            )[0]
        )

    def test_estrogen_metabolism_requires_structure_positions_and_enzymes(self):
        complete_answer = {
            "top_horizontal": "Estradiol dehydrogenase",
            "bottom_horizontal": "Estradiol dehydrogenase",
            "left_vertical": "16a-hydroxylase",
            "right_vertical": "16a-hydroxylase",
            "structure_positions": {
                "estradiol": "1",
                "estrone": "2",
                "estriol": "3",
                "hydroxyestrone": "4",
            },
        }
        self.assertTrue(
            evaluate_answer(("estrogen", "metabolism_enzymes"), complete_answer)[0]
        )
        complete_answer["structure_positions"]["estriol"] = ""
        self.assertFalse(
            evaluate_answer(("estrogen", "metabolism_enzymes"), complete_answer)[0]
        )

    def test_androgen_content_scenes_are_server_checked(self):
        self.assertTrue(
            evaluate_answer(
                ("androgen", "androgen_entry_potency_sort"),
                ["3", "2", "1", "4"],
            )[0]
        )
        self.assertTrue(
            evaluate_answer(("androgen", "sarm_alternative"), "10")[0]
        )
        self.assertTrue(
            evaluate_answer(
                ("androgen", "low_androgenicity_design"),
                ["remove_androgenic_features", "add_low_androgenic_features"],
            )[0]
        )

    def test_hidden_room_mapping_is_a_separate_required_final_puzzle(self):
        self.assertTrue(
            evaluate_answer(
                ("final", "hidden_room_classification"),
                {
                    "1": "glucocorticoid",
                    "2": "mineralocorticoid",
                    "3": "androgen",
                    "4": "progesterone",
                    "5": "estrogen",
                },
            )[0]
        )
        self.assertEqual(DEPARTMENT_REQUIRED_COUNT["estrogen"], 6)
        self.assertEqual(DEPARTMENT_REQUIRED_COUNT["androgen"], 6)
        self.assertEqual(DEPARTMENT_REQUIRED_COUNT["final"], 3)
