package rps

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

	settings := types.RpsSettings{
		Rounds:            []int{1, 3},
		QuestionsPerRound: 5,
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

	expectedNumProblems := len(settings.Rounds) * settings.QuestionsPerRound
	if len(gameState.Problems) != expectedNumProblems {
		t.Errorf("Expected %d problems, got %d", expectedNumProblems, len(gameState.Problems))
	}

	// Verify that a session was created in the database
	var gameCode string
	var dbSettings string
	err = db.QueryRow("SELECT game_code, settings FROM game_sessions WHERE session_id = ?", gameState.SessionID).Scan(&gameCode, &dbSettings)
	if err != nil {
		t.Fatalf("Failed to query game_sessions table: %v", err)
	}

	if gameCode != "RPS" {
		t.Errorf("Expected game_code 'RPS', got %s", gameCode)
	}
}

func TestService_SubmitAnswer(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	service := NewService(db)

	// Start a game first
	settings := types.RpsSettings{Rounds: []int{1, 2}, QuestionsPerRound: 1}
	gameState, err := service.StartGame(settings)
	if err != nil {
		t.Fatalf("StartGame failed: %v", err)
	}

	// Manually set predictable problems for testing
	service.currentState.Problems = []Problem{
		{ProblemCardHolder: "me", GivenCard: "ROCK", Round: 1},       // qNum 0
		{ProblemCardHolder: "me", GivenCard: "PAPER", Round: 1},      // qNum 1
		{ProblemCardHolder: "opponent", GivenCard: "PAPER", Round: 2}, // qNum 2
		{ProblemCardHolder: "opponent", GivenCard: "SCISSORS", Round: 2},// qNum 3
	}

	tests := []struct {
		name              string
		questionNum       int
		playerChoice      string
		wantIsCorrect     bool
		wantCorrectChoice string
	}{
		{
			name:              "Round 1 (me): Correct choice",
			questionNum:       0,
			playerChoice:      "PAPER", // Wins against ROCK
			wantIsCorrect:     true,
			wantCorrectChoice: "PAPER",
		},
		{
			name:              "Round 1 (me): Incorrect choice",
			questionNum:       1,
			playerChoice:      "ROCK", // Draws with PAPER
			wantIsCorrect:     false,
			wantCorrectChoice: "SCISSORS",
		},
		{
			name:              "Round 2 (opponent): Correct choice",
			questionNum:       2,
			playerChoice:      "ROCK", // Loses to PAPER
			wantIsCorrect:     true,
			wantCorrectChoice: "ROCK",
		},
		{
			name:              "Round 2 (opponent): Incorrect choice",
			questionNum:       3,
			playerChoice:      "SCISSORS", // Draws with SCISSORS
			wantIsCorrect:     false,
			wantCorrectChoice: "PAPER",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := service.SubmitAnswer(tt.playerChoice, 500, tt.questionNum)
			if err != nil {
				t.Fatalf("SubmitAnswer failed: %v", err)
			}

			if result.IsCorrect != tt.wantIsCorrect {
				t.Errorf("IsCorrect = %v, want %v", result.IsCorrect, tt.wantIsCorrect)
			}
			if result.CorrectChoice != tt.wantCorrectChoice {
				t.Errorf("CorrectChoice = %v, want %v", result.CorrectChoice, tt.wantCorrectChoice)
			}

			// Verify that the result was saved to the database
			var dbResult types.RpsResult
			err = db.QueryRow(`
				SELECT is_correct, correct_choice FROM rps_results WHERE session_id = ? AND question_num = ?`,
				gameState.SessionID, tt.questionNum,
			).Scan(&dbResult.IsCorrect, &dbResult.CorrectChoice)

			if err != nil {
				t.Fatalf("Failed to query rps_results table: %v", err)
			}

			if dbResult.IsCorrect != tt.wantIsCorrect {
				t.Errorf("DB IsCorrect = %v, want %v", dbResult.IsCorrect, tt.wantIsCorrect)
			}
			if dbResult.CorrectChoice != tt.wantCorrectChoice {
				t.Errorf("DB CorrectChoice = %v, want %v", dbResult.CorrectChoice, tt.wantCorrectChoice)
			}
		})
	}
}

func Test_getWinningCard(t *testing.T) {
	tests := []struct {
		name string
		card string
		want string
	}{
		{"Rock beats Scissors", "SCISSORS", "ROCK"},
		{"Paper beats Rock", "ROCK", "PAPER"},
		{"Scissors beats Paper", "PAPER", "SCISSORS"},
		{"Invalid card", "LIZARD", ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := getWinningCard(tt.card); got != tt.want {
				t.Errorf("getWinningCard() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_getLosingCard(t *testing.T) {
	tests := []struct {
		name string
		card string
		want string
	}{
		{"Scissors loses to Rock", "ROCK", "SCISSORS"},
		{"Rock loses to Paper", "PAPER", "ROCK"},
		{"Paper loses to Scissors", "SCISSORS", "PAPER"},
		{"Invalid card", "SPOCK", ""},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := getLosingCard(tt.card); got != tt.want {
				t.Errorf("getLosingCard() = %v, want %v", got, tt.want)
			}
		})
	}
}
