package database

import (
	"acca-games/types"
	"database/sql"
	"fmt"
)

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
		SELECT id, session_id, round, question_num, problem_card_holder, given_card, 
		       is_correct, response_time_ms, player_choice, correct_choice
		FROM rps_results
		WHERE session_id = ?
		ORDER BY question_num ASC
	`, sessionID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	results := make([]types.RpsResult, 0)
	for rows.Next() {
		var r types.RpsResult
		if err := rows.Scan(
			&r.ID, &r.SessionID, &r.Round, &r.QuestionNum, &r.ProblemCardHolder, &r.GivenCard,
			&r.IsCorrect, &r.ResponseTimeMs, &r.PlayerChoice, &r.CorrectChoice,
		); err != nil {
			return nil, err
		}
		results = append(results, r)
	}

	return results, nil
}

// GetPaginatedRpsSessionsWithResults fetches paginated RPS sessions with their results.
func GetPaginatedRpsSessionsWithResults(db *sql.DB, page int, limit int) (*types.PaginatedRpsSessions, error) {
	offset := (page - 1) * limit

	// First, get the total count of sessions
	var totalCount int
	err := db.QueryRow("SELECT COUNT(*) FROM game_sessions WHERE game_code = ?", types.GameCodeRPS).Scan(&totalCount)
	if err != nil {
		return nil, fmt.Errorf("failed to get total rps session count: %w", err)
	}

	query := `
		SELECT
			s.id, s.game_code, s.play_datetime, s.settings,
			r.id, r.session_id, r.round, r.question_num, r.problem_card_holder, r.given_card,
			r.is_correct, r.response_time_ms, r.player_choice, r.correct_choice
		FROM game_sessions s
		JOIN rps_results r ON s.id = r.session_id
		WHERE s.id IN (
			SELECT id FROM game_sessions
			WHERE game_code = ?
			ORDER BY play_datetime DESC
			LIMIT ? OFFSET ?
		)
		ORDER BY s.play_datetime DESC, r.question_num ASC
	`

	rows, err := db.Query(query, types.GameCodeRPS, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query paginated rps sessions with results: %w", err)
	}
	defer rows.Close()

	sessionMap := make(map[int64]*types.RpsSessionWithResults)
	var sessionOrder []int64

	for rows.Next() {
		var s types.GameSession
		var r types.RpsResult
		var settingsJSON string

		if err := rows.Scan(
			&s.ID, &s.GameCode, &s.PlayDatetime, &settingsJSON,
			&r.ID, &r.SessionID, &r.Round, &r.QuestionNum, &r.ProblemCardHolder, &r.GivenCard,
			&r.IsCorrect, &r.ResponseTimeMs, &r.PlayerChoice, &r.CorrectChoice,
		); err != nil {
			return nil, fmt.Errorf("failed to scan rps session/result: %w", err)
		}
		s.Settings = settingsJSON

		if _, ok := sessionMap[s.ID]; !ok {
			sessionMap[s.ID] = &types.RpsSessionWithResults{
				GameSession: s,
				Results:     []types.RpsResult{},
			}
			sessionOrder = append(sessionOrder, s.ID)
		}
		sessionMap[s.ID].Results = append(sessionMap[s.ID].Results, r)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error after scanning rps rows: %w", err)
	}

	sessions := make([]types.RpsSessionWithResults, len(sessionOrder))
	for i, id := range sessionOrder {
		sessions[i] = *sessionMap[id]
	}

	return &types.PaginatedRpsSessions{
		Sessions:   sessions,
		TotalCount: totalCount,
	}, nil
}

// GetRpsSessionStats calculates and returns aggregated statistics for a given RPS game session.
func GetRpsSessionStats(db *sql.DB, sessionID int64) (*types.RpsSessionStats, error) {
	results, err := GetRpsResultsForSession(db, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get rps results for session %d: %w", sessionID, err)
	}

	if len(results) == 0 {
		return nil, fmt.Errorf("no rps results found for session %d", sessionID)
	}

	stats := &types.RpsSessionStats{
		SessionID: sessionID,
	}

	// Temporary maps for aggregation
	roundStatsMap := make(map[int]*types.RpsRoundStats)
	
	var totalResponseTimeMs int
	
	for _, r := range results {
		stats.TotalQuestions++
		totalResponseTimeMs += r.ResponseTimeMs
		if r.IsCorrect {
			stats.TotalCorrect++
		}

		// Aggregate per-round stats
		if _, ok := roundStatsMap[r.Round]; !ok {
			roundStatsMap[r.Round] = &types.RpsRoundStats{
				Round: r.Round,
				ProblemCardHolderStats: []types.RpsProblemCardHolderStat{}, // Initialize slice
			}
		}
		roundStats := roundStatsMap[r.Round]
		roundStats.TotalQuestions++
		roundStats.AverageResponseTimeMs += float64(r.ResponseTimeMs)
		if r.IsCorrect {
			roundStats.TotalCorrect++
		}

		// Aggregate per-problem-card-holder stats within each round
		foundProblemCardHolderStat := false
		for i, pchs := range roundStats.ProblemCardHolderStats {
			if pchs.ProblemCardHolder == r.ProblemCardHolder {
				roundStats.ProblemCardHolderStats[i].TotalQuestions++
				roundStats.ProblemCardHolderStats[i].AverageResponseTimeMs += float64(r.ResponseTimeMs)
				if r.IsCorrect {
					roundStats.ProblemCardHolderStats[i].TotalCorrect++
				}
				foundProblemCardHolderStat = true
				break
			}
		}
		if !foundProblemCardHolderStat {
			newPCHS := types.RpsProblemCardHolderStat{
				ProblemCardHolder: r.ProblemCardHolder,
				TotalQuestions:    1,
				AverageResponseTimeMs: float64(r.ResponseTimeMs),
			}
			if r.IsCorrect {
				newPCHS.TotalCorrect = 1
			}
			roundStats.ProblemCardHolderStats = append(roundStats.ProblemCardHolderStats, newPCHS)
		}
	}

	// Calculate overall averages and accuracies
	if stats.TotalQuestions > 0 {
		stats.OverallAccuracy = float64(stats.TotalCorrect) / float64(stats.TotalQuestions) * 100
		stats.AverageResponseTimeMs = float64(totalResponseTimeMs) / float64(stats.TotalQuestions)
	}

	// Finalize per-round and per-problem-card-holder stats
	for _, roundStats := range roundStatsMap {
		if roundStats.TotalQuestions > 0 {
			roundStats.Accuracy = float64(roundStats.TotalCorrect) / float64(roundStats.TotalQuestions) * 100
			roundStats.AverageResponseTimeMs /= float64(roundStats.TotalQuestions)
		}

		for i, pchs := range roundStats.ProblemCardHolderStats {
			if pchs.TotalQuestions > 0 {
				roundStats.ProblemCardHolderStats[i].Accuracy = float64(pchs.TotalCorrect) / float64(pchs.TotalQuestions) * 100
				roundStats.ProblemCardHolderStats[i].AverageResponseTimeMs /= float64(pchs.TotalQuestions)
			}
		}
		stats.RoundStats = append(stats.RoundStats, *roundStats)
	}

	// Sort round stats by round number
	// This is important for consistent display on the frontend
	for i := 0; i < len(stats.RoundStats)-1; i++ {
		for j := i + 1; j < len(stats.RoundStats); j++ {
			if stats.RoundStats[i].Round > stats.RoundStats[j].Round {
				stats.RoundStats[i], stats.RoundStats[j] = stats.RoundStats[j], stats.RoundStats[i]
			}
		}
	}

	return stats, nil
}

