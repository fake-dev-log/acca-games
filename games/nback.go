package games

import (
	"acca-games/types"
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

// NewNBackGame initializes a new N-Back game.
func NewNBackGame(settings types.NBackSettings) *NBackGameState {
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
		// Default to group1 if the selected group doesn't exist for some reason
		group = ShapeGroups["group1"]
	}

	sequence := make([]string, settings.NumTrials)
	for i := 0; i < settings.NumTrials; i++ {
		var nextShape string
		for {
			nextShape = group[rand.Intn(len(group))]
			if i < 3 {
				break // Not enough history to check for quadruplets
			}
			// Check if the new shape would create a quadruplet
			if !(nextShape == sequence[i-1] && nextShape == sequence[i-2] && nextShape == sequence[i-3]) {
				break
			}
		}
		sequence[i] = nextShape
	}

	return &NBackGameState{
		Settings:      settings,
		ShapeSequence: sequence,
	}
}

// CheckAnswer evaluates the player's answer for a given trial.
func (gs *NBackGameState) CheckAnswer(playerChoice string, responseTimeMs int, trial int) *types.NBackResult {
	correctChoice := "SPACE" // Default for "different"
	isCorrect := false

	// Determine the correct choice
	if gs.Settings.NBackLevel == 1 { // Round 1: 2-back
		if trial >= 2 && gs.ShapeSequence[trial] == gs.ShapeSequence[trial-2] {
			correctChoice = "LEFT"
		}
	} else { // Round 2: 2-back or 3-back
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

	// Create result
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
