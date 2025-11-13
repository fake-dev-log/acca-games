package database

import (
	"testing"

	"acca-games/types"
)

func TestSaveAndGetNBackResults(t *testing.T) {
	db, err := NewDatabase(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize in-memory database: %v", err)
	}
	defer db.Close()

	// 1. Create a session to associate results with
	sessionID, err := CreateGameSession(db, types.GameCodeNBack, "{}")
	if err != nil {
		t.Fatalf("Failed to create game session: %v", err)
	}

	// 2. Define some results to save
	expectedResults := []types.NBackResult{
		{SessionID: sessionID, Round: 1, QuestionNum: 1, IsCorrect: true, ResponseTimeMs: 500, PlayerChoice: "MATCH", CorrectChoice: "MATCH"},
		{SessionID: sessionID, Round: 1, QuestionNum: 2, IsCorrect: false, ResponseTimeMs: 600, PlayerChoice: "NO_MATCH", CorrectChoice: "MATCH"},
	}

	// 3. Save the results
	for _, result := range expectedResults {
		err := SaveNBackResult(db, result)
		if err != nil {
			t.Fatalf("SaveNBackResult failed: %v", err)
		}
	}

	// 4. Retrieve the results
	actualResults, err := GetNBackResultsForSession(db, sessionID)
	if err != nil {
		t.Fatalf("GetNBackResultsForSession failed: %v", err)
	}

	// 5. Compare the results
	if len(actualResults) != len(expectedResults) {
		t.Fatalf("Expected %d results, but got %d", len(expectedResults), len(actualResults))
	}

	// Create a map for easy lookup, ignoring the ID field which is auto-generated
	expectedMap := make(map[int]types.NBackResult)
	for _, res := range expectedResults {
		expectedMap[res.QuestionNum] = res
	}

	for _, actual := range actualResults {
		expected, ok := expectedMap[actual.QuestionNum]
		if !ok {
			t.Errorf("Retrieved an unexpected result with question number %d", actual.QuestionNum)
			continue
		}

		// Compare fields, ignoring the auto-incremented ID
		if actual.SessionID != expected.SessionID ||
			actual.Round != expected.Round ||
			actual.IsCorrect != expected.IsCorrect ||
			actual.ResponseTimeMs != expected.ResponseTimeMs ||
			actual.PlayerChoice != expected.PlayerChoice ||
			actual.CorrectChoice != expected.CorrectChoice {
			t.Errorf("For question %d, expected %v, but got %v", actual.QuestionNum, expected, actual)
		}
	}
}

func TestGetPaginatedNBackSessionsWithResults(t *testing.T) {
	db, err := NewDatabase(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize in-memory database: %v", err)
	}
	defer db.Close()

	// Create sessions and results
	sessionID1, _ := CreateGameSession(db, types.GameCodeNBack, "{}")
	db.Exec("UPDATE game_sessions SET play_datetime = '2023-01-01 12:00:00' WHERE id = ?", sessionID1)
	SaveNBackResult(db, types.NBackResult{SessionID: sessionID1, QuestionNum: 1})
	
	sessionID2, _ := CreateGameSession(db, types.GameCodeNBack, "{}")
	db.Exec("UPDATE game_sessions SET play_datetime = '2023-01-01 13:00:00' WHERE id = ?", sessionID2)
	SaveNBackResult(db, types.NBackResult{SessionID: sessionID2, QuestionNum: 1})
	SaveNBackResult(db, types.NBackResult{SessionID: sessionID2, QuestionNum: 2})

	// Test pagination
	paginatedResult, err := GetPaginatedNBackSessionsWithResults(db, 1, 1)
	if err != nil {
		t.Fatalf("GetPaginatedNBackSessionsWithResults failed: %v", err)
	}

	if paginatedResult.TotalCount != 2 {
		t.Errorf("Expected total count of 2, got %d", paginatedResult.TotalCount)
	}
	if len(paginatedResult.Sessions) != 1 {
		t.Fatalf("Expected 1 session, got %d", len(paginatedResult.Sessions))
	}
	if paginatedResult.Sessions[0].ID != sessionID2 { // Most recent session first
		t.Errorf("Expected session ID %d, got %d", sessionID2, paginatedResult.Sessions[0].ID)
	}
	if len(paginatedResult.Sessions[0].Results) != 2 {
		t.Errorf("Expected 2 results for session, got %d", len(paginatedResult.Sessions[0].Results))
	}
}
