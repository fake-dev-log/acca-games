package database

import (
	"testing"

	"acca-games/types"
)

func TestSaveAndGetRpsResults(t *testing.T) {
	db, err := NewDatabase(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize in-memory database: %v", err)
	}
	defer db.Close()

	sessionID, err := CreateGameSession(db, types.GameCodeRPS, "{}")
	if err != nil {
		t.Fatalf("Failed to create game session: %v", err)
	}

	expectedResults := []types.RpsResult{
		{SessionID: sessionID, Round: 1, QuestionNum: 1, IsCorrect: true, PlayerChoice: "ROCK", CorrectChoice: "ROCK"},
		{SessionID: sessionID, Round: 1, QuestionNum: 2, IsCorrect: false, PlayerChoice: "PAPER", CorrectChoice: "SCISSORS"},
	}

	for _, result := range expectedResults {
		err := SaveRpsResult(db, result)
		if err != nil {
			t.Fatalf("SaveRpsResult failed: %v", err)
		}
	}

	actualResults, err := GetRpsResultsForSession(db, sessionID)
	if err != nil {
		t.Fatalf("GetRpsResultsForSession failed: %v", err)
	}

	if len(actualResults) != len(expectedResults) {
		t.Fatalf("Expected %d results, but got %d", len(expectedResults), len(actualResults))
	}

	// Simple comparison, assuming order is preserved by DB query
	for i := range expectedResults {
		if actualResults[i].PlayerChoice != expectedResults[i].PlayerChoice || actualResults[i].CorrectChoice != expectedResults[i].CorrectChoice {
			t.Errorf("Mismatch in result %d. Expected %v, got %v", i, expectedResults[i], actualResults[i])
		}
	}
}

func TestGetPaginatedRpsSessionsWithResults(t *testing.T) {
	db, err := NewDatabase(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize in-memory database: %v", err)
	}
	defer db.Close()

	sessionID1, _ := CreateGameSession(db, types.GameCodeRPS, "{}")
	db.Exec("UPDATE game_sessions SET play_datetime = '2023-01-01 12:00:00' WHERE id = ?", sessionID1)
	SaveRpsResult(db, types.RpsResult{SessionID: sessionID1, QuestionNum: 1})
	
	sessionID2, _ := CreateGameSession(db, types.GameCodeRPS, "{}")
	db.Exec("UPDATE game_sessions SET play_datetime = '2023-01-01 13:00:00' WHERE id = ?", sessionID2)
	SaveRpsResult(db, types.RpsResult{SessionID: sessionID2, QuestionNum: 1})
	SaveRpsResult(db, types.RpsResult{SessionID: sessionID2, QuestionNum: 2})

	paginatedResult, err := GetPaginatedRpsSessionsWithResults(db, 1, 1)
	if err != nil {
		t.Fatalf("GetPaginatedRpsSessionsWithResults failed: %v", err)
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
