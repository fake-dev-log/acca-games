package types

// ShapeRotationSettings holds the settings for a Shape Rotation game.
type ShapeRotationSettings struct {
	NumProblems int  `json:"numProblems"`
	TimeLimit   int  `json:"timeLimit"` // in seconds
	Round       int  `json:"round"`     // 1 for alphabet, 2 for grid
	IsRealMode  bool `json:"isRealMode"`
}

// ShapeRotationResult holds the result of a single round.
type ShapeRotationResult struct {
	ID           int64    `json:"id"`
	SessionID    int64    `json:"sessionId"`
	ProblemID    int      `json:"problemId"`
	UserSolution []string `json:"userSolution"`
	IsCorrect    bool     `json:"isCorrect"`
	SolveTime    int      `json:"solveTime"` // in milliseconds
	ClickCount   int      `json:"clickCount"`
}

// ShapeRotationSessionWithResults holds a game session and all its results.
type ShapeRotationSessionWithResults struct {
	GameSession
	Results []ShapeRotationResult `json:"results"`
}

// PaginatedShapeRotationSessions holds a page of sessions and the total count.
type PaginatedShapeRotationSessions struct {
	Sessions   []ShapeRotationSessionWithResults `json:"sessions"`
	TotalCount int                               `json:"totalCount"`
}
