package shape_rotation

import (
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
