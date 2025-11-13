package database

import (
	"encoding/json"
	"reflect"
	"sort"
	"testing"

	"acca-games/types"
)

func TestDatabaseInitialization(t *testing.T) {
	// Use ":memory:" for an in-memory database that is discarded when the connection is closed.
	db, err := NewDatabase(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize in-memory database: %v", err)
	}
	defer db.Close()

	// Query the sqlite_master table to check if our tables were created.
	rows, err := db.Query("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
	if err != nil {
		t.Fatalf("Failed to query sqlite_master: %v", err)
	}
	defer rows.Close()

	var actualTables []string
	for rows.Next() {
		var name string
		if err := rows.Scan(&name); err != nil {
			t.Fatalf("Failed to scan table name: %v", err)
		}
		// Exclude sqlite internal tables
		if name != "sqlite_sequence" {
			actualTables = append(actualTables, name)
		}
	}

	expectedTables := []string{
		"game_sessions",
		"nback_results",
		"number_pressing_results_r1",
		"number_pressing_results_r2",
		"rps_results",
		"shape_rotation_results",
	}

	// Sort for consistent comparison
	sort.Strings(actualTables)
	sort.Strings(expectedTables)

	if !reflect.DeepEqual(actualTables, expectedTables) {
		t.Errorf("Expected tables %v, but got %v", expectedTables, actualTables)
	}
}

func TestCreateGameSession(t *testing.T) {
	db, err := NewDatabase(":memory:")
	if err != nil {
		t.Fatalf("Failed to initialize in-memory database: %v", err)
	}
	defer db.Close()

	settings := types.RpsSettings{Rounds: []int{1}, QuestionsPerRound: 10, TimeLimitMs: 3000}
	gameCode := "RPS_TEST"

	sessionID, err := CreateGameSession(db, gameCode, settings)
	if err != nil {
		t.Fatalf("CreateGameSession failed: %v", err)
	}

	if sessionID == 0 {
		t.Errorf("Expected a non-zero session ID, but got 0")
	}

	// Verify the session was actually created with the correct data
	var (
		retrievedGameCode string
		retrievedSettings string
	)
	err = db.QueryRow("SELECT game_code, settings FROM game_sessions WHERE id = ?", sessionID).Scan(&retrievedGameCode, &retrievedSettings)
	if err != nil {
		t.Fatalf("Failed to query created session: %v", err)
	}

	if retrievedGameCode != gameCode {
		t.Errorf("Expected game code %s, but got %s", gameCode, retrievedGameCode)
	}

	var retrievedSettingsStruct types.RpsSettings
	err = json.Unmarshal([]byte(retrievedSettings), &retrievedSettingsStruct)
	if err != nil {
		t.Fatalf("Failed to unmarshal settings from DB: %v", err)
	}

	if !reflect.DeepEqual(settings, retrievedSettingsStruct) {
		t.Errorf("Expected settings %v, but got %v", settings, retrievedSettingsStruct)
	}
}
