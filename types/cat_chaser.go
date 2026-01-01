package types

type CaughtStatus string

const (
	StatusCaught CaughtStatus = "CAUGHT"
	StatusMissed CaughtStatus = "MISSED"
)

// CatChaserSettings defines the settings for the Cat Chaser game.
type CatChaserSettings struct {
	NumTrials         int     `json:"numTrials"`
	Difficulty        string  `json:"difficulty"`        // "auto", "4", "6", "8", "10", "12", "14", "16"
	ShowTime          float64 `json:"showTime"`          // Seconds (0.5 ~ 3.0)
	ResponseTimeLimit float64 `json:"responseTimeLimit"` // Seconds (1.0 ~ 10.0)
	IsRealMode        bool    `json:"isRealMode"`
}

// CatChaserProblem represents a single round's problem data.
type CatChaserProblem struct {
	Round         int          `json:"round"`
	MicePositions []int        `json:"micePositions"` // Flat indices 0-35 (6x6)
	CatPositions  []int        `json:"catPositions"`  // Flat indices 0-35
	RedCatIndex   int          `json:"redCatIndex"`   // Index in CatPositions
	BlueCatIndex  int          `json:"blueCatIndex"`  // Index in CatPositions
	RedCat        CaughtStatus `json:"-"`             // Internal check
	BlueCat       CaughtStatus `json:"-"`
}

// CatChaserResult represents the result of a single user action/round.
type CatChaserResult struct {
	SessionID      int64   `json:"sessionId"`
	Round          int     `json:"round"`
	TargetColor    string  `json:"targetColor"`  // "RED" or "BLUE"
	PlayerChoice   string  `json:"playerChoice"` // "CAUGHT" or "MISSED"
	Confidence     int     `json:"confidence"`   // 1 (Unsure) to 4 (Very Sure)
	CorrectChoice  string  `json:"correctChoice"`
	IsCorrect      bool    `json:"isCorrect"`
	Score          float64 `json:"score"`
	ResponseTimeMs int     `json:"responseTimeMs"`
}

// CatChaserSessionWithResults holds a game session and all its results.
type CatChaserSessionWithResults struct {
	GameSession
	Results []CatChaserResult `json:"results"`
}

// PaginatedCatChaserSessions holds a page of sessions and the total count.
type PaginatedCatChaserSessions struct {
	Sessions   []CatChaserSessionWithResults `json:"sessions"`
	TotalCount int                           `json:"totalCount"`
}

// CatChaserRoundStats holds statistics for a single round (which has 2 answers).
type CatChaserRoundStats struct {
	Round                 int     `json:"round"`
	TotalQuestions        int     `json:"totalQuestions"` // Always 2
	TotalCorrect          int     `json:"totalCorrect"`
	TotalScore            float64 `json:"totalScore"`
	Accuracy              float64 `json:"accuracy"`
	AverageResponseTimeMs float64 `json:"averageResponseTimeMs"`
}

// CatChaserSessionStats holds aggregated statistics for an entire game session.
type CatChaserSessionStats struct {
	SessionID             int64                 `json:"sessionId"`
	TotalQuestions        int                   `json:"totalQuestions"`
	TotalCorrect          int                   `json:"totalCorrect"`
	TotalScore            float64               `json:"totalScore"`
	OverallAccuracy       float64               `json:"overallAccuracy"`
	AverageResponseTimeMs float64               `json:"averageResponseTimeMs"`
	RoundStats            []CatChaserRoundStats `json:"roundStats"`
}