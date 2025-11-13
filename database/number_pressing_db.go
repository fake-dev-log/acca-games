package database

import (
	"database/sql"
	"encoding/json"
	"acca-games/types"
	"fmt"
	"strings"
)

func SaveNumberPressingResultR1(db *sql.DB, result types.NumberPressingResultR1) error {
	_, err := db.Exec("INSERT INTO number_pressing_results_r1 (session_id, target_number, time_taken, is_correct) VALUES (?, ?, ?, ?)",
		result.SessionID, result.Problem.TargetNumber, result.TimeTaken, result.IsCorrect)
	return err
}

func SaveNumberPressingResultR2(db *sql.DB, result types.NumberPressingResultR2) error {
	doubleClickJSON, _ := json.Marshal(result.Problem.DoubleClick)
	skipJSON, _ := json.Marshal(result.Problem.Skip)
	playerClicksJSON, _ := json.Marshal(result.PlayerClicks)
	correctClicksJSON, _ := json.Marshal(result.CorrectClicks)

	_, err := db.Exec("INSERT INTO number_pressing_results_r2 (session_id, double_click_numbers, skip_numbers, player_clicks, correct_clicks, time_taken, is_correct) VALUES (?, ?, ?, ?, ?, ?, ?)",
		result.SessionID, string(doubleClickJSON), string(skipJSON), string(playerClicksJSON), string(correctClicksJSON), result.TimeTaken, result.IsCorrect)
	return err
}

func GetNumberPressingResultsForSession(db *sql.DB, sessionID int64) (*types.NumberPressingResultsBundle, error) {
	rowsR1, err := db.Query("SELECT session_id, target_number, time_taken, is_correct FROM number_pressing_results_r1 WHERE session_id = ?", sessionID)
	if err != nil {
		return nil, err
	}
	defer rowsR1.Close()

	resultsR1 := make([]types.NumberPressingResultR1, 0)
	for rowsR1.Next() {
		var res types.NumberPressingResultR1
		if err := rowsR1.Scan(&res.SessionID, &res.Problem.TargetNumber, &res.TimeTaken, &res.IsCorrect); err != nil {
			return nil, err
		}
		resultsR1 = append(resultsR1, res)
	}

	rowsR2, err := db.Query("SELECT session_id, double_click_numbers, skip_numbers, player_clicks, correct_clicks, time_taken, is_correct FROM number_pressing_results_r2 WHERE session_id = ?", sessionID)
	if err != nil {
		return nil, err
	}
	defer rowsR2.Close()

	resultsR2 := make([]types.NumberPressingResultR2, 0)
	for rowsR2.Next() {
		var res types.NumberPressingResultR2
		var doubleClickJSON, skipJSON, playerClicksJSON, correctClicksJSON string
		if err := rowsR2.Scan(&res.SessionID, &doubleClickJSON, &skipJSON, &playerClicksJSON, &correctClicksJSON, &res.TimeTaken, &res.IsCorrect); err != nil {
			return nil, err
		}
		json.Unmarshal([]byte(doubleClickJSON), &res.Problem.DoubleClick)
		json.Unmarshal([]byte(skipJSON), &res.Problem.Skip)
		json.Unmarshal([]byte(playerClicksJSON), &res.PlayerClicks)
		json.Unmarshal([]byte(correctClicksJSON), &res.CorrectClicks)
		resultsR2 = append(resultsR2, res)
	}

	return &types.NumberPressingResultsBundle{ResultsR1: resultsR1, ResultsR2: resultsR2}, nil
}

// GetPaginatedNumberPressingSessionsWithResults fetches paginated sessions with their results.
func GetPaginatedNumberPressingSessionsWithResults(db *sql.DB, page int, limit int) (*types.PaginatedNumberPressingSessions, error) {

	offset := (page - 1) * limit
	
	// 1. Get the total count of sessions
	var totalCount int
	err := db.QueryRow("SELECT COUNT(*) FROM game_sessions WHERE game_code = ?", types.GameCodeNumberPressing).Scan(&totalCount)
	if err != nil {
		return nil, fmt.Errorf("failed to get total number pressing session count: %w", err)
	}

	// 2. Get a page of session IDs
	rows, err := db.Query("SELECT id FROM game_sessions WHERE game_code = ? ORDER BY play_datetime DESC LIMIT ? OFFSET ?", types.GameCodeNumberPressing, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query for paginated session IDs: %w", err)
	}
	defer rows.Close()

	var sessionIDs []interface{}
	var sessionIDOrder []int64
	for rows.Next() {
		var id int64
		if err := rows.Scan(&id); err != nil {
			return nil, err
		}
		sessionIDs = append(sessionIDs, id)
		sessionIDOrder = append(sessionIDOrder, id)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	if len(sessionIDs) == 0 {
		return &types.PaginatedNumberPressingSessions{
			Sessions:   []types.NumberPressingSessionWithResults{},
			TotalCount: totalCount,
		}, nil
	}

	// 3. Fetch session details for these IDs
	sessionQuery := "SELECT id, game_code, play_datetime, settings FROM game_sessions WHERE id IN (?" + strings.Repeat(",?", len(sessionIDs)-1) + ")"
	sessionRows, err := db.Query(sessionQuery, sessionIDs...)
	if err != nil {
		return nil, fmt.Errorf("failed to query session details: %w", err)
	}
	defer sessionRows.Close()

	sessionMap := make(map[int64]*types.NumberPressingSessionWithResults)
	for sessionRows.Next() {
		var s types.GameSession
		if err := sessionRows.Scan(&s.ID, &s.GameCode, &s.PlayDatetime, &s.Settings); err != nil {
			return nil, err
		}
		sessionMap[s.ID] = &types.NumberPressingSessionWithResults{
			GameSession: s,
			Results: types.NumberPressingResultsBundle{
				ResultsR1: []types.NumberPressingResultR1{},
				ResultsR2: []types.NumberPressingResultR2{},
			},
		}
	}

	if err = sessionRows.Err(); err != nil {
		return nil, err
	}

	// 4. Fetch R1 results for these session IDs
	r1Query := "SELECT session_id, target_number, time_taken, is_correct FROM number_pressing_results_r1 WHERE session_id IN (?" + strings.Repeat(",?", len(sessionIDs)-1) + ")"
	rowsR1, err := db.Query(r1Query, sessionIDs...)
	if err != nil {
		return nil, fmt.Errorf("failed to query R1 results: %w", err)
	}
	defer rowsR1.Close()

	for rowsR1.Next() {
		var res types.NumberPressingResultR1
		if err := rowsR1.Scan(&res.SessionID, &res.Problem.TargetNumber, &res.TimeTaken, &res.IsCorrect); err != nil {
			return nil, err
		}
		if session, ok := sessionMap[res.SessionID]; ok {
			session.Results.ResultsR1 = append(session.Results.ResultsR1, res)
		}
	}
	
	if err = rowsR1.Err(); err != nil {
		return nil, err
	}

	// 5. Fetch R2 results for these session IDs
	r2Query := "SELECT session_id, double_click_numbers, skip_numbers, player_clicks, correct_clicks, time_taken, is_correct FROM number_pressing_results_r2 WHERE session_id IN (?" + strings.Repeat(",?", len(sessionIDs)-1) + ")"
	rowsR2, err := db.Query(r2Query, sessionIDs...)
	if err != nil {
		return nil, fmt.Errorf("failed to query R2 results: %w", err)
	}
	defer rowsR2.Close()

	for rowsR2.Next() {
		var res types.NumberPressingResultR2
		var doubleClickJSON, skipJSON, playerClicksJSON, correctClicksJSON string
		if err := rowsR2.Scan(&res.SessionID, &doubleClickJSON, &skipJSON, &playerClicksJSON, &correctClicksJSON, &res.TimeTaken, &res.IsCorrect); err != nil {
			return nil, err
		}
		json.Unmarshal([]byte(doubleClickJSON), &res.Problem.DoubleClick)
		json.Unmarshal([]byte(skipJSON), &res.Problem.Skip)
		json.Unmarshal([]byte(playerClicksJSON), &res.PlayerClicks)
		json.Unmarshal([]byte(correctClicksJSON), &res.CorrectClicks)
		if session, ok := sessionMap[res.SessionID]; ok {
			session.Results.ResultsR2 = append(session.Results.ResultsR2, res)
		}
	}

	if err = rowsR2.Err(); err != nil {
		return nil, err
	}

	// 6. Stitch together in order
	finalResults := make([]types.NumberPressingSessionWithResults, len(sessionIDOrder))
	for i, id := range sessionIDOrder {
		finalResults[i] = *sessionMap[id]
	}

	return &types.PaginatedNumberPressingSessions{
		Sessions:   finalResults,
		TotalCount: totalCount,
	}, nil
}
