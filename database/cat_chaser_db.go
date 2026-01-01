package database

import (
	"acca-games/types"
	"database/sql"
	"fmt"
)

// SaveCatChaserResult saves a single result of the Cat Chaser game.
func SaveCatChaserResult(db *sql.DB, result types.CatChaserResult) error {
	stmt, err := db.Prepare(`
		INSERT INTO cat_chaser_results (
			session_id, round, target_color, player_choice, confidence, 
			correct_choice, is_correct, score, response_time_ms
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		return fmt.Errorf("failed to prepare statement: %w", err)
	}
	defer stmt.Close()

	_, err = stmt.Exec(
		result.SessionID,
		result.Round,
		result.TargetColor,
		result.PlayerChoice,
		result.Confidence,
		result.CorrectChoice,
		result.IsCorrect,
		result.Score,
		result.ResponseTimeMs,
	)
	if err != nil {
		return fmt.Errorf("failed to execute statement: %w", err)
	}

	return nil
}

// GetCatChaserResultsBySessionID retrieves all results for a given session.
func GetCatChaserResultsBySessionID(db *sql.DB, sessionID int64) ([]types.CatChaserResult, error) {
	rows, err := db.Query(`
		SELECT id, session_id, round, target_color, player_choice, confidence, 
		       correct_choice, is_correct, score, response_time_ms
		FROM cat_chaser_results
		WHERE session_id = ?
		ORDER BY round ASC, target_color DESC
	`, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to query results: %w", err)
	}
	defer rows.Close()

	results := make([]types.CatChaserResult, 0) // Initialize as empty slice, not nil
	for rows.Next() {
		var r types.CatChaserResult
		var id int64 // placeholder
		err := rows.Scan(
			&id,
			&r.SessionID,
			&r.Round,
			&r.TargetColor,
			&r.PlayerChoice,
			&r.Confidence,
			&r.CorrectChoice,
			&r.IsCorrect,
			&r.Score,
			&r.ResponseTimeMs,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan row: %w", err)
		}
		results = append(results, r)
	}

	return results, nil
}

// GetPaginatedCatChaserSessionsWithResults fetches sessions with pagination and includes results for each session.
func GetPaginatedCatChaserSessionsWithResults(db *sql.DB, page int, limit int) (*types.PaginatedCatChaserSessions, error) {
	offset := (page - 1) * limit

	// 1. Get total count
	var totalCount int
	err := db.QueryRow("SELECT COUNT(*) FROM game_sessions WHERE game_code = ?", types.GameCodeCatChaser).Scan(&totalCount)
	if err != nil {
		return nil, fmt.Errorf("failed to get total count: %w", err)
	}

	// 2. Get sessions
	rows, err := db.Query(`
		SELECT id, game_code, play_datetime, settings
		FROM game_sessions
		WHERE game_code = ?
		ORDER BY play_datetime DESC
		LIMIT ? OFFSET ?
	`, types.GameCodeCatChaser, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get sessions: %w", err)
	}
	defer rows.Close()

	var sessions []types.CatChaserSessionWithResults
	for rows.Next() {
		var s types.CatChaserSessionWithResults
		var settingsStr string
		err := rows.Scan(&s.ID, &s.GameCode, &s.PlayDatetime, &settingsStr)
		if err != nil {
			return nil, fmt.Errorf("failed to scan session: %w", err)
		}
		s.Settings = settingsStr

		// 3. Get results for each session
		results, err := GetCatChaserResultsBySessionID(db, s.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to get results for session %d: %w", s.ID, err)
		}
		s.Results = results
		sessions = append(sessions, s)
	}

	if sessions == nil {
		sessions = []types.CatChaserSessionWithResults{}
	}

	return &types.PaginatedCatChaserSessions{
		Sessions:   sessions,
		TotalCount: totalCount,
	}, nil
}

// GetCatChaserSessionStats calculates statistics for a given session.
func GetCatChaserSessionStats(db *sql.DB, sessionID int64) (*types.CatChaserSessionStats, error) {
	results, err := GetCatChaserResultsBySessionID(db, sessionID)
	if err != nil {
		return nil, err
	}

	stats := &types.CatChaserSessionStats{
		SessionID:  sessionID,
		RoundStats: []types.CatChaserRoundStats{},
	}

	if len(results) == 0 {
		return stats, nil
	}

	totalTime := 0.0
	roundMap := make(map[int]*types.CatChaserRoundStats)

	for _, r := range results {
		stats.TotalQuestions++
		if r.IsCorrect {
			stats.TotalCorrect++
		}
		stats.TotalScore += r.Score
		totalTime += float64(r.ResponseTimeMs)

		if _, exists := roundMap[r.Round]; !exists {
			roundMap[r.Round] = &types.CatChaserRoundStats{
				Round: r.Round,
			}
		}
		rs := roundMap[r.Round]
		rs.TotalQuestions++
		if r.IsCorrect {
			rs.TotalCorrect++
		}
		rs.TotalScore += r.Score
		rs.AverageResponseTimeMs += float64(r.ResponseTimeMs) // Accumulate for now
	}

	if stats.TotalQuestions > 0 {
		stats.OverallAccuracy = (float64(stats.TotalCorrect) / float64(stats.TotalQuestions)) * 100
		stats.AverageResponseTimeMs = totalTime / float64(stats.TotalQuestions)
	}

	// Finalize round stats
	for _, rs := range roundMap {
		if rs.TotalQuestions > 0 {
			rs.Accuracy = (float64(rs.TotalCorrect) / float64(rs.TotalQuestions)) * 100
			rs.AverageResponseTimeMs /= float64(rs.TotalQuestions)
		}
		stats.RoundStats = append(stats.RoundStats, *rs)
	}

	// Sort RoundStats by Round
	// ... (Implementation detail: Map iteration order is random, so we should sort. 
	// But for simplicity, we can just rely on the frontend or sort here if needed.
	// Since rounds are 1..N, we can just loop.)
	
	sortedRoundStats := make([]types.CatChaserRoundStats, 0)
	// Find max round
	maxRound := 0
	for k := range roundMap {
		if k > maxRound {
			maxRound = k
		}
	}
	for i := 1; i <= maxRound; i++ {
		if rs, ok := roundMap[i]; ok {
			sortedRoundStats = append(sortedRoundStats, *rs)
		}
	}
	stats.RoundStats = sortedRoundStats

	return stats, nil
}
