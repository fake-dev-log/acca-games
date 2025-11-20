package count_comparison

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

	schemaPath := filepath.Join("..", "..", "database", "schema.sql")
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

	settings := types.CountComparisonSettings{
		NumProblems:      5,
		PresentationTime: 1000,
		InputTime:        3000,
		IsRealMode:       false,
	}

	sessionID, err := service.StartGame(settings)
	if err != nil {
		t.Fatalf("StartGame failed: %v", err)
	}

	if sessionID == 0 {
		t.Fatal("StartGame returned nil sessionID")
	}

	if len(service.currentGame.Problems) != settings.NumProblems {
		t.Errorf("Expected %d problems, got %d", settings.NumProblems, len(service.currentGame.Problems))
	}

	// Verify that a session was created in the database
	var gameCode string
	var dbSettings string
	err = db.QueryRow("SELECT game_code, settings FROM game_sessions WHERE id = ?", sessionID).Scan(&gameCode, &dbSettings)
	if err != nil {
		t.Fatalf("Failed to query game_sessions table: %v", err)
	}

	if gameCode != types.GameCodeCountComparison {
		t.Errorf("Expected game_code '%s', got %s", types.GameCodeCountComparison, gameCode)
	}

	// Further checks on dbSettings (JSON string) can be added if needed
}

func TestService_SubmitAnswer(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	service := NewService(db)

	// --- Test Case 1: Game not started ---
	t.Run("Game not started", func(t *testing.T) {
		err := service.SubmitAnswer(types.CountComparisonSubmission{PlayerChoice: "LEFT", ResponseTimeMs: 500, ProblemNumber: 0})
		if err == nil {
			t.Errorf("Expected an error when submitting answer before game start, but got nil")
		}
	})

	// --- Start a game for subsequent tests ---
	settings := types.CountComparisonSettings{
		NumProblems:      3,
		PresentationTime: 1000,
		InputTime:        3000,
		IsRealMode:       false,
	}
	sessionID, err := service.StartGame(settings)
	if err != nil {
		t.Fatalf("StartGame failed: %v", err)
	}

	// Manually set predictable problems for testing
	// We need to ensure that problem.CorrectSide is set correctly for testing purposes
	// Let's assume Problem 1 is "LEFT" and Problem 2 is "RIGHT"
	service.currentGame.Problems[0].CorrectSide = "LEFT"
	service.currentGame.Problems[1].CorrectSide = "RIGHT"
	service.currentGame.Problems[2].CorrectSide = "LEFT"


	tests := []struct {
		name          string
		questionNum   int // 1-based
		playerChoice  string
		wantIsCorrect bool
	}{
		{
			name:          "Problem 1: Correct choice (LEFT)",
			questionNum:   1,
			playerChoice:  "LEFT",
			wantIsCorrect: true,
		},
		{
			name:          "Problem 2: Incorrect choice (RIGHT expected, chose LEFT)",
			questionNum:   2,
			playerChoice:  "LEFT",
			wantIsCorrect: false,
		},
		{
			name:          "Problem 3: Correct choice (LEFT)",
			questionNum:   3,
			playerChoice:  "LEFT",
			wantIsCorrect: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// problem := service.currentGame.Problems[tt.questionNum-1] // Removed unused variable
			submission := types.CountComparisonSubmission{
				ProblemNumber:  tt.questionNum,
				PlayerChoice:   tt.playerChoice,
				ResponseTimeMs: 500,
			}
			err := service.SubmitAnswer(submission)
			if err != nil {
				t.Fatalf("SubmitAnswer failed: %v", err)
			}

			// Verify that the result was saved to the database
			var dbIsCorrect bool
			err = db.QueryRow(`
				SELECT is_correct FROM count_comparison_results WHERE session_id = ? AND problem_number = ?`, // Changed question_num to problem_number
				sessionID, tt.questionNum,
			).Scan(&dbIsCorrect)

			if err != nil {
				t.Fatalf("Failed to query count_comparison_results table: %v", err)
			}

			if dbIsCorrect != tt.wantIsCorrect {
				t.Errorf("DB IsCorrect = %v, want %v", dbIsCorrect, tt.wantIsCorrect)
			}
		})
	}

	t.Run("Invalid problem number", func(t *testing.T) {
		submission := types.CountComparisonSubmission{
			ProblemNumber:  99, // 99 is out of bounds
			PlayerChoice:   "LEFT",
			ResponseTimeMs: 500,
		}
		err := service.SubmitAnswer(submission)
		if err == nil {
			t.Error("Expected an error for invalid problem number, but got nil")
		}
	})
}
