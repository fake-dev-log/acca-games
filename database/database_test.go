package database

import (
	"reflect"
	"sort"
	"testing"
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
		"number_press_results",
		"rps_results",
		"nback_results",
		"shape_rotation_results",
	}

	// Sort for consistent comparison
	sort.Strings(actualTables)
	sort.Strings(expectedTables)

	if !reflect.DeepEqual(actualTables, expectedTables) {
		t.Errorf("Expected tables %v, but got %v", expectedTables, actualTables)
	}
}
