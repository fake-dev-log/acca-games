package number_pressing

import (
	"acca-games/types"
	"reflect"
	"sort"
	"testing"
)

func TestGenerateProblems(t *testing.T) {
	t.Run("Generates correct number of problems for both rounds", func(t *testing.T) {
		setup := types.NumberPressingSetup{
			Rounds:           []int{1, 2},
			ProblemsPerRound: 5,
		}
		r1, r2 := GenerateProblems(setup)
		if len(r1) != 5 {
			t.Errorf("Expected 5 problems for round 1, got %d", len(r1))
		}
		if len(r2) != 5 {
			t.Errorf("Expected 5 problems for round 2, got %d", len(r2))
		}
	})

	t.Run("Generates problems only for specified rounds", func(t *testing.T) {
		setup := types.NumberPressingSetup{
			Rounds:           []int{2},
			ProblemsPerRound: 10,
		}
		r1, r2 := GenerateProblems(setup)
		if len(r1) != 0 {
			t.Errorf("Expected 0 problems for round 1, got %d", len(r1))
		}
		if len(r2) != 10 {
			t.Errorf("Expected 10 problems for round 2, got %d", len(r2))
		}
	})

	t.Run("Round 2 problems have no overlapping numbers in DoubleClick and Skip", func(t *testing.T) {
		setup := types.NumberPressingSetup{
			Rounds:           []int{2},
			ProblemsPerRound: 20, // Generate a good number to be sure
		}
		_, r2 := GenerateProblems(setup)
		for i, p := range r2 {
			seen := make(map[int]bool)
			for _, d := range p.DoubleClick {
				seen[d] = true
			}
			for _, s := range p.Skip {
				if seen[s] {
					t.Errorf("Problem %d: Number %d is in both DoubleClick and Skip lists", i, s)
				}
			}
		}
	})
}

func TestCalculateCorrectClicksR2(t *testing.T) {
	testCases := []struct {
		name     string
		problem  types.NumberPressingProblemR2
		expected []int
	}{
		{
			name: "No double click, no skip",
			problem: types.NumberPressingProblemR2{
				DoubleClick: []int{},
				Skip:        []int{},
			},
			expected: []int{1, 2, 3, 4, 5, 6, 7, 8, 9},
		},
		{
			name: "One double click",
			problem: types.NumberPressingProblemR2{
				DoubleClick: []int{5},
				Skip:        []int{},
			},
			expected: []int{1, 2, 3, 4, 5, 5, 6, 7, 8, 9},
		},
		{
			name: "One skip",
			problem: types.NumberPressingProblemR2{
				DoubleClick: []int{},
				Skip:        []int{3},
			},
			expected: []int{1, 2, 4, 5, 6, 7, 8, 9},
		},
		{
			name: "Multiple double clicks and skips",
			problem: types.NumberPressingProblemR2{
				DoubleClick: []int{2, 8},
				Skip:        []int{4, 6},
			},
			expected: []int{1, 2, 2, 3, 5, 7, 8, 8, 9},
		},
		{
			name: "Edge cases: skip 1 and 9",
			problem: types.NumberPressingProblemR2{
				DoubleClick: []int{5},
				Skip:        []int{1, 9},
			},
			expected: []int{2, 3, 4, 5, 5, 6, 7, 8},
		},
		{
			name: "Edge cases: double click 1 and 9",
			problem: types.NumberPressingProblemR2{
				DoubleClick: []int{1, 9},
				Skip:        []int{5},
			},
			expected: []int{1, 1, 2, 3, 4, 6, 7, 8, 9, 9},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			// The problem's slices might not be sorted, but the function expects them to be.
			sort.Ints(tc.problem.DoubleClick)
			sort.Ints(tc.problem.Skip)
			
			actual := CalculateCorrectClicksR2(tc.problem)
			if !reflect.DeepEqual(actual, tc.expected) {
				t.Errorf("Expected correct clicks %v, but got %v", tc.expected, actual)
			}
		})
	}
}
