package types

// NBackSettings holds the settings for an N-Back game.
type NBackSettings struct {
	NumTrials        int    `json:"numTrials"`
	PresentationTime int    `json:"presentationTime"` // in milliseconds
	NBackLevel       int    `json:"nBackLevel"`     // 1 for 2-back, 2 for 2-back & 3-back mix
	ShapeGroup       string `json:"shapeGroup"`
	IsRealMode       bool   `json:"isRealMode"`
}

// NBackResult holds the result of a single trial.
type NBackResult struct {
	ID             int64  `json:"id"`
	SessionID      int64  `json:"sessionId"`
	Round          int    `json:"round"`
	QuestionNum    int    `json:"questionNum"`
	IsCorrect      bool   `json:"isCorrect"`
	ResponseTimeMs int    `json:"responseTimeMs"`
	PlayerChoice   string `json:"playerChoice"` // "LEFT", "RIGHT", "SPACE"
	CorrectChoice  string `json:"correctChoice"`// "LEFT", "RIGHT", "SPACE"
}

// NBackSessionWithResults holds a game session and all its results.
type NBackSessionWithResults struct {
	GameSession
	Results []NBackResult `json:"results"`
}

// PaginatedNBackSessions holds a page of sessions and the total count.
type PaginatedNBackSessions struct {
	Sessions   []NBackSessionWithResults `json:"sessions"`
	TotalCount int                       `json:"totalCount"`
}

// NBackLevelStat holds statistics for a specific N-back level within Round 2.
type NBackLevelStat struct {
	NBackLevel          int     `json:"nBackLevel"` // 2 or 3
	TotalQuestions      int     `json:"totalQuestions"`
	TotalCorrect        int     `json:"totalCorrect"`
	Accuracy            float64 `json:"accuracy"`
	AverageResponseTimeMs float64 `json:"averageResponseTimeMs"`
}

// NBackRoundStats holds statistics for a single round of an N-Back game session.
type NBackRoundStats struct {
	Round                 int              `json:"round"`
	TotalQuestions        int              `json:"totalQuestions"`
	TotalCorrect          int              `json:"totalCorrect"`
	Accuracy              float64          `json:"accuracy"`
	AverageResponseTimeMs float64          `json:"averageResponseTimeMs"`
	NBackLevelStats       []NBackLevelStat `json:"nBackLevelStats,omitempty"` // Only for Round 2
}

// NBackSessionStats holds aggregated statistics for an entire N-Back game session.
type NBackSessionStats struct {
	SessionID             int64             `json:"sessionId"`
	TotalQuestions        int               `json:"totalQuestions"`
	TotalCorrect          int               `json:"totalCorrect"`
	OverallAccuracy       float64           `json:"overallAccuracy"`
	AverageResponseTimeMs float64           `json:"averageResponseTimeMs"`
	RoundStats            []NBackRoundStats `json:"roundStats"`
}

