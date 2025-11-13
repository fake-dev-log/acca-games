package nback

import (
	"acca-games/types"
	"database/sql"
	"io/ioutil"
	"path/filepath"
	"testing"

	_ "github.com/mattn/go-sqlite3"
)

// setupTestDB creates an in-memory SQLite database and applies the schema.
func setupTestDB(t *testing.T) *sql.DB {
	db, err := sql.Open("sqlite3", ":memory:")
	if err != nil {
		t.Fatalf("Failed to open in-memory database: %v", err)
	}

	schemaPath := filepath.Join("/Users/anjhn/personal/acca-games", "database", "schema.sql")
	schema, err := ioutil.ReadFile(schemaPath)
	if err != nil {
		t.Fatalf("Failed to read schema.sql: %v", err)
	}

	_, err = db.Exec(string(schema))
	if err != nil {
		t.Fatalf("Failed to execute schema.sql: %v", err)
	}

	return db
}

func TestService_StartGame(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	service := NewService(db)

	settings := types.NBackSettings{
		NumTrials:        5,
		PresentationTime: 1000,
		NBackLevel:       1,
		ShapeGroup:       "group1",
		IsRealMode:       false,
	}

	gameState, err := service.StartGame(settings)
	if err != nil {
		t.Fatalf("StartGame failed: %v", err)
	}

	if gameState == nil {
		t.Fatal("StartGame returned nil gameState")
	}

	if gameState.ID == 0 {
		t.Errorf("Expected a non-zero SessionID, got %v", gameState.ID)
	}

	// Verify that a session was created in the database
	var gameCode string
	var dbSettings string
	err = db.QueryRow("SELECT game_code, settings FROM game_sessions WHERE id = ?", gameState.ID).Scan(&gameCode, &dbSettings)
	if err != nil {
		t.Fatalf("Failed to query game_sessions table: %v", err)
	}

	if gameCode != types.GameCodeNBack {
		t.Errorf("Expected game_code '%s', got %s", types.GameCodeNBack, gameCode)
	}

	// Further checks on dbSettings (JSON string) can be added if needed
}

func TestService_SubmitAnswer(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	service := NewService(db)

	// Start a game first
	settings := types.NBackSettings{NumTrials: 5, NBackLevel: 1, ShapeGroup: "group1"}
	gameState, err := service.StartGame(settings)
	if err != nil {
		t.Fatalf("StartGame failed: %v", err)
	}

	// Manually set a predictable shape sequence for testing
	service.currentState.ShapeSequence = []string{"A", "B", "A", "C", "D"}

	trialNum := 2
	playerChoice := "LEFT"
	responseTime := 500

	result, err := service.SubmitAnswer(playerChoice, responseTime, trialNum)
	if err != nil {
		t.Fatalf("SubmitAnswer failed: %v", err)
	}

	if !result.IsCorrect {
		t.Errorf("Expected answer to be correct, but it was not")
	}

	// Verify that the result was saved to the database
	var dbResult types.NBackResult
	err = db.QueryRow(`
		SELECT session_id, round, question_num, is_correct, response_time_ms, player_choice, correct_choice
		FROM nback_results WHERE session_id = ? AND question_num = ?`,
		gameState.ID, trialNum,
	).Scan(
		&dbResult.SessionID, &dbResult.Round, &dbResult.QuestionNum, &dbResult.IsCorrect, &dbResult.ResponseTimeMs, &dbResult.PlayerChoice, &dbResult.CorrectChoice,
	)

	if err != nil {
		t.Fatalf("Failed to query nback_results table: %v", err)
	}

	if dbResult.SessionID != gameState.ID {
		t.Errorf("DB SessionID = %v, want %v", dbResult.SessionID, gameState.ID)
	}
	if dbResult.IsCorrect != result.IsCorrect {
		t.Errorf("DB IsCorrect = %v, want %v", dbResult.IsCorrect, result.IsCorrect)
	}
	if dbResult.PlayerChoice != playerChoice {
		t.Errorf("DB PlayerChoice = %v, want %v", dbResult.PlayerChoice, playerChoice)
	}
}

