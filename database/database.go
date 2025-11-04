package database

import (
	"acca-games/types"
	"database/sql"
	_ "embed"
	_ "github.com/mattn/go-sqlite3"
)

//go:embed schema.sql
var schemaSQL string

// NewDatabase opens a database connection at the given path and initializes the schema.
func NewDatabase(path string) (*sql.DB, error) {
	// Open the database file. It will be created if it doesn't exist.
	db, err := sql.Open("sqlite3", path)
	if err != nil {
		return nil, err
	}

	// Execute the schema script to create tables
	_, err = db.Exec(schemaSQL)
	if err != nil {
		return nil, err
	}

	return db, nil
}

// InitializeDatabase creates and initializes the production database.
func InitializeDatabase() (*sql.DB, error) {
	return NewDatabase("./acca_games.db")
}

// GetGameSessionsByCode fetches all game sessions for a specific game code.
func GetGameSessionsByCode(db *sql.DB, gameCode string) ([]types.GameSession, error) {
	rows, err := db.Query("SELECT id, game_code, play_datetime, settings FROM game_sessions WHERE game_code = ? ORDER BY play_datetime DESC", gameCode)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []types.GameSession
	for rows.Next() {
		var s types.GameSession
		if err := rows.Scan(&s.ID, &s.GameCode, &s.PlayDatetime, &s.Settings); err != nil {
			return nil, err
		}
		sessions = append(sessions, s)
	}

	return sessions, nil
}
