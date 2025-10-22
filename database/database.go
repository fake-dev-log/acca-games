package database

import (
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
