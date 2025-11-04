package database

import (
	"database/sql"
	"encoding/json"
	"acca-games/types"
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

func GetNumberPressingGameSessions(db *sql.DB) ([]types.GameSession, error) {
	return GetGameSessionsByCode(db, "NUMBER_PRESSING")
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

func GetAllNumberPressingResults(db *sql.DB) (*types.NumberPressingResultsBundle, error) {
	rowsR1, err := db.Query("SELECT session_id, target_number, time_taken, is_correct FROM number_pressing_results_r1")
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

	rowsR2, err := db.Query("SELECT session_id, double_click_numbers, skip_numbers, player_clicks, correct_clicks, time_taken, is_correct FROM number_pressing_results_r2")
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