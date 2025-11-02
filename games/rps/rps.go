package rps

import (
	"acca-games/database"
	"acca-games/types"
	"database/sql"
	"fmt"
	"math/rand"
	"time"
)

// Problem defines a single question in the RPS game.
type Problem struct {
	ProblemCardHolder string `json:"problemCardHolder"` // 'me' or 'opponent'
	GivenCard         string `json:"givenCard"`         // 'ROCK', 'PAPER', 'SCISSORS'
	Round             int    `json:"round"`
}

// GameState represents the current state of the RPS game.
type GameState struct {
	Settings   types.RpsSettings `json:"settings"`
	Problems   []Problem         `json:"problems"`
	SessionID  int64             `json:"sessionId"`
	GameCode   string            `json:"gameCode"`
}

// Service handles the business logic for the RPS game.
type Service struct {
	db           *sql.DB
	currentState *GameState
}

// NewService creates a new RPS game service.
func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

var cardTypes = []string{"ROCK", "PAPER", "SCISSORS"}

// getWinningCard returns the card that wins against the given card.
func getWinningCard(card string) string {
	switch card {
	case "ROCK":
		return "PAPER"
	case "PAPER":
		return "SCISSORS"
	case "SCISSORS":
		return "ROCK"
	}
	return ""
}

// getLosingCard returns the card that loses against the given card.
func getLosingCard(card string) string {
	switch card {
	case "ROCK":
		return "SCISSORS"
	case "PAPER":
		return "ROCK"
	case "SCISSORS":
		return "PAPER"
	}
	return ""
}

// StartGame starts a new RPS game with the given settings.
func (s *Service) StartGame(settings types.RpsSettings) (*GameState, error) {
	sessionID, err := database.CreateGameSession(s.db, "RPS", settings)
	if err != nil {
		return nil, fmt.Errorf("failed to create rps session: %w", err)
	}

	rand.Seed(time.Now().UnixNano())
	problems := make([]Problem, 0)

	for _, round := range settings.Rounds {
		for i := 0; i < settings.QuestionsPerRound; i++ {
			problem := Problem{Round: round}
			problem.GivenCard = cardTypes[rand.Intn(len(cardTypes))]

			switch round {
			case 1:
				problem.ProblemCardHolder = "me"
			case 2:
				problem.ProblemCardHolder = "opponent"
			case 3:
				if rand.Intn(2) == 0 {
					problem.ProblemCardHolder = "me"
				} else {
					problem.ProblemCardHolder = "opponent"
				}
			}
			problems = append(problems, problem)
		}
	}

	s.currentState = &GameState{
		Settings:  settings,
		Problems:  problems,
		SessionID: sessionID,
		GameCode:  "RPS",
	}

	return s.currentState, nil
}

// SubmitAnswer checks the user's answer for a given trial, saves it to the DB, and returns the result.
func (s *Service) SubmitAnswer(playerChoice string, responseTimeMs int, questionNum int) (*types.RpsResult, error) {
	if s.currentState == nil || questionNum >= len(s.currentState.Problems) {
		return nil, fmt.Errorf("game not started or question number out of bounds")
	}

	problem := s.currentState.Problems[questionNum]
	var correctChoice string

	if problem.ProblemCardHolder == "me" {
		correctChoice = getWinningCard(problem.GivenCard)
	} else { // opponent has the ? card
		correctChoice = getLosingCard(problem.GivenCard)
	}

	isCorrect := playerChoice == correctChoice

	result := &types.RpsResult{
		SessionID:         s.currentState.SessionID,
		Round:             problem.Round,
		QuestionNum:       questionNum,
		ProblemCardHolder: problem.ProblemCardHolder,
		GivenCard:         problem.GivenCard,
		IsCorrect:         isCorrect,
		ResponseTimeMs:    responseTimeMs,
		PlayerChoice:      playerChoice,
		CorrectChoice:     correctChoice,
	}

	err := database.SaveRpsResult(s.db, *result)
	if err != nil {
		return nil, fmt.Errorf("failed to save rps result: %w", err)
	}

	return result, nil
}
