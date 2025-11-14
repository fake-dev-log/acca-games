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

	if gameState.ID == 0 {
		t.Errorf("Expected a non-zero SessionID, got %v", gameState.ID)
	}

	expectedNumProblems := len(settings.Rounds) * settings.QuestionsPerRound
	if len(gameState.Problems) != expectedNumProblems {
		t.Errorf("Expected %d problems, got %d", expectedNumProblems, len(gameState.Problems))
	}

	// Verify that a session was created in the database
	var gameCode string
	var dbSettings string
	err = db.QueryRow("SELECT game_code, settings FROM game_sessions WHERE id = ?", gameState.ID).Scan(&gameCode, &dbSettings)
	if err != nil {
		t.Fatalf("Failed to query game_sessions table: %v", err)
	}

	if gameCode != types.GameCodeRPS {
		t.Errorf("Expected game_code '%s', got %s", types.GameCodeRPS, gameCode)
	}
}

func TestService_SubmitAnswer(t *testing.T) {
	db := setupTestDB(t)
	defer db.Close()

	service := NewService(db)

	// Start a game first
	settings := types.RpsSettings{Rounds: []int{1, 2}, QuestionsPerRound: 2}
	gameState, err := service.StartGame(settings)
	if err != nil {
		t.Fatalf("StartGame failed: %v", err)
	}

	// Manually set predictable problems for testing
	service.currentState.Problems = []Problem{
		{ProblemCardHolder: "me", GivenCard: "ROCK", CorrectChoice: "PAPER", Round: 1, QuestionNum: 1},
		{ProblemCardHolder: "me", GivenCard: "PAPER", CorrectChoice: "SCISSORS", Round: 1, QuestionNum: 2},
		{ProblemCardHolder: "opponent", GivenCard: "PAPER", CorrectChoice: "ROCK", Round: 2, QuestionNum: 3},
		{ProblemCardHolder: "opponent", GivenCard: "SCISSORS", CorrectChoice: "PAPER", Round: 2, QuestionNum: 4},
	}

	tests := []struct {
		name          string
		questionNum   int // 1-based
		playerChoice  string
		wantIsCorrect bool
	}{
		{
			name:          "Round 1 (me): Correct choice",
			questionNum:   1,
			playerChoice:  "PAPER", // Wins against ROCK
			wantIsCorrect: true,
		},
		{
			name:          "Round 1 (me): Incorrect choice",
			questionNum:   2,
			playerChoice:  "ROCK", // Loses to PAPER
			wantIsCorrect: false,
		},
		{
			name:          "Round 2 (opponent): Correct choice",
			questionNum:   3,
			playerChoice:  "ROCK", // Loses to PAPER
			wantIsCorrect: true,
		},
		{
			name:          "Round 2 (opponent): Incorrect choice",
			questionNum:   4,
			playerChoice:  "SCISSORS", // Wins against SCISSORS
			wantIsCorrect: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			problem := service.currentState.Problems[tt.questionNum-1]
			result, err := service.SubmitAnswer(tt.playerChoice, 500, tt.questionNum)
			if err != nil {
				t.Fatalf("SubmitAnswer failed: %v", err)
			}

			if result.IsCorrect != tt.wantIsCorrect {
				t.Errorf("IsCorrect = %v, want %v", result.IsCorrect, tt.wantIsCorrect)
			}
			if result.CorrectChoice != problem.CorrectChoice {
				t.Errorf("CorrectChoice = %v, want %v", result.CorrectChoice, problem.CorrectChoice)
			}

			// Verify that the result was saved to the database
			var dbIsCorrect bool
			err = db.QueryRow(`
				SELECT is_correct FROM rps_results WHERE session_id = ? AND question_num = ?`,
				gameState.ID, tt.questionNum,
			).Scan(&dbIsCorrect)

			if err != nil {
				t.Fatalf("Failed to query rps_results table: %v", err)
			}

			if dbIsCorrect != tt.wantIsCorrect {
				t.Errorf("DB IsCorrect = %v, want %v", dbIsCorrect, tt.wantIsCorrect)
			}
		})
	}

	t.Run("Invalid question number", func(t *testing.T) {
		_, err := service.SubmitAnswer("ROCK", 500, 99) // 99 is out of bounds
		if err == nil {
			t.Error("Expected an error for invalid question number, but got nil")
		}
	})
}

func TestGenerateProblem(t *testing.T) {
	t.Run("Round 1 (me)", func(t *testing.T) {
		problem := generateProblem(1, 1)
		if problem.ProblemCardHolder != "me" {
			t.Errorf("Expected ProblemCardHolder to be 'me' for round 1, got %s", problem.ProblemCardHolder)
		}
		expectedChoice := getWinningCard(problem.GivenCard)
		if problem.CorrectChoice != expectedChoice {
			t.Errorf("Expected CorrectChoice to be %s, got %s", expectedChoice, problem.CorrectChoice)
		}
	})

	t.Run("Round 2 (opponent)", func(t *testing.T) {
		problem := generateProblem(2, 1)
		if problem.ProblemCardHolder != "opponent" {
			t.Errorf("Expected ProblemCardHolder to be 'opponent' for round 2, got %s", problem.ProblemCardHolder)
		}
		expectedChoice := getLosingCard(problem.GivenCard)
		if problem.CorrectChoice != expectedChoice {
			t.Errorf("Expected CorrectChoice to be %s, got %s", expectedChoice, problem.CorrectChoice)
		}
	})

	t.Run("Round 3 (mixed)", func(t *testing.T) {
		// Run a few times to check for both possibilities
		foundMe := false
		foundOpponent := false
		for i := 0; i < 20; i++ {
			problem := generateProblem(3, i+1)
			if problem.ProblemCardHolder == "me" {
				foundMe = true
				expectedChoice := getWinningCard(problem.GivenCard)
				if problem.CorrectChoice != expectedChoice {
					t.Errorf("For 'me', expected choice %s, got %s", expectedChoice, problem.CorrectChoice)
				}
			} else if problem.ProblemCardHolder == "opponent" {
				foundOpponent = true
				expectedChoice := getLosingCard(problem.GivenCard)
				if problem.CorrectChoice != expectedChoice {
					t.Errorf("For 'opponent', expected choice %s, got %s", expectedChoice, problem.CorrectChoice)
				}
			} else {
				t.Fatalf("Invalid ProblemCardHolder '%s' generated for round 3", problem.ProblemCardHolder)
			}
		}
		if !foundMe || !foundOpponent {
			t.Errorf("Round 3 should generate both 'me' and 'opponent' problems, but it didn't after 20 tries")
		}
	})
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
