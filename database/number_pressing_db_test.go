package database

import (
	"reflect"
	"testing"

	"acca-games/types"
)

func TestSaveAndGetNumberPressingResults(t *testing.T) {
	db, err := NewDatabase(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize in-memory database: %v", err)
	}
	defer db.Close()

	sessionID, err := CreateGameSession(db, types.GameCodeNumberPressing, "{}")
	if err != nil {
		t.Fatalf("Failed to create game session: %v", err)
	}

	// Test R1
	r1Result := types.NumberPressingResultR1{
		SessionID: sessionID,
		Problem:   types.NumberPressingProblemR1{TargetNumber: 5},
		TimeTaken: 1.23,
		IsCorrect: true,
	}
	err = SaveNumberPressingResultR1(db, r1Result)
	if err != nil {
		t.Fatalf("SaveNumberPressingResultR1 failed: %v", err)
	}

	// Test R2
	r2Result := types.NumberPressingResultR2{
		SessionID:     sessionID,
		Problem:       types.NumberPressingProblemR2{DoubleClick: []int{1}, Skip: []int{9}},
		PlayerClicks:  []int{2, 3, 1, 1, 4},
		CorrectClicks: []int{2, 3, 1, 1, 4},
		TimeTaken:     15.6,
		IsCorrect:     true,
	}
	err = SaveNumberPressingResultR2(db, r2Result)
	if err != nil {
		t.Fatalf("SaveNumberPressingResultR2 failed: %v", err)
	}

	// Get bundle and verify
	bundle, err := GetNumberPressingResultsForSession(db, sessionID)
	if err != nil {
		t.Fatalf("GetNumberPressingResultsForSession failed: %v", err)
	}

	if len(bundle.ResultsR1) != 1 {
		t.Fatalf("Expected 1 result for R1, got %d", len(bundle.ResultsR1))
	}
	if bundle.ResultsR1[0].Problem.TargetNumber != r1Result.Problem.TargetNumber {
		t.Errorf("R1 TargetNumber mismatch: expected %d, got %d", r1Result.Problem.TargetNumber, bundle.ResultsR1[0].Problem.TargetNumber)
	}

	if len(bundle.ResultsR2) != 1 {
		t.Fatalf("Expected 1 result for R2, got %d", len(bundle.ResultsR2))
	}
	if !reflect.DeepEqual(bundle.ResultsR2[0].PlayerClicks, r2Result.PlayerClicks) {
		t.Errorf("R2 PlayerClicks mismatch: expected %v, got %v", r2Result.PlayerClicks, bundle.ResultsR2[0].PlayerClicks)
	}
}

func TestGetPaginatedNumberPressingSessionsWithResults(t *testing.T) {
	db, err := NewDatabase(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize in-memory database: %v", err)
	}
	defer db.Close()

	sessionID1, _ := CreateGameSession(db, types.GameCodeNumberPressing, "{}")
	db.Exec("UPDATE game_sessions SET play_datetime = '2023-01-01 12:00:00' WHERE id = ?", sessionID1)
	SaveNumberPressingResultR1(db, types.NumberPressingResultR1{SessionID: sessionID1})

	sessionID2, _ := CreateGameSession(db, types.GameCodeNumberPressing, "{}")
	db.Exec("UPDATE game_sessions SET play_datetime = '2023-01-01 13:00:00' WHERE id = ?", sessionID2)
	SaveNumberPressingResultR1(db, types.NumberPressingResultR1{SessionID: sessionID2})
	SaveNumberPressingResultR2(db, types.NumberPressingResultR2{SessionID: sessionID2, Problem: types.NumberPressingProblemR2{DoubleClick:[]int{1}, Skip:[]int{1}}, PlayerClicks:[]int{1}, CorrectClicks:[]int{1}} )

	paginatedResult, err := GetPaginatedNumberPressingSessionsWithResults(db, 1, 1)
	if err != nil {
		t.Fatalf("GetPaginatedNumberPressingSessionsWithResults failed: %v", err)
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
	if len(paginatedResult.Sessions[0].Results.ResultsR1) != 1 {
		t.Errorf("Expected 1 R1 result for session, got %d", len(paginatedResult.Sessions[0].Results.ResultsR1))
	}
	if len(paginatedResult.Sessions[0].Results.ResultsR2) != 1 {
		t.Errorf("Expected 1 R2 result for session, got %d", len(paginatedResult.Sessions[0].Results.ResultsR2))
	}
}
