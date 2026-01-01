package cat_chaser

import (
	"acca-games/database"
	"acca-games/types"
	"database/sql"
	"fmt"
	"math/rand"
	"strconv"
	"time"
)

// CatChaserGameState holds the current state of the game.
type CatChaserGameState struct {
	Settings types.CatChaserSettings  `json:"settings"`
	Problems []types.CatChaserProblem `json:"problems"`
	ID       int64                    `json:"id"`
}

// Service for the Cat Chaser game.
type Service struct {
	db           *sql.DB
	currentState *CatChaserGameState
}

// NewService creates a new service.
func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

// StartGame initializes a new game session.
func (s *Service) StartGame(settings types.CatChaserSettings) (*CatChaserGameState, error) {
	// Generate problems based on settings
	problems := generateProblems(settings.NumTrials, settings.Difficulty)

	sessionID, err := database.CreateGameSession(s.db, types.GameCodeCatChaser, settings)
	if err != nil {
		return nil, fmt.Errorf("failed to create game session: %w", err)
	}

	s.currentState = &CatChaserGameState{
		Settings: settings,
		Problems: problems,
		ID:       sessionID,
	}

	return s.currentState, nil
}

// SubmitAnswer processes a user's answer.
func (s *Service) SubmitAnswer(round int, targetColor string, playerChoice string, confidence int, responseTimeMs int) (*types.CatChaserResult, error) {
	if s.currentState == nil {
		return nil, fmt.Errorf("game not started")
	}

	if round < 1 || round > len(s.currentState.Problems) {
		return nil, fmt.Errorf("invalid round number")
	}

	problem := s.currentState.Problems[round-1]
	
	var correctChoice string
	var isCorrect bool
	var caughtStatus types.CaughtStatus

	if targetColor == "RED" {
		caughtStatus = problem.RedCat
	} else if targetColor == "BLUE" {
		caughtStatus = problem.BlueCat
	} else {
		return nil, fmt.Errorf("invalid target color")
	}

	correctChoice = string(caughtStatus)
	isCorrect = playerChoice == correctChoice

	// Calculate Score
	score := 0.0
	if playerChoice == "TIMEOUT" {
		isCorrect = false
		score = -1.0
	} else {
		confidenceMultiplier := 0.0
		switch confidence {
		case 1:
			confidenceMultiplier = 0.1
		case 2:
			confidenceMultiplier = 0.5
		case 3:
			confidenceMultiplier = 1.0
		case 4:
			confidenceMultiplier = 2.0
		}

		if isCorrect {
			score = 1.0 * confidenceMultiplier
		} else {
			score = -1.0 * confidenceMultiplier
		}
	}

	result := types.CatChaserResult{
		SessionID:      s.currentState.ID,
		Round:          round,
		TargetColor:    targetColor,
		PlayerChoice:   playerChoice,
		Confidence:     confidence,
		CorrectChoice:  correctChoice,
		IsCorrect:      isCorrect,
		Score:          score,
		ResponseTimeMs: responseTimeMs,
	}

	if err := database.SaveCatChaserResult(s.db, result); err != nil {
		return nil, fmt.Errorf("failed to save result: %w", err)
	}

	return &result, nil
}

// --- Helper Functions ---

func generateProblems(numTrials int, difficulty string) []types.CatChaserProblem {
	problems := make([]types.CatChaserProblem, numTrials)
	rand.Seed(time.Now().UnixNano())

	// Determine mouse counts per round
	mouseCounts := make([]int, numTrials)
	if difficulty == "auto" {
		// 6 levels: 4, 6, 8, 10, 12, 16
		levels := []int{4, 6, 8, 10, 12, 16}
		// Distribute trials across levels
		// Example: 10 trials -> 1,1,2,2,2,2 (roughly)
		// Simple linear distribution
		for i := 0; i < numTrials; i++ {
			levelIdx := (i * len(levels)) / numTrials
			if levelIdx >= len(levels) {
				levelIdx = len(levels) - 1
			}
			mouseCounts[i] = levels[levelIdx]
		}
	} else {
		count, _ := strconv.Atoi(difficulty)
		if count < 4 { count = 4 }
		for i := 0; i < numTrials; i++ {
			mouseCounts[i] = count
		}
	}

	for i := 0; i < numTrials; i++ {
		problems[i] = generateSingleProblem(i+1, mouseCounts[i])
	}

	return problems
}

func generateSingleProblem(round int, numMice int) types.CatChaserProblem {
	gridSize := 36
	// Generate random unique positions for mice
	perm := rand.Perm(gridSize)
	micePositions := perm[:numMice]
	
	// Generate random unique positions for cats (same count as mice)
	// Cats can be anywhere, overlapping or not? 
	// "생쥐와 같은 칸에 나타난 고양이는 생쥐를 '잡았다'" -> Implies overlap allowed.
	// Are cats unique among themselves? "임의의 칸에 생쥐와 같은 수의 고양이" -> Usually implies unique positions for the group of cats.
	permCats := rand.Perm(gridSize)
	catPositions := permCats[:numMice]

	// Select 2 target cats
	// We need 2 distinct indices from the *catPositions array* (0 to numMice-1)
	catIndices := rand.Perm(numMice)
	redCatIdx := catIndices[0]
	blueCatIdx := catIndices[1]

	// Determine status
	redCatPos := catPositions[redCatIdx]
	blueCatPos := catPositions[blueCatIdx]

	redStatus := types.StatusMissed
	if contains(micePositions, redCatPos) {
		redStatus = types.StatusCaught
	}

	blueStatus := types.StatusMissed
	if contains(micePositions, blueCatPos) {
		blueStatus = types.StatusCaught
	}

	return types.CatChaserProblem{
		Round:         round,
		MicePositions: micePositions,
		CatPositions:  catPositions,
		RedCatIndex:   redCatIdx,
		BlueCatIndex:  blueCatIdx,
		RedCat:        redStatus,
		BlueCat:       blueStatus,
	}
}

func contains(slice []int, val int) bool {
	for _, item := range slice {
		if item == val {
			return true
		}
	}
	return false
}
