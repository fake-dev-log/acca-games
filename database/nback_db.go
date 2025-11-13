package database

import (
	"database/sql"
	"fmt"

	"acca-games/types"
)

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



// GetNBackResultsForSession fetches all N-Back results for a given session ID.
func GetNBackResultsForSession(db *sql.DB, sessionID int64) ([]types.NBackResult, error) {
	rows, err := db.Query(`
		SELECT id, session_id, round, question_num, is_correct, response_time_ms, player_choice, correct_choice
		FROM nback_results WHERE session_id = ? ORDER BY question_num ASC`, sessionID)

	if err != nil {
		return nil, fmt.Errorf("failed to query N-Back results: %w", err)
	}
	defer rows.Close()

	var results []types.NBackResult

	for rows.Next() {
		var result types.NBackResult
		
		if err := rows.Scan(&result.ID, &result.SessionID, &result.Round, &result.QuestionNum, &result.IsCorrect, &result.ResponseTimeMs, &result.PlayerChoice, &result.CorrectChoice); err != nil {
			return nil, fmt.Errorf("failed to scan N-Back results: %w", err)
		}
		results = append(results, result)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error after scanning rows: %w", err)
	}

	return results, nil
}

// GetPaginatedNBackSessionsWithResults fetches paginated sessions with their results.
func GetPaginatedNBackSessionsWithResults(db *sql.DB, page int, limit int) (*types.PaginatedNBackSessions, error) {
	offset := (page - 1) * limit

	// First, get the total count of sessions
	var totalCount int

	err := db.QueryRow("SELECT COUNT(*) FROM game_sessions WHERE game_code = ?", types.GameCodeNBack).Scan(&totalCount)

	if err != nil {
		return nil, fmt.Errorf("failed to get total n-back session count: %w", err)
	}

	// Then, fetch the paginated session data
	query := `
		SELECT
			s.id, s.game_code, s.play_datetime, s.settings,
			r.id, r.session_id, r.round, r.question_num, r.is_correct, r.response_time_ms, r.player_choice, r.correct_choice
		FROM game_sessions s
		JOIN nback_results r ON s.id = r.session_id
		WHERE s.id IN (
			SELECT id FROM game_sessions
			WHERE game_code = ?
			ORDER BY play_datetime DESC
			LIMIT ? OFFSET ?
		)
		ORDER BY s.play_datetime DESC, r.question_num ASC
	`

	rows, err := db.Query(query, types.GameCodeNBack, limit, offset)

	if err != nil {
		return nil, fmt.Errorf("failed to query paginated n-back sessions with results: %w", err)
	}
	defer rows.Close()

	sessionMap := make(map[int64]*types.NBackSessionWithResults)
	var sessionOrder []int64

	for rows.Next() {
		var s types.GameSession
		var r types.NBackResult
		var settingsJSON string

		if err := rows.Scan(
			&s.ID, &s.GameCode, &s.PlayDatetime, &settingsJSON,
			&r.ID, &r.SessionID, &r.Round, &r.QuestionNum, &r.IsCorrect, &r.ResponseTimeMs, &r.PlayerChoice, &r.CorrectChoice,
		); err != nil {
			return nil, fmt.Errorf("failed to scan n-back session/result: %w", err)
		}
		s.Settings = settingsJSON

		if _, ok := sessionMap[s.ID]; !ok {
			sessionMap[s.ID] = &types.NBackSessionWithResults{
				GameSession: s,
				Results:     []types.NBackResult{},
			}
			sessionOrder = append(sessionOrder, s.ID)
		}
		sessionMap[s.ID].Results = append(sessionMap[s.ID].Results, r)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error after scanning rows: %w", err)
	}

	// Preserve the order
	sessions := make([]types.NBackSessionWithResults, len(sessionOrder))
	for i, id := range sessionOrder {
		sessions[i] = *sessionMap[id]
	}

	return &types.PaginatedNBackSessions{
		Sessions:   sessions,
		TotalCount: totalCount,
	}, nil
}
