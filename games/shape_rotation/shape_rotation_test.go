package shape_rotation

import (
	"math"
	"testing"
)

func TestVerifySolution_Round1_Correct(t *testing.T) {
	initialShapePath := canonicalShapes["P"]
	correctSolution := []string{"rotate_right_45"}

	// Dynamically generate the final shape using the same logic as GetProblems
	initialPoints := ParseShapeToPoints(initialShapePath)
	finalPoints := ApplyTransformationsToPoints(initialPoints, correctSolution)
	finalShapePath := pointsToPathString(finalPoints)

	problem := ShapeRotationProblemWithFinalShape{
		ID:           1,
		Round:        1,
		InitialShape: initialShapePath,
		FinalShape:   finalShapePath,
		MinMoves:     1,
		Solution:     correctSolution,
	}

	if !VerifySolution(problem, correctSolution) {
		t.Errorf("Round 1 Test_Correct: Expected solution to be correct, but it was not.")
	}
}

func TestVerifySolution_Round1_Incorrect(t *testing.T) {
	initialShapePath := canonicalShapes["P"]
	correctSolution := []string{"rotate_right_45"}
	incorrectSolution := []string{"rotate_left_45"}

	// Dynamically generate the final shape based on the *correct* solution
	initialPoints := ParseShapeToPoints(initialShapePath)
	finalPoints := ApplyTransformationsToPoints(initialPoints, correctSolution)
	finalShapePath := pointsToPathString(finalPoints)

	problem := ShapeRotationProblemWithFinalShape{
		ID:           1,
		Round:        1,
		InitialShape: initialShapePath,
		FinalShape:   finalShapePath,
		MinMoves:     1,
		Solution:     correctSolution,
	}

	if VerifySolution(problem, incorrectSolution) {
		t.Errorf("Round 1 Test_Incorrect: Expected solution to be incorrect, but it was correct.")
	}
}

func TestVerifySolution_Round2_Correct(t *testing.T) {
	// Use the first problem from the predefined GridProblems
	gridProblem := GridProblems[0] // ID: 10, InitialShape: "0110/0110/0110/1110" (Boot shape)

	// Define a specific solution and minMoves for this test case
	correctSolution := []string{"rotate_right_45", "flip_horizontal"}
	minMoves := 2

	// Generate the problem dynamically to get the final shape
	initialPoints, _ := ParseGridToCornerPoints(gridProblem.InitialShape)
	gridCenter := float64(GridSize*CellSize) / 2
	finalPoints := ApplyTransformationsToPoints(initialPoints, correctSolution, gridCenter, gridCenter)
	finalShapePath := pointsToPathString(finalPoints)

	problem := ShapeRotationProblemWithFinalShape{
		ID:           gridProblem.ID,
		Round:        2,
		InitialShape: "", // Not used by VerifySolution for Round 2
		FinalShape:   finalShapePath,
		MinMoves:     minMoves,
		Solution:     correctSolution,
	}

	if !VerifySolution(problem, correctSolution) {
		t.Errorf("Round 2 Test_Correct: Expected solution to be correct, but it was not.")
	}
}

func TestVerifySolution_Round2_Incorrect(t *testing.T) {
	gridProblem := GridProblems[0] // ID: 10, InitialShape: "0110/0110/0110/1110" (Boot shape)

	// Define a specific correct solution and minMoves for this test case
	correctSolution := []string{"rotate_right_45", "flip_horizontal"}
	minMoves := 2
	incorrectSolution := []string{"rotate_left_45"} // Still an incorrect solution

	initialPoints, _ := ParseGridToCornerPoints(gridProblem.InitialShape)
	gridCenter := float64(GridSize*CellSize) / 2
	finalPoints := ApplyTransformationsToPoints(initialPoints, correctSolution, gridCenter, gridCenter)
	finalShapePath := pointsToPathString(finalPoints)

	problem := ShapeRotationProblemWithFinalShape{
		ID:         gridProblem.ID,
		Round:      2,
		FinalShape: finalShapePath,
		MinMoves:   minMoves,
	}

	if VerifySolution(problem, incorrectSolution) {
		t.Errorf("Round 2 Test_Incorrect: Expected solution to be incorrect, but it was correct.")
	}
}

func TestVerifySolution_TooManyMoves(t *testing.T) {
	problem := ShapeRotationProblemWithFinalShape{
		MinMoves: 2,
	}
	longSolution := []string{"rotate_right_45", "flip_horizontal", "rotate_left_45"}

	if VerifySolution(problem, longSolution) {
		t.Errorf("TooManyMoves: Expected solution to be incorrect due to move count, but it was accepted.")
	}
}

func TestApplyTransformations(t *testing.T) {
	// A simple square from (0,0) to (10,10)
	initialPoints := []Point{
		{X: 0, Y: 0}, {X: 10, Y: 0},
		{X: 10, Y: 0}, {X: 10, Y: 10},
		{X: 10, Y: 10}, {X: 0, Y: 10},
		{X: 0, Y: 10}, {X: 0, Y: 0},
	}
	// Center of the square is (5,5)

	t.Run("Rotate Right 45", func(t *testing.T) {
		// Expected points for a square rotated 45 degrees around its center (5,5)
		expectedPoints := []Point{
			{X: 5, Y: 5 - 5*math.Sqrt(2)}, {X: 5 + 5*math.Sqrt(2), Y: 5}, // Rotated top-left and top-right
			{X: 5 + 5*math.Sqrt(2), Y: 5}, {X: 5, Y: 5 + 5*math.Sqrt(2)},
			{X: 5, Y: 5 + 5*math.Sqrt(2)}, {X: 5 - 5*math.Sqrt(2), Y: 5},
			{X: 5 - 5*math.Sqrt(2), Y: 5}, {X: 5, Y: 5 - 5*math.Sqrt(2)},
		}
		transformed := ApplyTransformationsToPoints(initialPoints, []string{"rotate_right_45"}, 5, 5)
		if !ComparePointSets(expectedPoints, transformed) {
			t.Errorf("rotate_right_45 transformation was incorrect.\nExpected: %v\nGot: %v", expectedPoints, transformed)
		}
	})

	t.Run("Flip Horizontal", func(t *testing.T) {
		// Expected points for a square flipped horizontally around its center (5,5)
		// (0,0) -> (10,0), (10,10) -> (0,10)
		expectedPoints := []Point{
			{X: 10, Y: 0}, {X: 0, Y: 0},
			{X: 0, Y: 0}, {X: 0, Y: 10},
			{X: 0, Y: 10}, {X: 10, Y: 10},
			{X: 10, Y: 10}, {X: 10, Y: 0},
		}
		transformed := ApplyTransformationsToPoints(initialPoints, []string{"flip_horizontal"}, 5, 5)
		if !ComparePointSets(expectedPoints, transformed) {
			t.Errorf("flip_horizontal transformation was incorrect.\nExpected: %v\nGot: %v", expectedPoints, transformed)
		}
	})

	t.Run("Flip Vertical", func(t *testing.T) {
		// Expected points for a square flipped vertically around its center (5,5)
		// (0,0) -> (0,10), (10,0) -> (10,10)
		expectedPoints := []Point{
			{X: 0, Y: 10}, {X: 10, Y: 10},
			{X: 10, Y: 10}, {X: 10, Y: 0},
			{X: 10, Y: 0}, {X: 0, Y: 0},
			{X: 0, Y: 0}, {X: 0, Y: 10},
		}
		transformed := ApplyTransformationsToPoints(initialPoints, []string{"flip_vertical"}, 5, 5)
		if !ComparePointSets(expectedPoints, transformed) {
			t.Errorf("flip_vertical transformation was incorrect.\nExpected: %v\nGot: %v", expectedPoints, transformed)
		}
	})

	t.Run("Sequence of transformations", func(t *testing.T) {
		// Rotate right, then flip horizontal
		// Applying flip_horizontal to the rotated points
		expectedPoints := []Point{
			{X: 5, Y: 5 - 5*math.Sqrt(2)}, {X: 5 - 5*math.Sqrt(2), Y: 5},
			{X: 5 - 5*math.Sqrt(2), Y: 5}, {X: 5, Y: 5 + 5*math.Sqrt(2)},
			{X: 5, Y: 5 + 5*math.Sqrt(2)}, {X: 5 + 5*math.Sqrt(2), Y: 5},
			{X: 5 + 5*math.Sqrt(2), Y: 5}, {X: 5, Y: 5 - 5*math.Sqrt(2)},
		}
		transformed := ApplyTransformationsToPoints(initialPoints, []string{"rotate_right_45", "flip_horizontal"}, 5, 5)
		if !ComparePointSets(expectedPoints, transformed) {
			t.Errorf("Sequence transformation was incorrect.\nExpected: %v\nGot: %v", expectedPoints, transformed)
		}
	})
}

func TestComparePointSets(t *testing.T) {
	pointsA := []Point{{1, 1}, {2, 2}}
	pointsB := []Point{{1, 1}, {2, 2}}
	pointsC := []Point{{2, 2}, {1, 1}} // Same points, different order
	pointsD := []Point{{1, 1}, {3, 3}} // Different points
	pointsE := []Point{{1, 1}}       // Different length
	pointsF := []Point{{1.00001, 1.00001}, {2.00002, 2.00002}} // Within epsilon

	if !ComparePointSets(pointsA, pointsB) {
		t.Error("Expected pointsA and pointsB to be equal, but they were not")
	}
	if !ComparePointSets(pointsA, pointsC) {
		t.Error("Expected pointsA and pointsC to be equal (order-independent), but they were not")
	}
	if ComparePointSets(pointsA, pointsD) {
		t.Error("Expected pointsA and pointsD to be different, but they were equal")
	}
	if ComparePointSets(pointsA, pointsE) {
		t.Error("Expected pointsA and pointsE to be different (length), but they were equal")
	}
	if !ComparePointSets(pointsA, pointsF) {
		t.Error("Expected pointsA and pointsF to be equal (within epsilon), but they were not")
	}
}

func TestParseGridToCornerPoints(t *testing.T) {
	gridStr := "10/01" // Two active cells: (0,0) and (1,1)
	points, err := ParseGridToCornerPoints(gridStr)
	if err != nil {
		t.Fatalf("ParseGridToCornerPoints failed: %v", err)
	}

	// Cell (0,0) -> x: 0-50, y: 0-50
	// Cell (1,1) -> x: 50-100, y: 50-100
	expectedPoints := []Point{
		// Cell (0,0)
		{0, 0}, {50, 0},
		{50, 0}, {50, 50},
		{50, 50}, {0, 50},
		{0, 50}, {0, 0},
		// Cell (1,1)
		{50, 50}, {100, 50},
		{100, 50}, {100, 100},
		{100, 100}, {50, 100},
		{50, 100}, {50, 50},
	}

	if !ComparePointSets(expectedPoints, points) {
		t.Errorf("Parsed grid points do not match expected points.\nExpected: %v\nGot: %v", expectedPoints, points)
	}
}


