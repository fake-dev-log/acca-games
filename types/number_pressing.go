package types

// NumberPressingSetup contains the user-configurable settings for the game.
type NumberPressingSetup struct {
	IsRealMode       bool  `json:"isRealMode"`
	Rounds           []int `json:"rounds"`
	ProblemsPerRound int   `json:"problemsPerRound"`
	TimeLimitR1      int   `json:"timeLimitR1"` // in seconds
	TimeLimitR2      int   `json:"timeLimitR2"` // in seconds
}

// NumberPressingProblemR1 defines a single problem for Round 1.
type NumberPressingProblemR1 struct {
	TargetNumber int `json:"targetNumber"`
}

// NumberPressingProblemR2 defines a single problem for Round 2.
type NumberPressingProblemR2 struct {
	DoubleClick []int `json:"doubleClick"`
	Skip        []int `json:"skip"`
}

// NumberPressingGameState holds the entire state for a game session.
type NumberPressingGameState struct {
	Setup      NumberPressingSetup       `json:"setup"`
	ProblemsR1 []NumberPressingProblemR1 `json:"problemsR1"`
	ProblemsR2 []NumberPressingProblemR2 `json:"problemsR2"`
	ID         int64                     `json:"id"`
}

// NumberPressingResultR1 holds the result for a single Round 1 problem.
type NumberPressingResultR1 struct {
	ID        int64                   `json:"id"`
	SessionID int64                   `json:"sessionID"`
	Problem   NumberPressingProblemR1 `json:"problem"`
	TimeTaken float64                 `json:"timeTaken"` // in seconds
	IsCorrect bool                    `json:"isCorrect"`
}

// NumberPressingResultR2 holds the result for a single Round 2 problem.
type NumberPressingResultR2 struct {
	ID            int64                   `json:"id"`
	SessionID     int64                   `json:"sessionID"`
	Problem       NumberPressingProblemR2 `json:"problem"`
	PlayerClicks  []int                   `json:"playerClicks"`
	CorrectClicks []int                   `json:"correctClicks"`
	TimeTaken     float64                 `json:"timeTaken"` // in seconds
	IsCorrect     bool                    `json:"isCorrect"`
}

// NumberPressingResultsBundle holds slices of results for both rounds.
type NumberPressingResultsBundle struct {
	ResultsR1 []NumberPressingResultR1 `json:"resultsR1"`
	ResultsR2 []NumberPressingResultR2 `json:"resultsR2"`
}

// NumberPressingSessionWithResults holds a game session and all its results.
type NumberPressingSessionWithResults struct {
	GameSession
	Results NumberPressingResultsBundle `json:"results"`
}

// PaginatedNumberPressingSessions holds a page of sessions and the total count.



type PaginatedNumberPressingSessions struct {



	Sessions   []NumberPressingSessionWithResults `json:"sessions"`



	TotalCount int                                `json:"totalCount"`



}







// NumberPressingConditionStat holds statistics for a specific condition type in Round 2.



type NumberPressingConditionStat struct {



	ConditionType     string  `json:"conditionType"` // e.g., "doubleClick: [1,2], skip: [3,4]"



	TotalQuestions    int     `json:"totalQuestions"`



	TotalCorrect      int     `json:"totalCorrect"`



	Accuracy          float64 `json:"accuracy"`



	AverageTimeTakenSec float64 `json:"averageTimeTakenSec"`



}







// NumberPressingRoundStats holds statistics for a single round (R1 or R2) of a Number Pressing game session.



type NumberPressingRoundStats struct {



	Round             int                           `json:"round"`



	TotalQuestions    int                           `json:"totalQuestions"`



	TotalCorrect      int                           `json:"totalCorrect"`



	Accuracy          float64                       `json:"accuracy"`



	AverageTimeTakenSec float64                       `json:"averageTimeTakenSec"`



	ConditionStats    []NumberPressingConditionStat `json:"conditionStats,omitempty"` // Only for Round 2



}







// NumberPressingSessionStats holds aggregated statistics for an entire Number Pressing game session.



type NumberPressingSessionStats struct {



	SessionID           int64                      `json:"sessionId"`



	TotalQuestions      int                        `json:"totalQuestions"`



	TotalCorrect        int                        `json:"totalCorrect"`



	OverallAccuracy     float64                    `json:"overallAccuracy"`



	AverageTimeTakenSec float64                    `json:"averageTimeTakenSec"`



	RoundStats          []NumberPressingRoundStats `json:"roundStats"`



}








