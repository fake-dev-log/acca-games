package nback

import (
	"acca-games/types"
	"database/sql"
	"io/ioutil"
	"math/rand"
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

	if gameState.SessionID == 0 {
		t.Errorf("Expected a non-zero SessionID, got %v", gameState.SessionID)
	}

	// Verify that a session was created in the database
	var gameCode string
	var dbSettings string
	err = db.QueryRow("SELECT game_code, settings FROM game_sessions WHERE session_id = ?", gameState.SessionID).Scan(&gameCode, &dbSettings)
	if err != nil {
		t.Fatalf("Failed to query game_sessions table: %v", err)
	}

	if gameCode != "NBACK" {
		t.Errorf("Expected game_code 'NBACK', got %s", gameCode)
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
	var dbResult types.NBackRecord
	err = db.QueryRow(`
		SELECT session_id, round, question_num, is_correct, response_time_ms, player_choice, correct_choice
		FROM nback_results WHERE session_id = ? AND question_num = ?`,
		gameState.SessionID, trialNum+1,
	).Scan(
		&dbResult.SessionID, &dbResult.Round, &dbResult.QuestionNum, &dbResult.IsCorrect, &dbResult.ResponseTimeMs, &dbResult.PlayerChoice, &dbResult.CorrectChoice,
	)

	if err != nil {
		t.Fatalf("Failed to query nback_results table: %v", err)
	}

	if dbResult.SessionID != gameState.SessionID {
		t.Errorf("DB SessionID = %v, want %v", dbResult.SessionID, gameState.SessionID)
	}
	if dbResult.IsCorrect != result.IsCorrect {
		t.Errorf("DB IsCorrect = %v, want %v", dbResult.IsCorrect, result.IsCorrect)
	}
	if dbResult.PlayerChoice != playerChoice {
		t.Errorf("DB PlayerChoice = %v, want %v", dbResult.PlayerChoice, playerChoice)
	}
}

func Test_newNBackGame(t *testing.T) {
	tests := []struct {
		name          string
		settings      types.NBackSettings
		expectNumTrials int
		expectShapeGroup string
	}{
		{
			name: "Basic game creation with specific shape group",
			settings: types.NBackSettings{
				NumTrials:        10,
				PresentationTime: 1000,
				NBackLevel:       1,
				ShapeGroup:       "group1",
				IsRealMode:       false,
			},
			expectNumTrials: 10,
			expectShapeGroup: "group1",
		},
		{
			name: "Game creation with random shape group",
			settings: types.NBackSettings{
				NumTrials:        5,
				PresentationTime: 1000,
				NBackLevel:       2,
				ShapeGroup:       "random",
				IsRealMode:       true,
			},
			expectNumTrials: 5,
			expectShapeGroup: "random", // Will be one of the keys in ShapeGroups
		},
		{
			name: "Game creation with invalid shape group, should default to group1",
			settings: types.NBackSettings{
				NumTrials:        7,
				PresentationTime: 1000,
				NBackLevel:       1,
				ShapeGroup:       "nonexistent",
				IsRealMode:       false,
			},
			expectNumTrials: 7,
			expectShapeGroup: "group1",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Seed the random number generator for deterministic tests
			rand.Seed(1) // Fixed seed for testing

			gs := newNBackGame(tt.settings)

			if gs.Settings.NumTrials != tt.expectNumTrials {
				t.Errorf("newNBackGame() NumTrials = %v, want %v", gs.Settings.NumTrials, tt.expectNumTrials)
			}
			if len(gs.ShapeSequence) != tt.expectNumTrials {
				t.Errorf("newNBackGame() generated sequence length = %v, want %v", len(gs.ShapeSequence), tt.expectNumTrials)
			}

			if tt.settings.ShapeGroup == "random" {
				// For random, ensure the chosen group is one of the valid ones
				found := false
				for k := range ShapeGroups {
					if gs.Settings.ShapeGroup == k {
						found = true
						break
					}
				}
				if !found {
					t.Errorf("newNBackGame() random shape group %v not found in ShapeGroups", gs.Settings.ShapeGroup)
				}
			} else if tt.settings.ShapeGroup == "nonexistent" {
				// Should default to group1
				if gs.Settings.ShapeGroup != "group1" {
					t.Errorf("newNBackGame() with nonexistent shape group, got %v, want group1", gs.Settings.ShapeGroup)
				}
			} else {
				// For specific group, ensure it's the one requested
				if gs.Settings.ShapeGroup != tt.expectShapeGroup {
					t.Errorf("newNBackGame() ShapeGroup = %v, want %v", gs.Settings.ShapeGroup, tt.expectShapeGroup)
				}
			}

			// Verify no more than 3 consecutive identical shapes
			for i := 3; i < len(gs.ShapeSequence); i++ {
				if gs.ShapeSequence[i] == gs.ShapeSequence[i-1] &&
					gs.ShapeSequence[i] == gs.ShapeSequence[i-2] &&
					gs.ShapeSequence[i] == gs.ShapeSequence[i-3] {
					t.Errorf("newNBackGame() generated sequence has 4 consecutive identical shapes at index %v: %v", i, gs.ShapeSequence[i])
				}
			}
		})
	}
}

func TestNBackGameState_checkAnswer(t *testing.T) {
	tests := []struct {
		name          string
		settings      types.NBackSettings
		shapeSequence []string
		playerChoice  string
		responseTime  int
		trial         int
		wantIsCorrect bool
		wantCorrectChoice string
	}{
		// NBackLevel = 1 (2-back only)
		{
			name: "NBackLevel 1: Correct 2-back match, player chooses LEFT",
			settings: types.NBackSettings{
				NBackLevel: 1,
			},
			shapeSequence: []string{"A", "B", "A", "C"},
			playerChoice:  "LEFT",
			responseTime:  1000,
			trial:         2, // shapeSequence[2] (A) == shapeSequence[0] (A)
			wantIsCorrect: true,
			wantCorrectChoice: "LEFT",
		},
		{
			name: "NBackLevel 1: No 2-back match, player chooses SPACE",
			settings: types.NBackSettings{
				NBackLevel: 1,
			},
			shapeSequence: []string{"A", "B", "C", "D"},
			playerChoice:  "SPACE",
			responseTime:  1000,
			trial:         2, // shapeSequence[2] (C) != shapeSequence[0] (A)
			wantIsCorrect: true,
			wantCorrectChoice: "SPACE",
		},
		{
			name: "NBackLevel 1: Incorrect choice for 2-back match",
			settings: types.NBackSettings{
				NBackLevel: 1,
			},
			shapeSequence: []string{"A", "B", "A", "C"},
			playerChoice:  "SPACE", // Should be LEFT
			responseTime:  1000,
			trial:         2,
			wantIsCorrect: false,
			wantCorrectChoice: "LEFT",
		},
		{
			name: "NBackLevel 1: Incorrect choice for no 2-back match",
			settings: types.NBackSettings{
				NBackLevel: 1,
			},
			shapeSequence: []string{"A", "B", "C", "D"},
			playerChoice:  "LEFT", // Should be SPACE
			responseTime:  1000,
			trial:         2,
			wantIsCorrect: false,
			wantCorrectChoice: "SPACE",
		},
		// NBackLevel = 2 (2-back and 3-back mix)
		{
			name: "NBackLevel 2: Correct 2-back match, player chooses LEFT",
			settings: types.NBackSettings{
				NBackLevel: 2,
			},
			shapeSequence: []string{"A", "B", "A", "C"},
			playerChoice:  "LEFT",
			responseTime:  1000,
			trial:         2, // shapeSequence[2] (A) == shapeSequence[0] (A)
			wantIsCorrect: true,
			wantCorrectChoice: "LEFT",
		},
		{
			name: "NBackLevel 2: Correct 3-back match, player chooses RIGHT",
			settings: types.NBackSettings{
				NBackLevel: 2,
			},
			shapeSequence: []string{"A", "B", "C", "A"},
			playerChoice:  "RIGHT",
			responseTime:  1000,
			trial:         3, // shapeSequence[3] (A) == shapeSequence[0] (A)
			wantIsCorrect: true,
			wantCorrectChoice: "RIGHT",
		},
		{
			name: "NBackLevel 2: No match, player chooses SPACE",
			settings: types.NBackSettings{
				NBackLevel: 2,
			},
			shapeSequence: []string{"A", "B", "C", "D"},
			playerChoice:  "SPACE",
			responseTime:  1000,
			trial:         3,
			wantIsCorrect: true,
			wantCorrectChoice: "SPACE",
		},
		{
			name: "NBackLevel 2: Incorrect choice for 2-back match",
			settings: types.NBackSettings{
				NBackLevel: 2,
			},
			shapeSequence: []string{"A", "B", "A", "C"},
			playerChoice:  "SPACE", // Should be LEFT
			responseTime:  1000,
			trial:         2,
			wantIsCorrect: false,
			wantCorrectChoice: "LEFT",
		},
		{
			name: "NBackLevel 2: Incorrect choice for 3-back match",
			settings: types.NBackSettings{
				NBackLevel: 2,
			},
			shapeSequence: []string{"A", "B", "C", "A"},
			playerChoice:  "LEFT", // Should be RIGHT
			responseTime:  1000,
			trial:         3,
			wantIsCorrect: false,
			wantCorrectChoice: "RIGHT",
		},
		{
			name: "NBackLevel 2: Incorrect choice for no match",
			settings: types.NBackSettings{
				NBackLevel: 2,
			},
			shapeSequence: []string{"A", "B", "C", "D"},
			playerChoice:  "LEFT", // Should be SPACE
			responseTime:  1000,
			trial:         3,
			wantIsCorrect: false,
			wantCorrectChoice: "SPACE",
		},
		{
			name: "NBackLevel 2: 2-back match takes precedence over 3-back match",
			settings: types.NBackSettings{
				NBackLevel: 2,
			},
			shapeSequence: []string{"A", "B", "A", "B", "A"}, // trial 4: A (2-back to trial 2), A (3-back to trial 1)
			playerChoice:  "LEFT",
			responseTime:  1000,
			trial:         4,
			wantIsCorrect: true,
			wantCorrectChoice: "LEFT",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gs := &NBackGameState{
				Settings:      tt.settings,
				ShapeSequence: tt.shapeSequence,
				SessionID:     1, // Dummy session ID
			}
			result := gs.checkAnswer(tt.playerChoice, tt.responseTime, tt.trial)

			if result.IsCorrect != tt.wantIsCorrect {
				t.Errorf("checkAnswer() IsCorrect = %v, want %v", result.IsCorrect, tt.wantIsCorrect)
			}
			if result.CorrectChoice != tt.wantCorrectChoice {
				t.Errorf("checkAnswer() CorrectChoice = %v, want %v", result.CorrectChoice, tt.wantCorrectChoice)
			}
			if result.PlayerChoice != tt.playerChoice {
				t.Errorf("checkAnswer() PlayerChoice = %v, want %v", result.PlayerChoice, tt.playerChoice)
			}
			if result.ResponseTimeMs != tt.responseTime {
				t.Errorf("checkAnswer() ResponseTimeMs = %v, want %v", result.ResponseTimeMs, tt.responseTime)
			}
			if result.QuestionNum != tt.trial+1 {
				t.Errorf("checkAnswer() QuestionNum = %v, want %v", result.QuestionNum, tt.trial+1)
			}
			if result.SessionID != gs.SessionID {
				t.Errorf("checkAnswer() SessionID = %v, want %v", result.SessionID, gs.SessionID)
			}
			if result.Round != gs.Settings.NBackLevel {
				t.Errorf("checkAnswer() Round = %v, want %v", result.Round, gs.Settings.NBackLevel)
			}
		})
	}
}
