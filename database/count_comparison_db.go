package database

import (
	"database/sql"
	"encoding/json"
	"fmt"

	"acca-games/types"
)

// SaveCountComparisonResult saves a single problem's result to the database.
func SaveCountComparisonResult(db *sql.DB, result types.CountComparisonResult) error {
	_, err := db.Exec(`
		INSERT INTO count_comparison_results (
			session_id, problem_number, is_correct, response_time_ms, player_choice,
			correct_choice, left_word, right_word, left_word_count, right_word_count, applied_traps
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		result.SessionID,
		result.ProblemNumber,
		result.IsCorrect,
		result.ResponseTimeMs,
		result.PlayerChoice,
		result.CorrectChoice,
		result.LeftWord,
		result.RightWord,
		result.LeftWordCount,
		result.RightWordCount,
		result.AppliedTraps, // Already a JSON string
	)
	if err != nil {
		return fmt.Errorf("failed to insert count comparison result: %w", err)
	}
	return nil
}

// GetCountComparisonResultsForSession fetches all Count Comparison results for a given session ID.
func GetCountComparisonResultsForSession(db *sql.DB, sessionID int64) ([]types.CountComparisonResult, error) {
	rows, err := db.Query(`
		SELECT
			id, session_id, problem_number, is_correct, response_time_ms, player_choice,
			correct_choice, left_word, right_word, left_word_count, right_word_count, applied_traps
		FROM count_comparison_results WHERE session_id = ? ORDER BY problem_number ASC`, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to query count comparison results: %w", err)
	}
	defer rows.Close()

	var results []types.CountComparisonResult
	for rows.Next() {
		var result types.CountComparisonResult
		var appliedTrapsJSON string

		if err := rows.Scan(
			&result.ID, &result.SessionID, &result.ProblemNumber, &result.IsCorrect, &result.ResponseTimeMs, &result.PlayerChoice,
			&result.CorrectChoice, &result.LeftWord, &result.RightWord, &result.LeftWordCount, &result.RightWordCount, &appliedTrapsJSON,
		); err != nil {
			return nil, fmt.Errorf("failed to scan count comparison result: %w", err)
		}
		result.AppliedTraps = appliedTrapsJSON // Store as JSON string, unmarshal later if needed for stats

		results = append(results, result)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error after scanning rows: %w", err)
	}

	return results, nil
}

// GetPaginatedCountComparisonSessionsWithResults fetches paginated sessions with their results.
func GetPaginatedCountComparisonSessionsWithResults(db *sql.DB, page int, limit int) (*types.PaginatedCountComparisonSessions, error) {
	offset := (page - 1) * limit

	// First, get the total count of sessions
	var totalCount int
	err := db.QueryRow("SELECT COUNT(*) FROM game_sessions WHERE game_code = ?", types.GameCodeCountComparison).Scan(&totalCount)
	if err != nil {
		return nil, fmt.Errorf("failed to get total count comparison session count: %w", err)
	}

	// Then, fetch the paginated session data
	query := `
		SELECT
			s.id, s.game_code, s.play_datetime, s.settings,
			r.id, r.session_id, r.problem_number, r.is_correct, r.response_time_ms, r.player_choice,
			r.correct_choice, r.left_word, r.right_word, r.left_word_count, r.right_word_count, r.applied_traps
		FROM game_sessions s
		JOIN count_comparison_results r ON s.id = r.session_id
		WHERE s.id IN (
			SELECT id FROM game_sessions
			WHERE game_code = ?
			ORDER BY play_datetime DESC
			LIMIT ? OFFSET ?
		)
		ORDER BY s.play_datetime DESC, r.problem_number ASC
	`
	rows, err := db.Query(query, types.GameCodeCountComparison, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query paginated count comparison sessions with results: %w", err)
	}
	defer rows.Close()

	sessionMap := make(map[int64]*types.CountComparisonSessionWithResults)
	var sessionOrder []int64

	for rows.Next() {
		var s types.GameSession
		var r types.CountComparisonResult
		var settingsJSON string

		if err := rows.Scan(
			&s.ID, &s.GameCode, &s.PlayDatetime, &settingsJSON,
			&r.ID, &r.SessionID, &r.ProblemNumber, &r.IsCorrect, &r.ResponseTimeMs, &r.PlayerChoice,
			&r.CorrectChoice, &r.LeftWord, &r.RightWord, &r.LeftWordCount, &r.RightWordCount, &r.AppliedTraps,
		); err != nil {
			return nil, fmt.Errorf("failed to scan count comparison session/result: %w", err)
		}
		s.Settings = settingsJSON

		if _, ok := sessionMap[s.ID]; !ok {
			sessionMap[s.ID] = &types.CountComparisonSessionWithResults{
				GameSession: s,
				Results:     []types.CountComparisonResult{},
			}
			sessionOrder = append(sessionOrder, s.ID)
		}
		sessionMap[s.ID].Results = append(sessionMap[s.ID].Results, r)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error after scanning rows: %w", err)
	}

	// Preserve the order
	sessions := make([]types.CountComparisonSessionWithResults, len(sessionOrder))
	for i, id := range sessionOrder {
		sessions[i] = *sessionMap[id]
	}

	return &types.PaginatedCountComparisonSessions{
		Sessions:   sessions,
		TotalCount: totalCount,
	}, nil
}

// GetCountComparisonSessionStats calculates and returns aggregated statistics for a given session.
func GetCountComparisonSessionStats(db *sql.DB, sessionID int64) (*types.CountComparisonSessionStats, error) {
	results, err := GetCountComparisonResultsForSession(db, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get count comparison results for session %d: %w", sessionID, err)
	}

	if len(results) == 0 {
		return nil, fmt.Errorf("no count comparison results found for session %d", sessionID)
	}

	stats := &types.CountComparisonSessionStats{
		SessionID: sessionID,
	}
	
	// Temporarily store trap stats in a map for easier aggregation
	trapStatsMap := make(map[string]*types.TrapStat)

	for _, r := range results {
		stats.TotalQuestions++
		stats.AverageResponseTimeMs += float64(r.ResponseTimeMs) // Sum up for average later
		if r.IsCorrect {
			stats.TotalCorrect++
		}

		var appliedTraps []types.AppliedTrap
		if r.AppliedTraps != "" {
			err := json.Unmarshal([]byte(r.AppliedTraps), &appliedTraps)
			if err != nil {
				return nil, fmt.Errorf("failed to unmarshal applied traps for result ID %d: %w", r.ID, err)
			}
		}

		if len(appliedTraps) == 0 {
			// If no specific traps applied, count as "No Trap" category
			if _, ok := trapStatsMap["No Trap"]; !ok {
				trapStatsMap["No Trap"] = &types.TrapStat{TrapType: "No Trap"}
			}
			ts := trapStatsMap["No Trap"]
			ts.TotalQuestions++
			ts.AverageResponseTime += float64(r.ResponseTimeMs)
			if r.IsCorrect {
				ts.TotalCorrect++
			}
		} else {
			for _, trap := range appliedTraps {
				trapKey := fmt.Sprintf("%s_%s", trap.Type, trap.AppliedTo) // e.g., "FontSize_left"
				if _, ok := trapStatsMap[trapKey]; !ok {
					trapStatsMap[trapKey] = &types.TrapStat{TrapType: trapKey}
				}
				ts := trapStatsMap[trapKey]
				ts.TotalQuestions++
				ts.AverageResponseTime += float64(r.ResponseTimeMs)
				if r.IsCorrect {
					ts.TotalCorrect++
				}
			}
		}
	}

	// Calculate averages and accuracies for overall stats
	if stats.TotalQuestions > 0 {
		stats.OverallAccuracy = float64(stats.TotalCorrect) / float64(stats.TotalQuestions) * 100
		stats.AverageResponseTimeMs /= float64(stats.TotalQuestions)
	}

	// Calculate averages and accuracies for trap-specific stats
	for _, ts := range trapStatsMap {
		if ts.TotalQuestions > 0 {
			ts.Accuracy = float64(ts.TotalCorrect) / float64(ts.TotalQuestions) * 100
			ts.AverageResponseTime /= float64(ts.TotalQuestions)
		}
		stats.TrapStats = append(stats.TrapStats, *ts)
	}

	return stats, nil
}
