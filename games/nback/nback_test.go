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

	// --- Test Case 1: Game not started ---
	t.Run("Game not started", func(t *testing.T) {
		_, err := service.SubmitAnswer("LEFT", 500, 0)
		if err == nil {
			t.Errorf("Expected an error when submitting answer before game start, but got nil")
		}
	})

	// --- Start a game for subsequent tests ---
	settings := types.NBackSettings{NumTrials: 5, NBackLevel: 1, ShapeGroup: "group1"}
	gameState, err := service.StartGame(settings)
	if err != nil {
		t.Fatalf("StartGame failed: %v", err)
	}

	// Manually set a predictable shape sequence for testing
	service.currentState.ShapeSequence = []string{"A", "B", "A", "C", "D"}

	// --- Test Case 2: Correct Answer ---
	t.Run("Correct answer", func(t *testing.T) {
		trialNum := 2 // A is 2 back
		playerChoice := "LEFT"
		correctChoice := "LEFT"
		
		result, err := service.SubmitAnswer(playerChoice, 500, trialNum)
		if err != nil {
			t.Fatalf("SubmitAnswer failed: %v", err)
		}

		if !result.IsCorrect {
			t.Errorf("Expected answer to be correct, but it was not")
		}
		if result.CorrectChoice != correctChoice {
			t.Errorf("Expected correct choice to be %s, got %s", correctChoice, result.CorrectChoice)
		}
	})

	// --- Test Case 3: Incorrect Answer ---
	t.Run("Incorrect answer", func(t *testing.T) {
		trialNum := 3 // No match
		playerChoice := "LEFT" // Player incorrectly thinks there's a match
		correctChoice := "SPACE"

		result, err := service.SubmitAnswer(playerChoice, 600, trialNum)
		if err != nil {
			t.Fatalf("SubmitAnswer failed: %v", err)
		}

		if result.IsCorrect {
			t.Errorf("Expected answer to be incorrect, but it was correct")
		}
		if result.CorrectChoice != correctChoice {
			t.Errorf("Expected correct choice to be %s, got %s", correctChoice, result.CorrectChoice)
		}

		// Optional: Verify database record
		var isCorrect bool
		err = db.QueryRow("SELECT is_correct FROM nback_results WHERE session_id = ? AND question_num = ?", gameState.ID, trialNum).Scan(&isCorrect)
		if err != nil {
			t.Fatalf("Failed to query nback_results: %v", err)
		}
		if isCorrect {
			t.Errorf("Database record shows incorrect answer as correct")
		}
	})
}

func TestDetermineCorrectChoice(t *testing.T) {
	// Test cases for NBackLevel = 1 (2-back only)
	t.Run("NBackLevel=1", func(t *testing.T) {
		// Original: {"A", "B", "A", "C", "C", "D"} -> Test failed at index 4
		// Corrected seq so that index 4 is a 2-back match with index 2
		seq := []string{"A", "B", "A", "C", "A", "D"}
		testCases := []struct {
			name        string
			questionNum int
			expected    string
		}{
			{"No history yet", 0, "SPACE"},
			{"No history yet", 1, "SPACE"},
			{"2-back match", 2, "LEFT"},
			{"No match", 3, "SPACE"},
			{"2-back match", 4, "LEFT"},
			{"No match", 5, "SPACE"},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				actual := determineCorrectChoice(seq, tc.questionNum, 1)
				if actual != tc.expected {
					t.Errorf("Expected %s, but got %s", tc.expected, actual)
				}
			})
		}
	})

	// Test cases for NBackLevel = 2 (2-back and 3-back)
	t.Run("NBackLevel=2", func(t *testing.T) {
		// Let's create a sequence that actually works as intended.
		// A B C B B X B
		// 0 1 2 3 4 5 6
		// q=3: 2-back match (B vs B) -> LEFT
		// q=4: 3-back match (B vs B) -> RIGHT
		// q=6: 2-back match (B vs B) -> LEFT
		seq := []string{"A", "B", "C", "B", "B", "X", "B"}

		testCases := []struct {
			name        string
			questionNum int
			expected    string
		}{
			{"No history", 0, "SPACE"},
			{"No history", 1, "SPACE"},
			{"No history", 2, "SPACE"},
			{"2-back match (B)", 3, "LEFT"},
			{"3-back match (B)", 4, "RIGHT"},
			{"No match", 5, "SPACE"},
			{"2-back match (B) takes precedence", 6, "LEFT"},
		}

		for _, tc := range testCases {
			t.Run(tc.name, func(t *testing.T) {
				actual := determineCorrectChoice(seq, tc.questionNum, 2)
				if actual != tc.expected {
					t.Errorf("Expected %s, but got %s", tc.expected, actual)
				}
			})
		}
	})
}

func TestGenerateShapeSequence(t *testing.T) {
	t.Run("Correct length", func(t *testing.T) {
		numTrials := 20
		seq := generateShapeSequence(numTrials, "group1", 1)
		if len(seq) != numTrials {
			t.Errorf("Expected sequence length %d, got %d", numTrials, len(seq))
		}
	})

	t.Run("Fallback to group1", func(t *testing.T) {
		numTrials := 10
		// Assuming "invalid_group" does not exist
		seq := generateShapeSequence(numTrials, "invalid_group", 1)
		
		group1Shapes := GetShapeGroups()["group1"]
		shapeMap := make(map[string]bool)
		for _, shape := range group1Shapes {
			shapeMap[shape] = true
		}

		for _, shape := range seq {
			if !shapeMap[shape] {
				t.Errorf("Shape %s is not in group1, but it should be due to fallback", shape)
			}
		}
	})
}

