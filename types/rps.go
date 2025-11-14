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

// RpsSessionWithResults holds a game session and all its results.
type RpsSessionWithResults struct {
	GameSession
	Results []RpsResult `json:"results"`
}

// PaginatedRpsSessions holds a page of sessions and the total count.
type PaginatedRpsSessions struct {
	Sessions   []RpsSessionWithResults `json:"sessions"`
	TotalCount int                     `json:"totalCount"`
}

// RpsProblemCardHolderStat holds statistics for 'me' or 'opponent' as the problem card holder.
type RpsProblemCardHolderStat struct {
	ProblemCardHolder   string  `json:"problemCardHolder"` // 'me' or 'opponent'
	TotalQuestions      int     `json:"totalQuestions"`
	TotalCorrect        int     `json:"totalCorrect"`
	Accuracy            float64 `json:"accuracy"`
	AverageResponseTimeMs float64 `json:"averageResponseTimeMs"`
}

// RpsRoundStats holds statistics for a single round of an RPS game session.
type RpsRoundStats struct {
	Round                 int                          `json:"round"`
	TotalQuestions        int                          `json:"totalQuestions"`
	TotalCorrect          int                          `json:"totalCorrect"`
	Accuracy              float64                      `json:"accuracy"`
	AverageResponseTimeMs float64                      `json:"averageResponseTimeMs"`
	ProblemCardHolderStats []RpsProblemCardHolderStat `json:"problemCardHolderStats"`
}

// RpsSessionStats holds aggregated statistics for an entire RPS game session.
type RpsSessionStats struct {
	SessionID             int64           `json:"sessionId"`
	TotalQuestions        int             `json:"totalQuestions"`
	TotalCorrect          int             `json:"totalCorrect"`
	OverallAccuracy       float64         `json:"overallAccuracy"`
	AverageResponseTimeMs float64         `json:"averageResponseTimeMs"`
	RoundStats            []RpsRoundStats `json:"roundStats"`
}

