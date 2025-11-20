package count_comparison

import (
	"math/rand"
	"testing"

	"acca-games/types"
	"github.com/stretchr/testify/assert"
)

func TestNewGame(t *testing.T) {
	settings := types.CountComparisonSettings{
		NumProblems:      10,
		PresentationTime: 1000,
		InputTime:        3000,
		IsRealMode:       false,
	}

	game, err := NewGame(settings)

	assert.NoError(t, err, "NewGame should not return an error")
	assert.NotNil(t, game, "NewGame should return a valid game instance")

	assert.Equal(t, settings.NumProblems, len(game.Problems), "Game should have the correct number of problems")

	if len(game.Problems) > 0 {
		firstProblem := game.Problems[0]
		assert.Equal(t, 1, firstProblem.ProblemNumber, "First problem number should be 1")
		assert.NotEmpty(t, firstProblem.LeftWordText, "LeftWordText should not be empty")
		assert.NotEmpty(t, firstProblem.RightWordText, "RightWordText should not be empty")
		assert.NotEqual(t, firstProblem.LeftWordText, firstProblem.RightWordText, "Words should be different")
		
		assert.NotEmpty(t, firstProblem.LeftWords, "LeftWords slice should not be empty")
		assert.NotEmpty(t, firstProblem.RightWords, "RightWords slice should not be empty")

		leftWordCount := countActualWords(firstProblem.LeftWords)
		rightWordCount := countActualWords(firstProblem.RightWords)

		assert.True(t, leftWordCount >= minCount && leftWordCount <= maxCount, "Left word count should be within clamp range")
		assert.True(t, rightWordCount >= minCount && rightWordCount <= maxCount, "Right word count should be within clamp range")
	}
}

// countActualWords counts the number of non-gap words in a slice of WordDetail.
func countActualWords(wordDetails []types.WordDetail) int {
	count := 0
	for _, detail := range wordDetails {
		if !detail.IsGap {
			count++
		}
	}
	return count
}

func TestNextProblem(t *testing.T) {
	settings := types.CountComparisonSettings{NumProblems: 3}
	game, _ := NewGame(settings)

	p1 := game.NextProblem()
	assert.NotNil(t, p1)
	assert.Equal(t, 1, p1.ProblemNumber)

	p2 := game.NextProblem()
	assert.NotNil(t, p2)
	assert.Equal(t, 2, p2.ProblemNumber)

	p3 := game.NextProblem()
	assert.NotNil(t, p3)
	assert.Equal(t, 3, p3.ProblemNumber)

	p4 := game.NextProblem()
	assert.Nil(t, p4, "Should return nil when no more problems")
}

func TestGenerateWordDetails(t *testing.T) {
	// Create a game instance with a fixed seed for reproducible random numbers
	// This is crucial for testing functions that rely on randomness.
	seededRand := rand.New(rand.NewSource(0)) // Using a fixed seed (0)
	game := &Game{rng: seededRand}

	t.Run("Basic word generation (no traps)", func(t *testing.T) {
		count := 5
		text := "word"
		details := game.generateWordDetails(count, text, false, false, 0.0) // 0.0 gap probability

		actualWordCount := countActualWords(details)
		assert.Equal(t, count, actualWordCount, "Should generate the correct number of words")

		for _, detail := range details {
			if !detail.IsGap {
				assert.Equal(t, text, detail.Text, "Word text should match")
				// Check that size is within the overall valid range (0.8 to 1.5)
				assert.True(t, detail.Size >= 0.8 && detail.Size <= 1.5, "Font size should be in valid range (0.8-1.5)")
				// Check that weight is either 400 or 700
				assert.True(t, detail.Weight == 400 || detail.Weight == 700, "Font weight should be 400 or 700")
			} else {
				// If gaps appear (due to randomness), assert their properties
				assert.True(t, detail.GapWidth >= 1.0 && detail.GapWidth <= 2.0, "Gap width should be in range")
			}
		}
	})

	t.Run("Word generation with font size trap", func(t *testing.T) {
		count := 5
		text := "word"
		details := game.generateWordDetails(count, text, true, false, 0.0) // Font size trap, no other traps

		actualWordCount := countActualWords(details)
		assert.Equal(t, count, actualWordCount, "Should generate the correct number of words")

		for _, detail := range details {
			if !detail.IsGap {
				// Check that size is within the overall valid range (0.8 to 1.5)
				assert.True(t, detail.Size >= 0.8 && detail.Size <= 1.5, "Font size should be in valid range (0.8-1.5) when trap is active")
				// Default font weight check
				assert.True(t, detail.Weight == 400 || detail.Weight == 700, "Font weight should be 400 or 700")
			}
		}
	})

	t.Run("Word generation with font weight trap", func(t *testing.T) {
		count := 5
		text := "word"
		details := game.generateWordDetails(count, text, false, true, 0.0) // Font weight trap

		actualWordCount := countActualWords(details)
		assert.Equal(t, count, actualWordCount, "Should generate the correct number of words")

		for _, detail := range details {
			if !detail.IsGap {
				// Default font size check
				assert.True(t, detail.Size >= 0.8 && detail.Size <= 1.5, "Font size should be in valid range (0.8-1.5)")
				// Check that weight is either 400 or 700
				assert.True(t, detail.Weight == 400 || detail.Weight == 700, "Font weight should be 400 or 700 when trap is active")
			}
		}
	})

	t.Run("Word generation with gap probability trap", func(t *testing.T) {
		count := 5
		text := "word"
		gapProbability := 1.0 // Force gaps for testing
		details := game.generateWordDetails(count, text, false, false, gapProbability)

		actualWordCount := countActualWords(details)
		assert.Equal(t, count, actualWordCount, "Should generate the correct number of words")

		foundGap := false
		for _, detail := range details {
			if detail.IsGap {
				foundGap = true
				assert.True(t, detail.GapWidth >= 1.0 && detail.GapWidth <= 2.0, "Gap width should be in range")
			}
		}
		assert.True(t, foundGap, "Should generate gaps when gap probability is high")
	})

	t.Run("Word generation with maxCount words", func(t *testing.T) {
		count := maxCount // Use maxCount
		text := "test"
		details := game.generateWordDetails(count, text, false, false, 0.0)
		actualWordCount := countActualWords(details)
		assert.Equal(t, maxCount, actualWordCount, "Should generate maxCount words")
	})

	t.Run("Word generation with minCount words", func(t *testing.T) {
		count := minCount // Use minCount
		text := "test"
		details := game.generateWordDetails(count, text, false, false, 0.0)
		actualWordCount := countActualWords(details)
		assert.Equal(t, minCount, actualWordCount, "Should generate minCount words")
	})
}

func TestClamp(t *testing.T) {
	assert.Equal(t, 5, clamp(1, 5, 10))
	assert.Equal(t, 10, clamp(11, 5, 10))
	assert.Equal(t, 7, clamp(7, 5, 10))
}
