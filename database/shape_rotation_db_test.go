package database

import (
	"reflect"
	"testing"

	"acca-games/types"
)

func TestSaveAndGetShapeRotationSessionAndResults(t *testing.T) {
	db, err := NewDatabase(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize in-memory database: %v", err)
	}
	defer db.Close()

	// 1. Create a session
	settings := types.ShapeRotationSettings{Round: 1, NumProblems: 5, TimeLimit: 180}
	sessionID, err := SaveShapeRotationSession(db, settings)
	if err != nil {
		t.Fatalf("SaveShapeRotationSession failed: %v", err)
	}

	// 2. Define and save a result
	expectedResult := types.ShapeRotationResult{
		SessionID:    sessionID,
		ProblemID:    101,
		UserSolution: []string{"rotate_left_45", "flip_horizontal"},
		IsCorrect:    true,
		SolveTime:    15000,
		ClickCount:   2,
	}
	err = SaveShapeRotationResult(db, expectedResult)
	if err != nil {
		t.Fatalf("SaveShapeRotationResult failed: %v", err)
	}

	// 3. Retrieve the results for the session
	actualResults, err := GetShapeRotationResultsForSession(db, sessionID)
	if err != nil {
		t.Fatalf("GetShapeRotationResultsForSession failed: %v", err)
	}

	// 4. Compare
	if len(actualResults) != 1 {
		t.Fatalf("Expected 1 result, got %d", len(actualResults))
	}
	actualResult := actualResults[0]

	// Ignore ID and compare the rest
	if actualResult.SessionID != expectedResult.SessionID ||
		actualResult.ProblemID != expectedResult.ProblemID ||
		!reflect.DeepEqual(actualResult.UserSolution, expectedResult.UserSolution) ||
		actualResult.IsCorrect != expectedResult.IsCorrect ||
		actualResult.SolveTime != expectedResult.SolveTime ||
		actualResult.ClickCount != expectedResult.ClickCount {
		t.Errorf("Result mismatch. Expected %v, got %v", expectedResult, actualResult)
	}
}

func TestGetPaginatedShapeRotationSessionsWithResults(t *testing.T) {
	db, err := NewDatabase(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize in-memory database: %v", err)
	}
	defer db.Close()

	sessionID1, _ := SaveShapeRotationSession(db, types.ShapeRotationSettings{})
	db.Exec("UPDATE game_sessions SET play_datetime = '2023-01-01 12:00:00' WHERE id = ?", sessionID1)
	SaveShapeRotationResult(db, types.ShapeRotationResult{SessionID: sessionID1, ProblemID: 1})

	sessionID2, _ := SaveShapeRotationSession(db, types.ShapeRotationSettings{})
	db.Exec("UPDATE game_sessions SET play_datetime = '2023-01-01 13:00:00' WHERE id = ?", sessionID2)
	SaveShapeRotationResult(db, types.ShapeRotationResult{SessionID: sessionID2, ProblemID: 1})
	SaveShapeRotationResult(db, types.ShapeRotationResult{SessionID: sessionID2, ProblemID: 2})

	paginatedResult, err := GetPaginatedShapeRotationSessionsWithResults(db, 1, 1)
	if err != nil {
		t.Fatalf("GetPaginatedShapeRotationSessionsWithResults failed: %v", err)
	}

	if paginatedResult.TotalCount != 2 {
		t.Errorf("Expected total count of 2, got %d", paginatedResult.TotalCount)
	}
	if len(paginatedResult.Sessions) != 1 {
		t.Fatalf("Expected 1 session, got %d", len(paginatedResult.Sessions))
	}
	if paginatedResult.Sessions[0].ID != sessionID2 {
		t.Errorf("Expected session ID %d, got %d", sessionID2, paginatedResult.Sessions[0].ID)
	}
	if len(paginatedResult.Sessions[0].Results) != 2 {
		t.Errorf("Expected 2 results for session, got %d", len(paginatedResult.Sessions[0].Results))
	}
}
