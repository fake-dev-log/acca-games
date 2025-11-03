package database

import (
	"acca-games/types"
	"database/sql"
	"encoding/json"
)

// CreateGameSession creates a new game session and returns the session ID.
func CreateGameSession(db *sql.DB, gameCode string, settings interface{}) (int64, error) {
	settingsJSON, err := json.Marshal(settings)
	if err != nil {
		return 0, err
	}

	stmt, err := db.Prepare("INSERT INTO game_sessions (game_code, settings) VALUES (?, ?)")
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	res, err := stmt.Exec(gameCode, string(settingsJSON))
	if err != nil {
		return 0, err
	}

	return res.LastInsertId()
}

// SaveRpsResult saves a single result from a Rock-Paper-Scissors game trial.
func SaveRpsResult(db *sql.DB, result types.RpsResult) error {
	stmt, err := db.Prepare(`
		INSERT INTO rps_results (
			session_id, round, question_num, problem_card_holder, given_card, 
			is_correct, response_time_ms, player_choice, correct_choice
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return err
	}
	defer stmt.Close()

	_, err = stmt.Exec(
		result.SessionID,
		result.Round,
		result.QuestionNum,
		result.ProblemCardHolder,
		result.GivenCard,
		result.IsCorrect,
		result.ResponseTimeMs,
		result.PlayerChoice,
		result.CorrectChoice,
	)

	return err
}

// GetRpsResultsForSession fetches all results for a given RPS session ID.
func GetRpsResultsForSession(db *sql.DB, sessionID int64) ([]types.RpsResult, error) {
	rows, err := db.Query(`
		SELECT session_id, round, question_num, problem_card_holder, given_card, 
		       is_correct, response_time_ms, player_choice, correct_choice
		FROM rps_results
		WHERE session_id = ?
		ORDER BY question_num ASC
	`, sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []types.RpsResult
	for rows.Next() {
		var r types.RpsResult
		if err := rows.Scan(
			&r.SessionID, &r.Round, &r.QuestionNum, &r.ProblemCardHolder, &r.GivenCard,
			&r.IsCorrect, &r.ResponseTimeMs, &r.PlayerChoice, &r.CorrectChoice,
		); err != nil {
			return nil, err
		}
		results = append(results, r)
	}

	return results, nil
}

// GetAllRpsResults fetches all results across all RPS sessions.
func GetAllRpsResults(db *sql.DB) ([]types.RpsResult, error) {
	rows, err := db.Query(`
		SELECT session_id, round, question_num, problem_card_holder, given_card, 
		       is_correct, response_time_ms, player_choice, correct_choice
		FROM rps_results
		ORDER BY session_id, question_num ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []types.RpsResult
	for rows.Next() {
		var r types.RpsResult
		if err := rows.Scan(
			&r.SessionID, &r.Round, &r.QuestionNum, &r.ProblemCardHolder, &r.GivenCard,
			&r.IsCorrect, &r.ResponseTimeMs, &r.PlayerChoice, &r.CorrectChoice,
		); err != nil {
			return nil, err
		}
		results = append(results, r)
	}

	return results, nil
}
