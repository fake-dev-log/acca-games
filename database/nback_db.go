package database

import (
	"acca-games/types"
	"database/sql"
	"encoding/json"
	"fmt"
)

// CreateNBackSession creates a new game session for an N-Back game.
func CreateNBackSession(db *sql.DB, settings types.NBackSettings) (int64, error) {
	settingsJSON, err := json.Marshal(settings)
	if err != nil {
		return 0, fmt.Errorf("failed to marshal settings: %w", err)
	}

	result, err := db.Exec("INSERT INTO game_sessions (game_code, settings) VALUES (?, ?)", "SHAPE_MEMORY", string(settingsJSON))
	if err != nil {
		return 0, fmt.Errorf("failed to insert new game session: %w", err)
	}

	sessionID, err := result.LastInsertId()
	if err != nil {
		return 0, fmt.Errorf("failed to get last insert ID: %w", err)
	}

	return sessionID, nil
}

// SaveNBackResult saves a single trial's result to the database.
func SaveNBackResult(db *sql.DB, result types.NBackResult) error {
	_, err := db.Exec(`
		INSERT INTO shape_memory_results (session_id, round, question_num, is_correct, response_time_ms, player_choice, correct_choice)
		VALUES (?, ?, ?, ?, ?, ?, ?)`, 
		result.SessionID, 
		result.Round, 
		result.QuestionNum, 
		result.IsCorrect, 
		result.ResponseTimeMs, 
		result.PlayerChoice, 
		result.CorrectChoice,
	)
	if err != nil {
		return fmt.Errorf("failed to insert n-back result: %w", err)
	}
	return nil
}
