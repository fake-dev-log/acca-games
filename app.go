package main

import (
	"acca-games/database"
	"acca-games/games/cat_chaser"
	"acca-games/games/count_comparison"
	"acca-games/games/nback"
	"acca-games/games/number_pressing"
	"acca-games/games/rps"
	"acca-games/games/shape_rotation"
	"acca-games/types"
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"os"
	"path/filepath"
	"runtime"
	"time"
)

// getApplicationSupportDirectory returns the appropriate application support/data directory
// for the current operating system.
func getApplicationSupportDirectory(appName string) (string, error) {
	var dir string
	var err error

	switch runtime.GOOS {
	case "windows":
		dir, err = os.UserConfigDir()
		if err != nil {
			return "", fmt.Errorf("failed to get user config directory: %w", err)
		}
		dir = filepath.Join(dir, appName)
	case "darwin": // macOS
		homeDir, err := os.UserHomeDir()
		if err != nil {
			return "", fmt.Errorf("failed to get user home directory: %w", err)
		}
		dir = filepath.Join(homeDir, "Library", "Application Support", appName)
	case "linux":
		dir, err = os.UserCacheDir()
		if err != nil {
			return "", fmt.Errorf("failed to get user cache directory: %w", err)
		}
		dir = filepath.Join(dir, appName)
	default:
		return "", fmt.Errorf("unsupported operating system: %s", runtime.GOOS)
	}

	return dir, nil
}

// GetSessionResults fetches results for a given session and game, returning them as a JSON string.
func (a *App) GetSessionResults(gameCode string, sessionID int64) (string, error) {
	var data interface{}
	var err error

	switch gameCode {
	case types.GameCodeShapeRotation:
		data, err = database.GetShapeRotationResultsForSession(a.db, sessionID)
	case types.GameCodeRPS:
		data, err = database.GetRpsResultsForSession(a.db, sessionID)
	case types.GameCodeNBack:
		data, err = database.GetNBackResultsForSession(a.db, sessionID)
	case types.GameCodeNumberPressing:
		data, err = database.GetNumberPressingResultsForSession(a.db, sessionID)
	case types.GameCodeCountComparison:
		data, err = database.GetCountComparisonResultsForSession(a.db, sessionID)
	case types.GameCodeCatChaser:
		data, err = database.GetCatChaserResultsBySessionID(a.db, sessionID)
	default:
		return "", fmt.Errorf("unknown game code: %s", gameCode)
	}

	if err != nil {
		return "", err
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		return "", err
	}

	return string(jsonData), nil
}

// App struct
type App struct {
	ctx                      context.Context
	db                       *sql.DB
	nbackService             *nback.Service
	rpsService               *rps.Service
	numberPressingService    *number_pressing.Service
	countComparisonService *count_comparison.Service
	catChaserService       *cat_chaser.Service
}

func init() {
	rand.Seed(time.Now().UnixNano())
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	rand.Seed(time.Now().UnixNano())
	a.ctx = ctx

	// --- Database Initialization ---
	supportDir, err := getApplicationSupportDirectory("acca-games")
	if err != nil {
		log.Fatalf("failed to get application support directory: %v", err)
	}

	dbPath := filepath.Join(supportDir, "acca_games.db")
	log.Printf("Database path: %s", dbPath)

	// Ensure the directory exists
	if err := os.MkdirAll(filepath.Dir(dbPath), 0755); err != nil {
		log.Fatalf("failed to create database directory: %v", err)
	}

	db, err := database.NewDatabase(dbPath)
	if err != nil {
		log.Fatalf("failed to initialize database: %v", err)
	}
	// --- End Database Initialization ---

	a.db = db
	a.nbackService = nback.NewService(a.db)
	a.rpsService = rps.NewService(a.db)
	a.numberPressingService = number_pressing.NewService(a.db)
	a.countComparisonService = count_comparison.NewService(a.db)
	a.catChaserService = cat_chaser.NewService(a.db)
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
func (a *App) SubmitNBackAnswer(playerChoice string, responseTimeMs int, questionNum int) (*types.NBackResult, error) {
	return a.nbackService.SubmitAnswer(playerChoice, responseTimeMs, questionNum)
}

// StartRpsGame starts a new Rock-Paper-Scissors game with the given settings.
func (a *App) StartRpsGame(settings types.RpsSettings) (*rps.GameState, error) {
	return a.rpsService.StartGame(settings)
}

// SubmitRpsAnswer checks the user's answer for a given trial, saves it to the DB, and returns the result.
func (a *App) SubmitRpsAnswer(playerChoice string, responseTimeMs int, questionNum int) (*types.RpsResult, error) {
	return a.rpsService.SubmitAnswer(playerChoice, responseTimeMs, questionNum)
}

// StartCountComparisonGame starts a new Count Comparison game.
func (a *App) StartCountComparisonGame(settings types.CountComparisonSettings) (int64, error) {
	return a.countComparisonService.StartGame(settings)
}

// GetNextCountComparisonProblem returns the next problem for the current game.
func (a *App) GetNextCountComparisonProblem() *types.CountComparisonProblem {
	return a.countComparisonService.NextProblem()
}

// SubmitCountComparisonAnswer handles the player's submission and saves the result.
func (a *App) SubmitCountComparisonAnswer(submission types.CountComparisonSubmission) error {
	return a.countComparisonService.SubmitAnswer(submission)
}
var validGameCodes = map[string]bool{
	types.GameCodeShapeRotation:     true,
	types.GameCodeRPS:               true,
	types.GameCodeNBack:             true,
	types.GameCodeNumberPressing:    true,
	types.GameCodeCountComparison: true,
	types.GameCodeCatChaser:       true,
}

// GetPaginatedNBackSessionsWithResults fetches paginated N-Back sessions with their results.
func (a *App) GetPaginatedNBackSessionsWithResults(page int, limit int) (*types.PaginatedNBackSessions, error) {
	return database.GetPaginatedNBackSessionsWithResults(a.db, page, limit)
}

// GetNBackSessionStats fetches aggregated statistics for a given N-Back session ID.
func (a *App) GetNBackSessionStats(sessionID int64) (*types.NBackSessionStats, error) {
	return database.GetNBackSessionStats(a.db, sessionID)
}

// GetPaginatedRpsSessionsWithResults fetches paginated RPS sessions with their results.
func (a *App) GetPaginatedRpsSessionsWithResults(page int, limit int) (*types.PaginatedRpsSessions, error) {
	return database.GetPaginatedRpsSessionsWithResults(a.db, page, limit)
}

// GetRpsSessionStats fetches aggregated statistics for a given RPS session ID.
func (a *App) GetRpsSessionStats(sessionID int64) (*types.RpsSessionStats, error) {
	return database.GetRpsSessionStats(a.db, sessionID)
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

// GetPaginatedNumberPressingSessionsWithResults fetches paginated Number Pressing sessions with their results.
func (a *App) GetPaginatedNumberPressingSessionsWithResults(page int, limit int) (*types.PaginatedNumberPressingSessions, error) {
	return database.GetPaginatedNumberPressingSessionsWithResults(a.db, page, limit)
}

// GetNumberPressingSessionStats fetches aggregated statistics for a given Number Pressing session ID.
func (a *App) GetNumberPressingSessionStats(sessionID int64) (*types.NumberPressingSessionStats, error) {
	return database.GetNumberPressingSessionStats(a.db, sessionID)
}

// GetShapeRotationProblems returns a list of problems for the Shape Rotation game.
func (a *App) GetShapeRotationProblems(round int, numProblems int) ([]shape_rotation.ShapeRotationProblemWithFinalShape, error) {
	return shape_rotation.GetProblems(round, numProblems)
}

// SaveShapeRotationSession saves a new Shape Rotation game session.
func (a *App) SaveShapeRotationSession(settings types.ShapeRotationSettings) (int64, error) {
	return database.SaveShapeRotationSession(a.db, settings)
}

// SubmitShapeRotationAnswerAsync verifies and saves a result in the background.
func (a *App) SubmitShapeRotationAnswerAsync(sessionID int64, problem shape_rotation.ShapeRotationProblemWithFinalShape, userSolution []string, solveTime int, clickCount int) error {
	go func() {
		isCorrect := shape_rotation.VerifySolution(problem, userSolution)

		result := types.ShapeRotationResult{
			SessionID:    sessionID,
			ProblemID:    problem.ID,
			UserSolution: userSolution,
			IsCorrect:    isCorrect,
			SolveTime:    solveTime,
			ClickCount:   clickCount,
		}

		err := database.SaveShapeRotationResult(a.db, result)
		if err != nil {
			log.Printf("Error saving shape rotation result: %v", err)
		}
	}()
	return nil
}

// GetPaginatedShapeRotationSessionsWithResults fetches paginated Shape Rotation sessions with their results.
func (a *App) GetPaginatedShapeRotationSessionsWithResults(page int, limit int) (*types.PaginatedShapeRotationSessions, error) {
	return database.GetPaginatedShapeRotationSessionsWithResults(a.db, page, limit)
}

// GetShapeRotationSessionStats fetches aggregated statistics for a given Shape Rotation session ID.
func (a *App) GetShapeRotationSessionStats(sessionID int64) (*types.ShapeRotationSessionStats, error) {
	return database.GetShapeRotationSessionStats(a.db, sessionID)
}

// StartCatChaserGame starts a new Cat Chaser game.
func (a *App) StartCatChaserGame(settings types.CatChaserSettings) (*cat_chaser.CatChaserGameState, error) {
	return a.catChaserService.StartGame(settings)
}

// SubmitCatChaserAnswer submits an answer for the Cat Chaser game.
func (a *App) SubmitCatChaserAnswer(round int, targetColor string, playerChoice string, confidence int, responseTimeMs int) (*types.CatChaserResult, error) {
	return a.catChaserService.SubmitAnswer(round, targetColor, playerChoice, confidence, responseTimeMs)
}

// GetPaginatedCountComparisonSessionsWithResults fetches paginated Count Comparison sessions with their results.
func (a *App) GetPaginatedCountComparisonSessionsWithResults(page int, limit int) (*types.PaginatedCountComparisonSessions, error) {
	return database.GetPaginatedCountComparisonSessionsWithResults(a.db, page, limit)
}

// GetCountComparisonSessionStats fetches aggregated statistics for a given Count Comparison session ID.
func (a *App) GetCountComparisonSessionStats(sessionID int64) (*types.CountComparisonSessionStats, error) {
	return database.GetCountComparisonSessionStats(a.db, sessionID)
}

// GetPaginatedCatChaserSessionsWithResults fetches paginated Cat Chaser sessions with their results.
func (a *App) GetPaginatedCatChaserSessionsWithResults(page int, limit int) (*types.PaginatedCatChaserSessions, error) {
	return database.GetPaginatedCatChaserSessionsWithResults(a.db, page, limit)
}

// GetCatChaserSessionStats fetches aggregated statistics for a given Cat Chaser session ID.
func (a *App) GetCatChaserSessionStats(sessionID int64) (*types.CatChaserSessionStats, error) {
	return database.GetCatChaserSessionStats(a.db, sessionID)
}
