package database

import (
	"database/sql"
	"encoding/json"
	"fmt"

	"acca-games/types"
)

// CreateNBackSession creates a new game session for an N-Back game.
func CreateNBackSession(db *sql.DB, settings types.NBackSettings) (int64, error) {
	settingsJSON, err := json.Marshal(settings)
	if err != nil {
		return 0, fmt.Errorf("failed to marshal settings: %w", err)
	}

	result, err := db.Exec("INSERT INTO game_sessions (game_code, settings) VALUES (?, ?)", "NBACK", string(settingsJSON))
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
		INSERT INTO nback_results (session_id, round, question_num, is_correct, response_time_ms, player_choice, correct_choice)
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
		return fmt.Errorf("failed to insert N-Back result: %w", err)
	}
	return nil
}

// GetNBackGameSessions fetches all N-Back game sessions.
func GetNBackGameSessions(db *sql.DB) ([]types.GameSession, error) {
	rows, err := db.Query("SELECT session_id, game_code, play_datetime, settings FROM game_sessions WHERE game_code = ? ORDER BY play_datetime DESC", "NBACK")
	if err != nil {
		return nil, fmt.Errorf("failed to query game sessions: %w", err)
	}
	defer rows.Close()

	var sessions []types.GameSession
	for rows.Next() {
		var session types.GameSession
		if err := rows.Scan(&session.SessionID, &session.GameCode, &session.PlayDatetime, &session.Settings); err != nil {
			return nil, fmt.Errorf("failed to scan game session: %w", err)
		}
		sessions = append(sessions, session)
	}

	return sessions, nil
}

// GetNBackResultsForSession fetches all N-Back results for a given session ID.
func GetNBackResultsForSession(db *sql.DB, sessionID int64) ([]types.NBackRecord, error) {
	rows, err := db.Query(`
		SELECT result_id, session_id, round, question_num, is_correct, response_time_ms, player_choice, correct_choice
		FROM nback_results WHERE session_id = ? ORDER BY question_num ASC`, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to query N-Back results: %w", err)
	}
	defer rows.Close()

	var records []types.NBackRecord
	for rows.Next() {
		var record types.NBackRecord
		if err := rows.Scan(&record.ResultID, &record.SessionID, &record.Round, &record.QuestionNum, &record.IsCorrect, &record.ResponseTimeMs, &record.PlayerChoice, &record.CorrectChoice); err != nil {
			return nil, fmt.Errorf("failed to scan N-Back record: %w", err)
		}
		records = append(records, record)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error after scanning rows: %w", err)
	}

	// Explicitly return an empty slice if no records were found
	if len(records) == 0 {
		return []types.NBackRecord{}, nil
	}

	return records, nil
}

// GetAllNBackResults fetches all N-Back results across all sessions.
func GetAllNBackResults(db *sql.DB) ([]types.NBackRecord, error) {
	rows, err := db.Query(`
		SELECT result_id, session_id, round, question_num, is_correct, response_time_ms, player_choice, correct_choice
		FROM nback_results ORDER BY session_id ASC, question_num ASC`)
	if err != nil {
		return nil, fmt.Errorf("failed to query all N-Back results: %w", err)
	}
	defer rows.Close()

	var records []types.NBackRecord
	for rows.Next() {
		var record types.NBackRecord
		if err := rows.Scan(&record.ResultID, &record.SessionID, &record.Round, &record.QuestionNum, &record.IsCorrect, &record.ResponseTimeMs, &record.PlayerChoice, &record.CorrectChoice); err != nil {
			return nil, fmt.Errorf("failed to scan N-Back record: %w", err)
		}
		records = append(records, record)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error after scanning rows: %w", err)
	}

	if len(records) == 0 {
		return []types.NBackRecord{}, nil
	}

	return records, nil
}