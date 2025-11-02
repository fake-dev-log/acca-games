package main

import (
	"acca-games/database"
	"acca-games/games/nback"
	"acca-games/types"
	"context"
	"database/sql"
	"log"
)

// App struct
type App struct {
	ctx          context.Context
	db           *sql.DB
	nbackService *nback.Service
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	db, err := database.InitializeDatabase()
	if err != nil {
		log.Fatalf("failed to initialize database: %v", err)
	}
	a.db = db
	a.nbackService = nback.NewService(a.db)
}

func (a *App) shutdown(ctx context.Context) {
	if a.db != nil {
		a.db.Close()
	}
}

// GetShapeGroups returns the available shape groups.
func (a *App) GetShapeGroups() map[string][]string {
	return nback.GetShapeGroups()
}

// StartNBackGame starts a new N-Back game with the given settings.
func (a *App) StartNBackGame(settings types.NBackSettings) (*nback.NBackGameState, error) {
	gameState, err := a.nbackService.StartGame(settings)
	if err != nil {
		log.Printf("Error starting N-Back game: %v", err)
		return nil, err
	}
	log.Printf("Started N-Back game with session ID: %d", gameState.SessionID)
	return gameState, nil
}

// SubmitNBackAnswer checks the user's answer for a given trial, saves it to the DB, and returns the result.
func (a *App) SubmitNBackAnswer(playerChoice string, responseTimeMs int, trialNum int) (*types.NBackResult, error) {
	result, err := a.nbackService.SubmitAnswer(playerChoice, responseTimeMs, trialNum)
	if err != nil {
		log.Printf("Error submitting N-Back answer: %v", err)
		return nil, err
	}
	log.Printf("Saved N-Back result for trial: %d", result.QuestionNum)
	return result, nil
}

// GetNBackGameSessions fetches all N-Back game sessions.
func (a *App) GetNBackGameSessions() ([]types.GameSession, error) {
	sessions, err := database.GetNBackGameSessions(a.db)
	if err != nil {
		log.Printf("Error getting N-Back game sessions: %v", err)
		return nil, err
	}
	return sessions, nil
}

// GetNBackResultsForSession fetches all N-Back results for a given session ID.
func (a *App) GetNBackResultsForSession(sessionID int64) ([]types.NBackRecord, error) {
	records, err := database.GetNBackResultsForSession(a.db, sessionID)
	if err != nil {
		log.Printf("Error getting N-Back results for session %d: %v", sessionID, err)
		return nil, err
	}
	return records, nil
}

// GetAllNBackResults fetches all N-Back results across all sessions.
func (a *App) GetAllNBackResults() ([]types.NBackRecord, error) {
	records, err := database.GetAllNBackResults(a.db)
	if err != nil {
		log.Printf("Error getting all N-Back results: %v", err)
		return nil, err
	}
	return records, nil
}
