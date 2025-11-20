package types

// CountComparisonSettings holds the settings for a Count Comparison game.
type CountComparisonSettings struct {
	NumProblems      int  `json:"numProblems"`
	PresentationTime int  `json:"presentationTime"` // in milliseconds
	InputTime        int  `json:"inputTime"`        // in milliseconds
	IsRealMode       bool `json:"isRealMode"`
}

// WordDetail represents a single word instance or a gap in the word cloud for rendering.
type WordDetail struct {
	Text     string  `json:"text"`     // The actual word (empty for gaps)
	Size     float64 `json:"size"`     // Corresponds to font size, e.g., 1.5 for 1.5rem (0 for gaps)
	Weight   int     `json:"weight"`   // Corresponds to font weight, e.g., 400, 700 (0 for gaps)
	IsGap    bool    `json:"isGap"`    // True if this is a gap
	GapWidth float64 `json:"gapWidth"` // Width of the gap in rem (only for gaps, 0 for words)
}

// AppliedTrap represents a trap used in a problem.
type AppliedTrap struct {
	Type      string `json:"type"`      // "FontSize", "FontWeight", "Density"
	AppliedTo string `json:"appliedTo"` // "left" or "right"
}

// DensityParams holds the density parameters for a single word cloud.
type DensityParams struct {
	AreaMultiplier float64 `json:"areaMultiplier"`
	GapProbability float64 `json:"gapProbability"`
}

// DensityInfo holds the density parameters for both word clouds in a problem.
type DensityInfo struct {
	Left  DensityParams `json:"left"`
	Right DensityParams `json:"right"`
}

// CountComparisonProblem is the data structure sent to the frontend for rendering.
// It includes all the visual details needed for the word cloud.
type CountComparisonProblem struct {
	ProblemNumber int          `json:"problemNumber"`
	LeftWords     []WordDetail `json:"leftWords"`
	RightWords    []WordDetail `json:"rightWords"`
	LeftWordText  string       `json:"leftWordText"`
	RightWordText string       `json:"rightWordText"`
	Density       DensityInfo `json:"density"`
	PresentationTime int    `json:"presentationTime"`
	InputTime        int    `json:"inputTime"`
	CorrectSide      string `json:"correctSide"` // "left" or "right".
	AppliedTraps     []AppliedTrap `json:"appliedTraps"` // Traps applied to this problem
}

// CountComparisonSubmission holds the player's submission for a single problem.
type CountComparisonSubmission struct {
	ProblemNumber  int    `json:"problemNumber"`
	PlayerChoice   string `json:"playerChoice"` // "left" or "right"
	ResponseTimeMs int    `json:"responseTimeMs"`
}

// CountComparisonResult holds the result of a single problem for database storage.
type CountComparisonResult struct {
	ID             int64  `json:"id"`
	SessionID      int64  `json:"sessionId"`
	ProblemNumber  int    `json:"problemNumber"`
	IsCorrect      bool   `json:"isCorrect"`
	ResponseTimeMs int    `json:"responseTimeMs"`
	PlayerChoice   string `json:"playerChoice"`
	CorrectChoice  string `json:"correctChoice"`
	LeftWord       string `json:"leftWord"`
	RightWord      string `json:"rightWord"`
	LeftWordCount  int    `json:"leftWordCount"`
	RightWordCount int    `json:"rightWordCount"`
	AppliedTraps   string `json:"appliedTraps"` // JSON string of []AppliedTrap
}

// CountComparisonSessionWithResults holds a game session and all its results.
type CountComparisonSessionWithResults struct {
	GameSession
	Results []CountComparisonResult `json:"results"`
}

// PaginatedCountComparisonSessions holds a page of sessions and the total count.
type PaginatedCountComparisonSessions struct {
	Sessions   []CountComparisonSessionWithResults `json:"sessions"`
	TotalCount int                       `json:"totalCount"`
}

// TrapStat holds statistics for a specific trap type.
type TrapStat struct {
	TrapType            string  `json:"trapType"`
	TotalQuestions      int     `json:"totalQuestions"`
	TotalCorrect        int     `json:"totalCorrect"`
	Accuracy            float64 `json:"accuracy"`
	AverageResponseTime float64 `json:"averageResponseTime"`
}

// CountComparisonSessionStats holds aggregated statistics for a session.
type CountComparisonSessionStats struct {
	SessionID             int64      `json:"sessionId"`
	TotalQuestions        int        `json:"totalQuestions"`
	TotalCorrect          int        `json:"totalCorrect"`
	OverallAccuracy       float64    `json:"overallAccuracy"`
	AverageResponseTimeMs float64    `json:"averageResponseTimeMs"`
	TrapStats             []TrapStat `json:"trapStats"`
}