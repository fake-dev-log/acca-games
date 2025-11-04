package rps

import (
	"database/sql"
	"fmt"
	"math/rand"

	"acca-games/database"
	"acca-games/types"
)

// GameState holds the current state of the Rock-Paper-Scissors game.
type GameState struct {
	Settings   types.RpsSettings `json:"settings"`
	Problems   []Problem         `json:"problems"`
	ID         int64             `json:"id"`
	GameCode   string            `json:"gameCode"`
}

// Service holds the database connection and the current game state.
type Service struct {
	db           *sql.DB
	currentState *GameState
}

// NewService creates a new RPS service.
func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

// Problem defines a single question in the RPS game.
type Problem struct {
	Round             int    `json:"round"`
	QuestionNum       int    `json:"questionNum"`
	ProblemCardHolder string `json:"problemCardHolder"`
	GivenCard         string `json:"givenCard"`
	CorrectChoice     string `json:"correctChoice"`
}

// StartGame initializes a new game session and generates the problems.
func (s *Service) StartGame(settings types.RpsSettings) (*GameState, error) {
	var problems []Problem
	questionCounter := 1

	for _, round := range settings.Rounds {
		for i := 0; i < settings.QuestionsPerRound; i++ {
			problems = append(problems, generateProblem(round, questionCounter))
			questionCounter++
		}
	}

	sessionID, err := database.CreateGameSession(s.db, "RPS", settings)
	if err != nil {
		return nil, err
	}

	s.currentState = &GameState{
		Settings:   settings,
		Problems:   problems,
		ID:         sessionID,
		GameCode:   "RPS",
	}

	return s.currentState, nil
}

// SubmitAnswer checks the answer, saves it, and returns the result.
func (s *Service) SubmitAnswer(playerChoice string, responseTimeMs int, questionNum int) (*types.RpsResult, error) {
	if s.currentState == nil || questionNum < 1 || questionNum > len(s.currentState.Problems) {
		return nil, fmt.Errorf("invalid game state or question number")
	}

	problem := s.currentState.Problems[questionNum-1]
	isCorrect := playerChoice == problem.CorrectChoice

	result := types.RpsResult{
		SessionID:         s.currentState.ID,
		Round:             problem.Round,
		QuestionNum:       problem.QuestionNum,
		ProblemCardHolder: problem.ProblemCardHolder,
		GivenCard:         problem.GivenCard,
		IsCorrect:         isCorrect,
		ResponseTimeMs:    responseTimeMs,
		PlayerChoice:      playerChoice,
		CorrectChoice:     problem.CorrectChoice,
	}

	if err := database.SaveRpsResult(s.db, result); err != nil {
		return nil, err
	}

	return &result, nil
}

var cards = []string{"ROCK", "PAPER", "SCISSORS"}

func generateProblem(round, questionNum int) Problem {
	card := cards[rand.Intn(len(cards))] // The known card
	var problemCardHolder string

	if round == 1 {
		problemCardHolder = "me"
	} else if round == 2 {
		problemCardHolder = "opponent"
	} else { // Round 3
		if rand.Intn(2) == 0 {
			problemCardHolder = "me"
		} else {
			problemCardHolder = "opponent"
		}
	}

	var correctChoice string
	if problemCardHolder == "me" {
		correctChoice = getWinningCard(card)
	} else { // problemCardHolder == "opponent"
		correctChoice = getLosingCard(card)
	}

	return Problem{
		Round:             round,
		QuestionNum:       questionNum,
		ProblemCardHolder: problemCardHolder,
		GivenCard:         card,
		CorrectChoice:     correctChoice,
	}
}

func getWinningCard(card string) string {
	switch card {
	case "ROCK":
		return "PAPER"
	case "PAPER":
		return "SCISSORS"
	case "SCISSORS":
		return "ROCK"
	default:
		return ""
	}
}

func getLosingCard(card string) string {
	switch card {
	case "ROCK":
		return "SCISSORS"
	case "PAPER":
		return "ROCK"
	case "SCISSORS":
		return "PAPER"
	default:
		return ""
	}
}
