package database

import (
	"database/sql"
	"encoding/json"
	"os"
	"testing"

	"acca-games/types"

	"github.com/stretchr/testify/assert"
)

func setupTestDB(t *testing.T) (*sql.DB, func()) {
	// Create a temporary file for the SQLite database
	tmpfile, err := os.CreateTemp("", "test_db_*.db")
	assert.NoError(t, err)
	tmpfile.Close()

	dbPath := tmpfile.Name()
	db, err := NewDatabase(dbPath)
	assert.NoError(t, err)

	// Return a cleanup function
	return db, func() {
		db.Close()
		os.Remove(dbPath)
	}
}

func TestSaveCountComparisonResult(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	// Create a game session first
	settings := types.CountComparisonSettings{
		NumProblems:      1,
		PresentationTime: 1000,
		InputTime:        3000,
		IsRealMode:       false,
	}
	sessionID, err := CreateGameSession(db, types.GameCodeCountComparison, settings)
	assert.NoError(t, err)
	assert.NotZero(t, sessionID)

	appliedTraps := []types.AppliedTrap{
		{Type: "FontSize", AppliedTo: "left"},
		{Type: "Density", AppliedTo: "right"},
	}
	appliedTrapsJSON, _ := json.Marshal(appliedTraps)

	result := types.CountComparisonResult{
		SessionID:      sessionID,
		ProblemNumber:  1,
		IsCorrect:      true,
		ResponseTimeMs: 1500,
		PlayerChoice:   "left",
		CorrectChoice:  "left",
		LeftWord:       "cat",
		RightWord:      "dog",
		LeftWordCount:  10,
		RightWordCount: 15,
		AppliedTraps:   string(appliedTrapsJSON),
	}

	err = SaveCountComparisonResult(db, result)
	assert.NoError(t, err)

	// Verify the saved result
	rows, err := db.Query("SELECT COUNT(*) FROM count_comparison_results WHERE session_id = ?", sessionID)
	assert.NoError(t, err)
	defer rows.Close()

	var count int
	rows.Next()
	rows.Scan(&count)
	assert.Equal(t, 1, count)
}

func TestGetCountComparisonResultsForSession(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	settings := types.CountComparisonSettings{
		NumProblems:      2,
		PresentationTime: 1000,
		InputTime:        3000,
		IsRealMode:       false,
	}
	sessionID, err := CreateGameSession(db, types.GameCodeCountComparison, settings)
	assert.NoError(t, err)

	appliedTraps1 := []types.AppliedTrap{{Type: "FontSize", AppliedTo: "left"}}
	appliedTraps1JSON, _ := json.Marshal(appliedTraps1)
	result1 := types.CountComparisonResult{SessionID: sessionID, ProblemNumber: 1, IsCorrect: true, ResponseTimeMs: 1000, PlayerChoice: "left", CorrectChoice: "left", LeftWord: "a", RightWord: "b", LeftWordCount: 10, RightWordCount: 12, AppliedTraps: string(appliedTraps1JSON)}
	SaveCountComparisonResult(db, result1)

	appliedTraps2 := []types.AppliedTrap{{Type: "FontWeight", AppliedTo: "right"}}
	appliedTraps2JSON, _ := json.Marshal(appliedTraps2)
	result2 := types.CountComparisonResult{SessionID: sessionID, ProblemNumber: 2, IsCorrect: false, ResponseTimeMs: 2000, PlayerChoice: "right", CorrectChoice: "left", LeftWord: "c", RightWord: "d", LeftWordCount: 20, RightWordCount: 18, AppliedTraps: string(appliedTraps2JSON)}
	SaveCountComparisonResult(db, result2)

	results, err := GetCountComparisonResultsForSession(db, sessionID)
	assert.NoError(t, err)
	assert.Len(t, results, 2)
	assert.Equal(t, result1.ProblemNumber, results[0].ProblemNumber)
	assert.Equal(t, result2.ProblemNumber, results[1].ProblemNumber)
	assert.Equal(t, result1.LeftWord, results[0].LeftWord)
	assert.Equal(t, result2.RightWord, results[1].RightWord)
	assert.Equal(t, result1.AppliedTraps, results[0].AppliedTraps)
}

func TestGetPaginatedCountComparisonSessionsWithResults(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	// Create multiple sessions and results
	for i := 0; i < 3; i++ {
		settings := types.CountComparisonSettings{NumProblems: 1, PresentationTime: 1000, InputTime: 3000, IsRealMode: false}
		sessionID, err := CreateGameSession(db, types.GameCodeCountComparison, settings)
		assert.NoError(t, err)
		appliedTrapsJSON, _ := json.Marshal([]types.AppliedTrap{})
		result := types.CountComparisonResult{SessionID: sessionID, ProblemNumber: 1, IsCorrect: true, ResponseTimeMs: 1000, PlayerChoice: "left", CorrectChoice: "left", LeftWord: "a", RightWord: "b", LeftWordCount: 10, RightWordCount: 12, AppliedTraps: string(appliedTrapsJSON)}
		SaveCountComparisonResult(db, result)
	}

	paginatedSessions, err := GetPaginatedCountComparisonSessionsWithResults(db, 1, 2)
	assert.NoError(t, err)
	assert.Len(t, paginatedSessions.Sessions, 2)
	assert.Equal(t, 3, paginatedSessions.TotalCount)
	assert.Len(t, paginatedSessions.Sessions[0].Results, 1)

	paginatedSessions, err = GetPaginatedCountComparisonSessionsWithResults(db, 2, 2)
	assert.NoError(t, err)
	assert.Len(t, paginatedSessions.Sessions, 1)
	assert.Equal(t, 3, paginatedSessions.TotalCount)
}

func TestGetCountComparisonSessionStats(t *testing.T) {
	db, cleanup := setupTestDB(t)
	defer cleanup()

	settings := types.CountComparisonSettings{
		NumProblems:      4, // Updated
		PresentationTime: 1000,
		InputTime:        3000,
		IsRealMode:       false,
	}
	sessionID, err := CreateGameSession(db, types.GameCodeCountComparison, settings)
	assert.NoError(t, err)

	// Result 1: FontSize trap, correct
	appliedTraps1 := []types.AppliedTrap{{Type: "FontSize", AppliedTo: "left"}}
	appliedTraps1JSON, _ := json.Marshal(appliedTraps1)
	SaveCountComparisonResult(db, types.CountComparisonResult{SessionID: sessionID, ProblemNumber: 1, IsCorrect: true, ResponseTimeMs: 100, AppliedTraps: string(appliedTraps1JSON)})

	// Result 2: FontWeight trap, incorrect
	appliedTraps2 := []types.AppliedTrap{{Type: "FontWeight", AppliedTo: "right"}}
	appliedTraps2JSON, _ := json.Marshal(appliedTraps2)
	SaveCountComparisonResult(db, types.CountComparisonResult{SessionID: sessionID, ProblemNumber: 2, IsCorrect: false, ResponseTimeMs: 200, AppliedTraps: string(appliedTraps2JSON)})

	// Result 3: Multiple traps, correct
	appliedTraps3 := []types.AppliedTrap{{Type: "Density", AppliedTo: "left"}, {Type: "FontSize", AppliedTo: "left"}}
	appliedTraps3JSON, _ := json.Marshal(appliedTraps3)
	SaveCountComparisonResult(db, types.CountComparisonResult{SessionID: sessionID, ProblemNumber: 3, IsCorrect: true, ResponseTimeMs: 300, AppliedTraps: string(appliedTraps3JSON)})
	
	// Result 4: No traps, correct
	appliedTraps4JSON, _ := json.Marshal([]types.AppliedTrap{})
	SaveCountComparisonResult(db, types.CountComparisonResult{SessionID: sessionID, ProblemNumber: 4, IsCorrect: true, ResponseTimeMs: 150, AppliedTraps: string(appliedTraps4JSON)})


	stats, err := GetCountComparisonSessionStats(db, sessionID)
	assert.NoError(t, err)
	assert.NotNil(t, stats)

	assert.Equal(t, int64(sessionID), stats.SessionID)
	assert.Equal(t, 4, stats.TotalQuestions) // Updated
	assert.Equal(t, 3, stats.TotalCorrect)   // Updated
	assert.InEpsilon(t, (3.0/4.0)*100, stats.OverallAccuracy, 0.01) // Updated
	assert.InEpsilon(t, (100+200+300+150)/4.0, stats.AverageResponseTimeMs, 0.01) // Updated

	// Verify trap stats
	assert.Len(t, stats.TrapStats, 4) // FontSize_left, FontWeight_right, Density_left, No Trap
	
	// Example check for FontSize_left
	var fontSizeTrapStat *types.TrapStat
	for i := range stats.TrapStats {
		if stats.TrapStats[i].TrapType == "FontSize_left" {
			fontSizeTrapStat = &stats.TrapStats[i]
			break
		}
	}
	assert.NotNil(t, fontSizeTrapStat)
	assert.Equal(t, 2, fontSizeTrapStat.TotalQuestions) // Problem 1 & 3
	assert.Equal(t, 2, fontSizeTrapStat.TotalCorrect)
	assert.InEpsilon(t, 100.0, fontSizeTrapStat.Accuracy, 0.01)
	assert.InEpsilon(t, (100.0+300.0)/2.0, fontSizeTrapStat.AverageResponseTime, 0.01)

	// Check for No Trap
	var noTrapStat *types.TrapStat
	for i := range stats.TrapStats {
		if stats.TrapStats[i].TrapType == "No Trap" {
			noTrapStat = &stats.TrapStats[i]
			break
		}
	}
	assert.NotNil(t, noTrapStat)
	assert.Equal(t, 1, noTrapStat.TotalQuestions)
	assert.Equal(t, 1, noTrapStat.TotalCorrect)
	assert.InEpsilon(t, 100.0, noTrapStat.Accuracy, 0.01)
	assert.InEpsilon(t, 150.0, noTrapStat.AverageResponseTime, 0.01)
}
