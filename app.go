package main

import (
	"acca-games/database"
	"acca-games/games"
	"acca-games/types"
	"context"
	"database/sql"
	"fmt"
	"log"
)

// App struct
type App struct {
	ctx    context.Context
	db     *sql.DB
	nback *games.NBackGameState
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
}

func (a *App) shutdown(ctx context.Context) {
	if a.db != nil {
		a.db.Close()
	}
}

// GetShapeGroups returns the available shape groups.
func (a *App) GetShapeGroups() map[string][]string {
	return games.ShapeGroups
}

// StartNBackGame starts a new n-back game with the given settings.
func (a *App) StartNBackGame(settings types.NBackSettings) (*games.NBackGameState, error) {
	dbSettings := types.NBackSettings{
		NumTrials:        settings.NumTrials,
		PresentationTime: settings.PresentationTime,
		NBackLevel:       settings.NBackLevel,
		ShapeGroup:       settings.ShapeGroup,
		IsRealMode:       settings.IsRealMode,
	}

	sessionID, err := database.CreateNBackSession(a.db, dbSettings)
	if err != nil {
		log.Printf("Error creating n-back session: %v", err)
		return nil, err
	}

	a.nback = games.NewNBackGame(settings)
	a.nback.SessionID = sessionID
	log.Printf("Started n-back game with session ID: %d", sessionID)
	return a.nback, nil
}

// SubmitNBackAnswer checks the user's answer for a given trial, saves it to the DB, and returns the result.
func (a *App) SubmitNBackAnswer(playerChoice string, responseTimeMs int, trialNum int) (*types.NBackResult, error) {
	if a.nback == nil || trialNum >= len(a.nback.ShapeSequence) {
		return nil, fmt.Errorf("game not started or already finished")
	}

	result := a.nback.CheckAnswer(playerChoice, responseTimeMs, trialNum)

	err := database.SaveNBackResult(a.db, *result)
	if err != nil {
		log.Printf("Error saving n-back result: %v", err)
		return nil, err
	}
    log.Printf("Saved n-back result for trial: %d", result.QuestionNum)
	return result, nil
}
