package count_comparison

import (
	"database/sql"
	"encoding/json"
	"fmt"

	"acca-games/database"
	"acca-games/types"
)

// Service for the Count Comparison game.
type Service struct {
	db          *sql.DB
	currentGame *Game
}

// NewService creates a new Count Comparison game service.
func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

// StartGame initializes a new Count Comparison game session.
func (s *Service) StartGame(settings types.CountComparisonSettings) (int64, error) {
	game, err := NewGame(settings)
	if err != nil {
		return 0, fmt.Errorf("failed to start count comparison game: %w", err)
	}

	sessionID, err := database.CreateGameSession(s.db, types.GameCodeCountComparison, settings)
	if err != nil {
		return 0, fmt.Errorf("failed to create game session for count comparison: %w", err)
	}
	game.SessionID = sessionID
	s.currentGame = game

	return sessionID, nil
}

// NextProblem returns the next problem in the game.
func (s *Service) NextProblem() *types.CountComparisonProblem {
	if s.currentGame == nil {
		return nil
	}
	problem := s.currentGame.NextProblem()
	if problem == nil {
		// Game is over
		s.currentGame.EndGame()
		s.currentGame = nil
	}
	return problem
}

// SubmitAnswer handles the player's submission and saves the result.
func (s *Service) SubmitAnswer(submission types.CountComparisonSubmission) error {
	if s.currentGame == nil {
		return fmt.Errorf("game not started")
	}

	if submission.ProblemNumber <= 0 || submission.ProblemNumber > len(s.currentGame.Problems) {
		return fmt.Errorf("invalid problem number in submission: %d", submission.ProblemNumber)
	}

	problem := s.currentGame.Problems[submission.ProblemNumber-1]
	isCorrect := submission.PlayerChoice == problem.CorrectSide

	appliedTrapsJSON, err := json.Marshal(problem.AppliedTraps)
	if err != nil {
		return fmt.Errorf("failed to marshal applied traps: %w", err)
	}

	leftWordCount := countWords(problem.LeftWords)
	rightWordCount := countWords(problem.RightWords)

	result := types.CountComparisonResult{
		SessionID:      s.currentGame.SessionID,
		ProblemNumber:  submission.ProblemNumber,
		IsCorrect:      isCorrect,
		ResponseTimeMs: submission.ResponseTimeMs,
		PlayerChoice:   submission.PlayerChoice,
		CorrectChoice:  problem.CorrectSide,
		LeftWord:       problem.LeftWordText,
		RightWord:      problem.RightWordText,
		LeftWordCount:  leftWordCount,
		RightWordCount: rightWordCount,
		AppliedTraps:   string(appliedTrapsJSON),
	}

	if err := database.SaveCountComparisonResult(s.db, result); err != nil {
		return fmt.Errorf("failed to save count comparison result: %w", err)
	}

	return nil
}

func countWords(details []types.WordDetail) int {
	count := 0
	for _, detail := range details {
		if !detail.IsGap {
			count++
		}
	}
	return count
}
