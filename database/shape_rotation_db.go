package database

import (
	"acca-games/types"
	"database/sql"
	"encoding/json"
	"fmt"
)

func SaveShapeRotationSession(db *sql.DB, settings types.ShapeRotationSettings) (int64, error) {
	settingsJSON, err := json.Marshal(settings)
	if err != nil {
		return 0, err
	}

	session := types.GameSession{
		GameCode: types.GameCodeShapeRotation, // Standardized game code
		Settings: string(settingsJSON),
	}

	result, err := db.Exec(`INSERT INTO game_sessions (game_code, settings) VALUES (?, ?)`, session.GameCode, session.Settings)
	if err != nil {
		return 0, err
	}

	return result.LastInsertId()
}

func SaveShapeRotationResult(db *sql.DB, result types.ShapeRotationResult) error {
	solutionJSON, err := json.Marshal(result.UserSolution)
	if err != nil {
		return err
	}

	_, err = db.Exec(`
		INSERT INTO shape_rotation_results (session_id, problem_id, user_solution, is_correct, solve_time, click_count)
		VALUES (?, ?, ?, ?, ?, ?)
	`, result.SessionID, result.ProblemID, string(solutionJSON), result.IsCorrect, result.SolveTime, result.ClickCount)

	return err
}

func GetShapeRotationResultsForSession(db *sql.DB, sessionID int64) ([]types.ShapeRotationResult, error) {
	rows, err := db.Query(`
		SELECT id, session_id, problem_id, user_solution, is_correct, solve_time, click_count
		FROM shape_rotation_results
		WHERE session_id = ?
	`, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to query shape rotation results for session %d: %w", sessionID, err)
	}
	defer rows.Close()

	var results []types.ShapeRotationResult
	for rows.Next() {
		var r types.ShapeRotationResult
		var solutionJSON string
		if err := rows.Scan(&r.ID, &r.SessionID, &r.ProblemID, &solutionJSON, &r.IsCorrect, &r.SolveTime, &r.ClickCount); err != nil {
			return nil, fmt.Errorf("failed to scan shape rotation result for session %d: %w", sessionID, err)
		}
		json.Unmarshal([]byte(solutionJSON), &r.UserSolution)
		results = append(results, r)
	}
	return results, nil
}

// GetPaginatedShapeRotationSessionsWithResults fetches paginated sessions with their results.
func GetPaginatedShapeRotationSessionsWithResults(db *sql.DB, page int, limit int) (*types.PaginatedShapeRotationSessions, error) {
	offset := (page - 1) * limit

	// First, get the total count of sessions
	var totalCount int
	err := db.QueryRow("SELECT COUNT(*) FROM game_sessions WHERE game_code = ?", types.GameCodeShapeRotation).Scan(&totalCount)
	if err != nil {
		return nil, fmt.Errorf("failed to get total shape rotation session count: %w", err)
	}

	query := `
		SELECT
			s.id, s.game_code, s.play_datetime, s.settings,
			r.id, r.session_id, r.problem_id, r.user_solution, r.is_correct, r.solve_time, r.click_count
		FROM game_sessions s
		JOIN shape_rotation_results r ON s.id = r.session_id
		WHERE s.id IN (
			SELECT id FROM game_sessions
			WHERE game_code = ?
			ORDER BY play_datetime DESC
			LIMIT ? OFFSET ?
		)
		ORDER BY s.play_datetime DESC
	`

	rows, err := db.Query(query, types.GameCodeShapeRotation, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query paginated shape rotation sessions with results: %w", err)
	}
	defer rows.Close()

	sessionMap := make(map[int64]*types.ShapeRotationSessionWithResults)
	var sessionOrder []int64

	for rows.Next() {
		var s types.GameSession
		var r types.ShapeRotationResult
		var settingsJSON, solutionJSON string

		if err := rows.Scan(
			&s.ID, &s.GameCode, &s.PlayDatetime, &settingsJSON,
			&r.ID, &r.SessionID, &r.ProblemID, &solutionJSON, &r.IsCorrect, &r.SolveTime, &r.ClickCount,
		); err != nil {
			return nil, fmt.Errorf("failed to scan shape rotation session/result: %w", err)
		}
		s.Settings = settingsJSON
		json.Unmarshal([]byte(solutionJSON), &r.UserSolution)

		if _, ok := sessionMap[s.ID]; !ok {
			sessionMap[s.ID] = &types.ShapeRotationSessionWithResults{
				GameSession: s,
				Results:     []types.ShapeRotationResult{},
			}
			sessionOrder = append(sessionOrder, s.ID)
		}
		sessionMap[s.ID].Results = append(sessionMap[s.ID].Results, r)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("error after scanning shape rotation rows: %w", err)
	}

	sessions := make([]types.ShapeRotationSessionWithResults, len(sessionOrder))
	for i, id := range sessionOrder {
		sessions[i] = *sessionMap[id]
	}

	return &types.PaginatedShapeRotationSessions{
		Sessions:   sessions,
		TotalCount: totalCount,
	}, nil
}

// GetShapeRotationSessionStats calculates and returns aggregated statistics for a given Shape Rotation game session.
func GetShapeRotationSessionStats(db *sql.DB, sessionID int64) (*types.ShapeRotationSessionStats, error) {
	// First, get the game session to retrieve settings, especially the round number
	var gameSession types.GameSession
	var settingsJSON string
	err := db.QueryRow("SELECT id, game_code, play_datetime, settings FROM game_sessions WHERE id = ?", sessionID).Scan(
		&gameSession.ID, &gameSession.GameCode, &gameSession.PlayDatetime, &settingsJSON,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get game session %d: %w", sessionID, err)
	}
	gameSession.Settings = settingsJSON

	var srSettings types.ShapeRotationSettings
	if err := json.Unmarshal([]byte(settingsJSON), &srSettings); err != nil {
		return nil, fmt.Errorf("failed to unmarshal shape rotation settings for session %d: %w", sessionID, err)
	}

	results, err := GetShapeRotationResultsForSession(db, sessionID)
	if err != nil {
		return nil, fmt.Errorf("failed to get shape rotation results for session %d: %w", sessionID, err)
	}

	if len(results) == 0 {
		return nil, fmt.Errorf("no shape rotation results found for session %d", sessionID)
	}

	stats := &types.ShapeRotationSessionStats{
		SessionID: sessionID,
	}

	var totalSolveTime int
	var totalClickCount int

	// Since Shape Rotation game has only one round per session (as per settings),
	// we can aggregate all results into a single round stat.
	roundStats := types.ShapeRotationRoundStats{
		Round: srSettings.Round,
	}

	for _, r := range results {
		stats.TotalQuestions++
		totalSolveTime += r.SolveTime
		totalClickCount += r.ClickCount
		if r.IsCorrect {
			stats.TotalCorrect++
		}

		roundStats.TotalQuestions++
		roundStats.AverageSolveTimeMs += float64(r.SolveTime)
		roundStats.AverageClickCount += float64(r.ClickCount)
		if r.IsCorrect {
			roundStats.TotalCorrect++
		}
	}

	// Calculate overall averages and accuracies
	if stats.TotalQuestions > 0 {
		stats.OverallAccuracy = float64(stats.TotalCorrect) / float64(stats.TotalQuestions) * 100
		stats.AverageSolveTimeMs = float64(totalSolveTime) / float64(stats.TotalQuestions)
		stats.AverageClickCount = float64(totalClickCount) / float64(stats.TotalQuestions)
	}

	// Finalize per-round stats
	if roundStats.TotalQuestions > 0 {
		roundStats.Accuracy = float64(roundStats.TotalCorrect) / float64(roundStats.TotalQuestions) * 100
		roundStats.AverageSolveTimeMs /= float64(roundStats.TotalQuestions)
		roundStats.AverageClickCount /= float64(roundStats.TotalQuestions)
	}
	stats.RoundStats = append(stats.RoundStats, roundStats)

	return stats, nil
}

