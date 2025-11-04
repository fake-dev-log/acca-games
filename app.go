package main

import (
	"acca-games/database"
	"acca-games/games/nback"
	"acca-games/games/number_pressing"
	"acca-games/games/rps"
	"acca-games/types"
	"context"
	"database/sql"
	"log"
)

// App struct
type App struct {
	ctx                   context.Context
	db                    *sql.DB
	nbackService          *nback.Service
	rpsService            *rps.Service
	numberPressingService *number_pressing.Service
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
	a.rpsService = rps.NewService(a.db)
	a.numberPressingService = number_pressing.NewService(a.db)
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
	return a.nbackService.StartGame(settings)
}

// SubmitNBackAnswer checks the user's answer for a given trial, saves it to the DB, and returns the result.
func (a *App) SubmitNBackAnswer(playerChoice string, responseTimeMs int, trialNum int) (*types.NBackResult, error) {
	return a.nbackService.SubmitAnswer(playerChoice, responseTimeMs, trialNum)
}

// StartRpsGame starts a new Rock-Paper-Scissors game with the given settings.
func (a *App) StartRpsGame(settings types.RpsSettings) (*rps.GameState, error) {
	return a.rpsService.StartGame(settings)
}

// SubmitRpsAnswer checks the user's answer for a given trial, saves it to the DB, and returns the result.
func (a *App) SubmitRpsAnswer(playerChoice string, responseTimeMs int, questionNum int) (*types.RpsResult, error) {
	return a.rpsService.SubmitAnswer(playerChoice, responseTimeMs, questionNum)
}

// GetRpsGameSessions fetches all Rock-Paper-Scissors game sessions.
func (a *App) GetRpsGameSessions() ([]types.GameSession, error) {
	return database.GetGameSessionsByCode(a.db, "RPS")
}

// GetRpsResultsForSession fetches all results for a given RPS session ID.
func (a *App) GetRpsResultsForSession(sessionID int64) ([]types.RpsResult, error) {
	return database.GetRpsResultsForSession(a.db, sessionID)
}

// GetAllRpsResults fetches all results across all RPS sessions.
func (a *App) GetAllRpsResults() ([]types.RpsResult, error) {
	return database.GetAllRpsResults(a.db)
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

// StartNumberPressingGame starts a new Number Pressing game.
func (a *App) StartNumberPressingGame(setup types.NumberPressingSetup) (*types.NumberPressingGameState, error) {
	return a.numberPressingService.StartGame(setup)
}

// SubmitNumberPressingResultR1 saves a result for Round 1.
func (a *App) SubmitNumberPressingResultR1(result types.NumberPressingResultR1) error {
	return a.numberPressingService.SubmitResultR1(result)
}

// SubmitNumberPressingResultR2 saves a result for Round 2.
func (a *App) SubmitNumberPressingResultR2(result types.NumberPressingResultR2) error {
	return a.numberPressingService.SubmitResultR2(result)
}

// CalculateCorrectClicksR2 calculates the correct click sequence for a Round 2 problem.
func (a *App) CalculateCorrectClicksR2(problem types.NumberPressingProblemR2) []int {
	return number_pressing.CalculateCorrectClicksR2(problem)
}

// GetNumberPressingGameSessions fetches all Number Pressing game sessions.
func (a *App) GetNumberPressingGameSessions() ([]types.GameSession, error) {
	return database.GetNumberPressingGameSessions(a.db)
}

// GetNumberPressingResultsForSession fetches all results for a given Number Pressing session ID.
func (a *App) GetNumberPressingResultsForSession(sessionID int64) (*types.NumberPressingResultsBundle, error) {
	return database.GetNumberPressingResultsForSession(a.db, sessionID)
}

// GetAllNumberPressingResults fetches all results across all Number Pressing sessions.
func (a *App) GetAllNumberPressingResults() (*types.NumberPressingResultsBundle, error) {
	return database.GetAllNumberPressingResults(a.db)
}