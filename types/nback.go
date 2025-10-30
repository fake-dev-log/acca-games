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
	SessionID      int64  `json:"sessionId"`
	Round          int    `json:"round"`
	QuestionNum    int    `json:"questionNum"`
	IsCorrect      bool   `json:"isCorrect"`
	ResponseTimeMs int    `json:"responseTimeMs"`
	PlayerChoice   string `json:"playerChoice"` // "LEFT", "RIGHT", "SPACE"
	CorrectChoice  string `json:"correctChoice"`// "LEFT", "RIGHT", "SPACE"
}
