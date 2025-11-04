package types

// RpsSettings defines the settings for a Rock-Paper-Scissors game session.
type RpsSettings struct {
	Rounds            []int `json:"rounds"`          // e.g., [1, 2, 3] for all, or [1] for only round 1
	QuestionsPerRound int   `json:"questionsPerRound"`
	TimeLimitMs       int   `json:"timeLimitMs"`
	IsRealMode        bool  `json:"isRealMode"`
}

// RpsResult defines the structure for a single trial result in the RPS game.
type RpsResult struct {
	ID                int64  `json:"id"`
	SessionID         int64  `json:"sessionId"`
	Round             int    `json:"round"`
	QuestionNum       int    `json:"questionNum"`
	ProblemCardHolder string `json:"problemCardHolder"` // 'me' or 'opponent'
	GivenCard         string `json:"givenCard"`         // 'ROCK', 'PAPER', 'SCISSORS'
	IsCorrect         bool   `json:"isCorrect"`
	ResponseTimeMs    int    `json:"responseTimeMs"`
	PlayerChoice      string `json:"playerChoice"`      // 'ROCK', 'PAPER', 'SCISSORS', or 'MISS'
	CorrectChoice     string `json:"correctChoice"`     // 'ROCK', 'PAPER', 'SCISSORS'
}
