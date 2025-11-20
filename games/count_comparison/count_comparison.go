package count_comparison

import (
	_ "embed"
	"encoding/json"
	"fmt"
	"math"
	"math/rand"
	"time"

	"acca-games/types"
)

//go:embed word_list.json
var wordListJSON []byte

// Game holds the state of a single Count Comparison game.
type Game struct {
	Settings       types.CountComparisonSettings
	Problems       []types.CountComparisonProblem
	StartTime      time.Time
	WordPairs      [][]string
	rng            *rand.Rand
	currentProblem int
	SessionID      int64
}

const (
	minCount = 5
	maxCount = 30 // Changed from 40 to 30 as per user request
)

// NewGame creates a new Count Comparison game instance.
func NewGame(settings types.CountComparisonSettings) (*Game, error) {
	game := &Game{
		Settings:       settings,
		StartTime:      time.Now(),
		rng:            rand.New(rand.NewSource(time.Now().UnixNano())),
		currentProblem: 0,
	}

	if err := game.loadWords(); err != nil {
		return nil, fmt.Errorf("failed to load words: %w", err)
	}

	if err := game.generateProblems(); err != nil {
		return nil, fmt.Errorf("failed to generate problems: %w", err)
	}

	return game, nil
}

// loadWords reads the word list from the JSON file.
func (g *Game) loadWords() error {
	var data struct {
		Words [][]string `json:"words"`
	}
	if err := json.Unmarshal(wordListJSON, &data); err != nil {
		return fmt.Errorf("failed to unmarshal word list: %w", err)
	}

	g.WordPairs = data.Words
	return nil
}

// generateProblems creates the full set of problems for the game.
func (g *Game) generateProblems() error {
	g.rng.Shuffle(len(g.WordPairs), func(i, j int) {
		g.WordPairs[i], g.WordPairs[j] = g.WordPairs[j], g.WordPairs[i]
	})

	problems := make([]types.CountComparisonProblem, g.Settings.NumProblems)
	for i := 0; i < g.Settings.NumProblems; i++ {
		wordPair := g.WordPairs[i%len(g.WordPairs)]
		leftWord, rightWord := wordPair[0], wordPair[1]
		if g.rng.Float32() > 0.5 {
			leftWord, rightWord = rightWord, leftWord
		}

		// Determine counts using normal distribution
		difficulty := float64(i) / float64(g.Settings.NumProblems) // 0.0 to ~1.0
		mean := g.rng.Float64()*25 + 5                         // Mean count between 5 and 30 (adjusted for new maxCount)
		stdDevFactor := 0.5 - (0.4 * difficulty)                // StdDev factor from 50% down to 10%
		stdDev := mean * stdDevFactor

		count1 := int(math.Round(g.rng.NormFloat64()*stdDev + mean))
		count2 := int(math.Round(g.rng.NormFloat64()*stdDev + mean))

		// Clamp counts and ensure they are not equal
		count1 = clamp(count1, minCount, maxCount)
		count2 = clamp(count2, minCount, maxCount)
		if count1 == count2 {
			count1++
			count1 = clamp(count1, minCount, maxCount)
		}

		leftCount, rightCount := count1, count2
		correctSide := "left"
		if rightCount > leftCount {
			correctSide = "right"
		}

		// Apply traps
		var appliedTraps []types.AppliedTrap
		trapSide := "left"
		if correctSide == "left" {
			trapSide = "right" // Apply trap to the side with fewer items
		}

		useFontSizeTrap := g.rng.Float32() < 0.5   // 50% chance for font size trap
		useFontWeightTrap := g.rng.Float32() < 0.5 // 50% chance for font weight trap
		useGapProbabilityTrap := g.rng.Float32() < 0.33 // 33% chance for gap probability trap (replaces density trap)

		// Initialize density parameters
		leftDensityParams := types.DensityParams{AreaMultiplier: 1.0, GapProbability: 0.4} // Base gap probability (increased from 0.2)
		rightDensityParams := types.DensityParams{AreaMultiplier: 1.0, GapProbability: 0.4} // Base gap probability (increased from 0.2)

		if useGapProbabilityTrap {
			if trapSide == "left" {
				leftDensityParams.GapProbability = 0.8 // Increased gap probability for trap side (increased from 0.6)
			} else {
				rightDensityParams.GapProbability = 0.8 // Increased gap probability for trap side (increased from 0.6)
			}
			appliedTraps = append(appliedTraps, types.AppliedTrap{Type: "GapProbability", AppliedTo: trapSide})
		}
		if useFontSizeTrap {
			appliedTraps = append(appliedTraps, types.AppliedTrap{Type: "FontSize", AppliedTo: trapSide})
		}
		if useFontWeightTrap {
			appliedTraps = append(appliedTraps, types.AppliedTrap{Type: "FontWeight", AppliedTo: trapSide})
		}

		// Generate word details for frontend
		leftWords := g.generateWordDetails(leftCount, leftWord, trapSide == "left" && useFontSizeTrap, trapSide == "left" && useFontWeightTrap, leftDensityParams.GapProbability)
		rightWords := g.generateWordDetails(rightCount, rightWord, trapSide == "right" && useFontSizeTrap, trapSide == "right" && useFontWeightTrap, rightDensityParams.GapProbability)

		problems[i] = types.CountComparisonProblem{
			ProblemNumber: i + 1,
			LeftWords:     leftWords,
			RightWords:    rightWords,
			LeftWordText:  leftWord,
			RightWordText: rightWord,
			Density: types.DensityInfo{Left: leftDensityParams, Right: rightDensityParams}, // Use new DensityInfo struct
			PresentationTime: g.Settings.PresentationTime,
			InputTime:        g.Settings.InputTime,
			CorrectSide:      correctSide,
			AppliedTraps:     appliedTraps,
		}
	}
	g.Problems = problems
	return nil
}

// generateWordDetails creates the slice of WordDetail for one side of a problem.
func (g *Game) generateWordDetails(count int, text string, hasFontSizeTrap, hasFontWeightTrap bool, gapProbability float64) []types.WordDetail {
	details := make([]types.WordDetail, 0)
	
	// Base probabilities for large/heavy fonts
	largeFontProb := 0.4
	heavyFontProb := 0.4

	if hasFontSizeTrap {
		largeFontProb += 0.1
	}
	if hasFontWeightTrap {
		heavyFontProb += 0.1
	}

	for i := 0; i < count; i++ {
		// Generate gaps BEFORE the word
		for j := 0; j < 3; j++ { // Attempt to add up to 3 gaps
			if g.rng.Float64() < gapProbability {
				gapWidth := 1.0 + g.rng.Float64()*1.0 // 1.0 to 2.0 rem
				details = append(details, types.WordDetail{
					IsGap:    true,
					GapWidth: math.Round(gapWidth*100) / 100,
				})
			} else {
				break // Stop adding gaps if probability fails
			}
		}

		// Size: 0.8rem to 1.5rem (adjusted as per user request)
		size := 0.8 + g.rng.Float64()*0.4 // Default: 0.8 to 1.2
		if g.rng.Float64() < largeFontProb {
			size = 1.2 + g.rng.Float64()*0.3 // Skewed: 1.2 to 1.5
		}

		// Weight: 400 (normal) or 700 (bold)
		weight := 400
		if g.rng.Float64() < heavyFontProb {
			weight = 700
		}

		details = append(details, types.WordDetail{
			Text:   text,
			Size:   math.Round(size*100) / 100, // Round to 2 decimal places
			Weight: weight,
			IsGap:  false, // This is a word
		})

		// Generate gaps AFTER the word
		for j := 0; j < 3; j++ { // Attempt to add up to 3 gaps
			if g.rng.Float64() < gapProbability {
				gapWidth := 1.0 + g.rng.Float64()*1.0 // 1.0 to 2.0 rem (random size for gap)
				details = append(details, types.WordDetail{
					IsGap:    true,
					GapWidth: math.Round(gapWidth*100) / 100, // Round to 2 decimal places
				})
			} else {
				break // Stop adding gaps if probability fails
			}
		}
	}
	return details
}


// NextProblem returns the next problem in the game.
// It returns nil if there are no more problems.
func (g *Game) NextProblem() *types.CountComparisonProblem {
	if g.currentProblem >= len(g.Problems) {
		return nil
	}
	problem := &g.Problems[g.currentProblem]
	g.currentProblem++
	return problem
}

// EndGame cleans up the current game instance.
func (g *Game) EndGame() {
	g.Problems = nil
	g.currentProblem = 0
}

func clamp(value, min, max int) int {
	if value < min {
		return min
	}
	if value > max {
		return max
	}
	return value
}
