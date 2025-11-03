package nback

import (
	"acca-games/database"
	"acca-games/types"
	"database/sql"
	"fmt"
	"math/rand"
	"time"
)

// NBackGameState represents the current state of the N-Back game.
type NBackGameState struct {
	Settings      types.NBackSettings `json:"settings"`
	ShapeSequence []string            `json:"shapeSequence"`
	SessionID     int64               `json:"sessionId"`
}

// ShapeGroups contains the definitions for all shape groups.
var ShapeGroups = map[string][]string{
	"group1": {"circle", "square", "triangle"},
	"group2": {"trapezoid", "hourglass", "diamond"},
	"group3": {"rhombus", "butterfly", "star"},
	"group4": {"check", "horns", "pyramid"},
	"group5": {"double_triangle", "x_shape", "crown"},
}

// Service handles the business logic for the N-Back game.
type Service struct {
	db           *sql.DB
	currentState *NBackGameState
}

// NewService creates a new N-Back game service.
func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

// GetShapeGroups returns the available shape groups.
func GetShapeGroups() map[string][]string {
	return ShapeGroups
}

// StartGame starts a new N-Back game with the given settings.
func (s *Service) StartGame(settings types.NBackSettings) (*NBackGameState, error) {
	dbSettings := types.NBackSettings{
		NumTrials:        settings.NumTrials,
		PresentationTime: settings.PresentationTime,
		NBackLevel:       settings.NBackLevel,
		ShapeGroup:       settings.ShapeGroup,
		IsRealMode:       settings.IsRealMode,
	}

	sessionID, err := database.CreateNBackSession(s.db, dbSettings)
	if err != nil {
		return nil, fmt.Errorf("failed to create n-back session: %w", err)
	}

	s.currentState = newNBackGame(settings)
	s.currentState.SessionID = sessionID
	return s.currentState, nil
}

// SubmitAnswer checks the user's answer for a given trial, saves it to the DB, and returns the result.
func (s *Service) SubmitAnswer(playerChoice string, responseTimeMs int, trialNum int) (*types.NBackResult, error) {
	if s.currentState == nil || trialNum >= len(s.currentState.ShapeSequence) {
		return nil, fmt.Errorf("game not started or already finished")
	}

	result := s.currentState.checkAnswer(playerChoice, responseTimeMs, trialNum)

	err := database.SaveNBackResult(s.db, *result)
	if err != nil {
		return nil, fmt.Errorf("failed to save n-back result: %w", err)
	}
	return result, nil
}

// newNBackGame initializes a new N-Back game state. (Internal helper)
func newNBackGame(settings types.NBackSettings) *NBackGameState {
	rand.Seed(time.Now().UnixNano())

	shapeGroupKey := settings.ShapeGroup
	if shapeGroupKey == "random" {
		keys := make([]string, 0, len(ShapeGroups))
		for k := range ShapeGroups {
			keys = append(keys, k)
		}
		shapeGroupKey = keys[rand.Intn(len(keys))]
	}

	group, ok := ShapeGroups[shapeGroupKey]
	if !ok {
		group = ShapeGroups["group1"]
		shapeGroupKey = "group1" // Update shapeGroupKey to reflect the default
	}

	sequence := make([]string, settings.NumTrials)
	for i := 0; i < settings.NumTrials; i++ {
		var nextShape string
		for {
			nextShape = group[rand.Intn(len(group))]
			if i < 3 {
				break
			}
			if !(nextShape == sequence[i-1] && nextShape == sequence[i-2] && nextShape == sequence[i-3]) {
				break
			}
		}
		sequence[i] = nextShape
	}

	modifiedSettings := settings
	modifiedSettings.ShapeGroup = shapeGroupKey

	return &NBackGameState{
		Settings:      modifiedSettings,
		ShapeSequence: sequence,
	}
}

// checkAnswer evaluates the player's answer for a given trial. (Internal helper)
func (gs *NBackGameState) checkAnswer(playerChoice string, responseTimeMs int, trial int) *types.NBackResult {
	correctChoice := "SPACE"
	isCorrect := false

	if gs.Settings.NBackLevel == 1 {
		if trial >= 2 && gs.ShapeSequence[trial] == gs.ShapeSequence[trial-2] {
			correctChoice = "LEFT"
		}
	} else {
		is2BackMatch := trial >= 2 && gs.ShapeSequence[trial] == gs.ShapeSequence[trial-2]
		is3BackMatch := trial >= 3 && gs.ShapeSequence[trial] == gs.ShapeSequence[trial-3]

		if is2BackMatch {
			correctChoice = "LEFT"
		} else if is3BackMatch {
			correctChoice = "RIGHT"
		}
	}

	if playerChoice == correctChoice {
		isCorrect = true
	}

	result := &types.NBackResult{
		SessionID:      gs.SessionID,
		Round:          gs.Settings.NBackLevel,
		QuestionNum:    trial + 1,
		IsCorrect:      isCorrect,
		ResponseTimeMs: responseTimeMs,
		PlayerChoice:   playerChoice,
		CorrectChoice:  correctChoice,
	}

	return result
}