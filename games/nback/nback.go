package nback

import (
	"acca-games/database"
	"acca-games/types"
	"database/sql"
	"fmt"
	"math/rand"
)

// NBackGameState holds the current state of the N-Back game.
type NBackGameState struct {
	Settings      types.NBackSettings `json:"settings"`
	ShapeSequence []string            `json:"shapeSequence"`
	ID            int64               `json:"id"`
}

// Service for the N-Back game.
type Service struct {
	db           *sql.DB
	currentState *NBackGameState
}

// NewService creates a new N-Back game service.
func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

// StartGame initializes a new N-Back game session.
func (s *Service) StartGame(settings types.NBackSettings) (*NBackGameState, error) {
	shapeSequence := generateShapeSequence(settings.NumTrials, settings.ShapeGroup, settings.NBackLevel)

	sessionID, err := database.CreateGameSession(s.db, types.GameCodeNBack, settings)
	if err != nil {
		return nil, fmt.Errorf("failed to create game session: %w", err)
	}

	s.currentState = &NBackGameState{
		Settings:      settings,
		ShapeSequence: shapeSequence,
		ID:            sessionID,
	}

	return s.currentState, nil
}

// SubmitAnswer processes a user's answer for a single trial.
func (s *Service) SubmitAnswer(playerChoice string, responseTimeMs int, questionNum int) (*types.NBackResult, error) {
	if s.currentState == nil {
		return nil, fmt.Errorf("game not started")
	}

	gs := s.currentState
	correctChoice := determineCorrectChoice(gs.ShapeSequence, questionNum, gs.Settings.NBackLevel)
	isCorrect := playerChoice == correctChoice

	result := types.NBackResult{
		SessionID:      gs.ID,
		Round:          1, // N-Back doesn't have rounds in this context, so default to 1
		QuestionNum:    questionNum,
		IsCorrect:      isCorrect,
		ResponseTimeMs: responseTimeMs,
		PlayerChoice:   playerChoice,
		CorrectChoice:  correctChoice,
	}

	if err := database.SaveNBackResult(s.db, result); err != nil {
		return nil, fmt.Errorf("failed to save result: %w", err)
	}

	return &result, nil
}

// --- Helper Functions ---

var shapeGroups = map[string][]string{
	"group1": {"circle", "triangle", "square"},
	"group2": {"trapezoid", "hourglass", "diamond"},
	"group3": {"rhombus", "butterfly", "star"},
	"group4": {"check", "horns", "pyramid"},
	"group5": {"double_triangle", "x_shape", "crown"},
}

// GetShapeGroups returns the map of available shape groups.
func GetShapeGroups() map[string][]string {
	return shapeGroups
}

// generateShapeSequence creates a sequence of shapes for the N-Back game.
func generateShapeSequence(numTrials int, shapeGroup string, nBackLevel int) []string {
	shapeSet := GetShapeGroups()[shapeGroup]
	if len(shapeSet) == 0 {
		shapeSet = GetShapeGroups()["group1"] // Fallback to group1
	}

	// Create a pool of shapes with a more balanced distribution.
	shapePool := make([]string, 0, numTrials)
	for i := 0; i < numTrials; i++ {
		shapePool = append(shapePool, shapeSet[i%len(shapeSet)])
	}

	// Shuffle the pool using Fisher-Yates algorithm.
	rand.Shuffle(len(shapePool), func(i, j int) {
		shapePool[i], shapePool[j] = shapePool[j], shapePool[i]
	})

	return shapePool
}

// determineCorrectChoice determines the correct user action for a given trial.
func determineCorrectChoice(sequence []string, questionNum int, nBackLevel int) string {
	if nBackLevel == 1 { // 2-back only
		if questionNum < 2 {
			return "SPACE" // Not enough history
		}
		if sequence[questionNum] == sequence[questionNum-2] {
			return "LEFT"
		} else {
			return "SPACE"
		}
	} else { // 2-back and 3-back
		match2Back := questionNum >= 2 && sequence[questionNum] == sequence[questionNum-2]
		match3Back := questionNum >= 3 && sequence[questionNum] == sequence[questionNum-3]

		if match2Back {
			return "LEFT"
		} else if match3Back {
			return "RIGHT"
		} else {
			return "SPACE"
		}
	}
}
