package number_pressing

import (
	"database/sql"
	"math/rand"
	"sort"
	"time"

	"acca-games/database"
	"acca-games/types"
)

type Service struct {
	db *sql.DB
}

func NewService(db *sql.DB) *Service {
	return &Service{db: db}
}

func (s *Service) StartGame(setup types.NumberPressingSetup) (*types.NumberPressingGameState, error) {
	sessionID, err := database.CreateGameSession(s.db, types.GameCodeNumberPressing, setup)
	if err != nil {
		return nil, err
	}

	problemsR1 := generateProblemsR1(setup.ProblemsPerRound)
	problemsR2 := generateProblemsR2(setup.ProblemsPerRound)

	gameState := &types.NumberPressingGameState{
		Setup:      setup,
		ProblemsR1: problemsR1,
		ProblemsR2: problemsR2,
		ID:         sessionID,
	}

	return gameState, nil
}

func generateProblemsR1(count int) []types.NumberPressingProblemR1 {
	problems := make([]types.NumberPressingProblemR1, count)
	for i := 0; i < count; i++ {
		problems[i] = types.NumberPressingProblemR1{
			TargetNumber: rand.Intn(9) + 1,
		}
	}
	return problems
}

func generateProblemsR2(count int) []types.NumberPressingProblemR2 {
	problems := make([]types.NumberPressingProblemR2, count)
	for i := 0; i < count; i++ {
		// For simplicity, generate one of each type. A real implementation might have more complex rules.
		doubleClick := []int{rand.Intn(9) + 1}
		skip := []int{rand.Intn(9) + 1}
		// Ensure doubleClick and skip numbers are different
		for doubleClick[0] == skip[0] {
			skip[0] = rand.Intn(9) + 1
		}
		problems[i] = types.NumberPressingProblemR2{
			DoubleClick: doubleClick,
			Skip:        skip,
		}
	}
	return problems
}

func (s *Service) SubmitResultR1(result types.NumberPressingResultR1) error {
	return database.SaveNumberPressingResultR1(s.db, result)
}

func (s *Service) SubmitResultR2(result types.NumberPressingResultR2) error {
	return database.SaveNumberPressingResultR2(s.db, result)
}


// GenerateProblems creates a list of problems for both rounds based on the setup.
func GenerateProblems(setup types.NumberPressingSetup) ([]types.NumberPressingProblemR1, []types.NumberPressingProblemR2) {
	var problemsR1 []types.NumberPressingProblemR1
	var problemsR2 []types.NumberPressingProblemR2

	rand.Seed(time.Now().UnixNano())

	// Generate for Round 1 if it's in the setup
	for _, round := range setup.Rounds {
		if round == 1 {
			for i := 0; i < setup.ProblemsPerRound; i++ {
				problemsR1 = append(problemsR1, types.NumberPressingProblemR1{
					TargetNumber: rand.Intn(9) + 1,
				})
			}
		}
		if round == 2 {
			for i := 0; i < setup.ProblemsPerRound; i++ {
				doubleClickCount := rand.Intn(3) // 0, 1, or 2
				skipCount := rand.Intn(3)        // 0, 1, or 2

				// Ensure not too many skips
				if skipCount == 2 && doubleClickCount > 0 {
					skipCount = 1
				}

				var doubleClick []int
				var skip []int
				
				nums := []int{1, 2, 3, 4, 5, 6, 7, 8, 9}
				rand.Shuffle(len(nums), func(i, j int) { nums[i], nums[j] = nums[j], nums[i] })

				doubleClick = nums[:doubleClickCount]
				
				// Make sure skip numbers are not the same as double-click numbers
				remainingNums := nums[doubleClickCount:]
				if len(remainingNums) < skipCount {
					skipCount = len(remainingNums)
				}
				skip = remainingNums[:skipCount]

				sort.Ints(doubleClick)
				sort.Ints(skip)

				problemsR2 = append(problemsR2, types.NumberPressingProblemR2{
					DoubleClick: doubleClick,
					Skip:        skip,
				})
			}
		}
	}

	return problemsR1, problemsR2
}

// CalculateCorrectClicksR2 determines the correct sequence of clicks for a Round 2 problem.
func CalculateCorrectClicksR2(problem types.NumberPressingProblemR2) []int {
	var correctClicks []int
	
	isSkipped := make(map[int]bool)
	for _, s := range problem.Skip {
		isSkipped[s] = true
	}

	isDoubleClick := make(map[int]bool)
	for _, d := range problem.DoubleClick {
		isDoubleClick[d] = true
	}

	for i := 1; i <= 9; i++ {
		if isSkipped[i] {
			continue
		}
		correctClicks = append(correctClicks, i)
		if isDoubleClick[i] {
			correctClicks = append(correctClicks, i)
		}
	}
	return correctClicks
}
