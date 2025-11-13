package shape_rotation

import (
	"fmt"
	"math/rand"
	"strings"
)

// ShapeRotationProblemWithFinalShape is used to send the problem with the calculated final shape to the frontend.
type ShapeRotationProblemWithFinalShape struct {
	ID                  int      `json:"ID"`
	Round               int      `json:"Round"`
	InitialShape        string   `json:"InitialShape"`
	FinalShape          string   `json:"FinalShape"`
	InitialGridPath     string   `json:"InitialGridPath,omitempty"`
	FinalGridPath       string   `json:"FinalGridPath,omitempty"`
	InitialShapeCenterX float64  `json:"InitialShapeCenterX"`
	InitialShapeCenterY float64  `json:"InitialShapeCenterY"`
	FinalShapeCenterX   float64  `json:"FinalShapeCenterX"`
	FinalShapeCenterY   float64  `json:"FinalShapeCenterY"`
	MinMoves            int      `json:"MinMoves"`
	Solution            []string `json:"Solution"`
}

func pointsToPathString(points []Point) string {
	var pathParts []string
	for i := 0; i < len(points); i += 2 {
		if i == 0 {
			pathParts = append(pathParts, fmt.Sprintf("M %.3f %.3f", points[i].X, points[i].Y))
		} else {
			// Check for discontinuity
			if points[i-1].X != points[i].X || points[i-1].Y != points[i].Y {
				pathParts = append(pathParts, fmt.Sprintf("M %.3f %.3f", points[i].X, points[i].Y))
			}
		}
		pathParts = append(pathParts, fmt.Sprintf("L %.3f %.3f", points[i+1].X, points[i+1].Y))
	}
	return strings.Join(pathParts, " ")
}

func getCenter(points []Point) (float64, float64) {
	if len(points) == 0 {
		return 0, 0
	}
	minX, minY, maxX, maxY := points[0].X, points[0].Y, points[0].X, points[0].Y
	for _, pt := range points {
		if pt.X < minX {
			minX = pt.X
		}
		if pt.X > maxX {
			maxX = pt.X
		}
		if pt.Y < minY {
			minY = pt.Y
		}
		if pt.Y > maxY {
			maxY = pt.Y
		}
	}
	return minX + (maxX-minX)/2, minY + (maxY-minY)/2
}

var availableTransforms = []string{"rotate_left_45", "rotate_right_45", "flip_horizontal", "flip_vertical"}
var oppositeMoves = map[string]string{
	"rotate_left_45":  "rotate_right_45",
	"rotate_right_45": "rotate_left_45",
	"flip_horizontal": "flip_horizontal",
	"flip_vertical":   "flip_vertical",
}

func generateRandomSolution(initialPoints []Point, numMoves int, isGrid bool) []string {
	var solution []string
	var finalPoints []Point

	for {
		solution = make([]string, numMoves)
		for i := 0; i < numMoves; i++ {
			var prevMove string
			if i > 0 {
				prevMove = solution[i-1]
			}

			// Loop until a valid (non-cancelling) next move is chosen
			for {
				nextMove := availableTransforms[rand.Intn(len(availableTransforms))]
				if prevMove != "" && oppositeMoves[prevMove] == nextMove {
					continue // Invalid move, try again
				}
				solution[i] = nextMove
				break
			}
		}

		if isGrid {
			gridCenter := float64(GridSize * CellSize / 2)
			finalPoints = ApplyTransformationsToPoints(initialPoints, solution, gridCenter, gridCenter)
		} else {
			finalPoints = ApplyTransformationsToPoints(initialPoints, solution)
		}

		if !ComparePointSets(initialPoints, finalPoints) {
			break // Found a solution that actually changes the shape
		}
	}
	return solution
}

func GetProblems(round int, numProblems int) ([]ShapeRotationProblemWithFinalShape, error) {
	result := make([]ShapeRotationProblemWithFinalShape, numProblems)

	if round == 1 {
		shapeKeys := make([]string, 0, len(canonicalShapes))
		for k := range canonicalShapes {
			shapeKeys = append(shapeKeys, k)
		}

		for i := 0; i < numProblems; i++ {
			shapeKey := shapeKeys[rand.Intn(len(shapeKeys))]
			initialShape := canonicalShapes[shapeKey]
			minMoves := rand.Intn(4) + 1

			initialPoints := ParseShapeToPoints(initialShape)
			solution := generateRandomSolution(initialPoints, minMoves, false)
			finalPoints := ApplyTransformationsToPoints(initialPoints, solution)
			finalShapeStr := pointsToPathString(finalPoints)

			icx, icy := getCenter(initialPoints)
			fcx, fcy := getCenter(finalPoints)

			result[i] = ShapeRotationProblemWithFinalShape{
				ID:                  i + 1,
				Round:               1,
				InitialShape:        initialShape,
				FinalShape:          finalShapeStr,
				InitialShapeCenterX: icx,
				InitialShapeCenterY: icy,
				FinalShapeCenterX:   fcx,
				FinalShapeCenterY:   fcy,
				MinMoves:            minMoves,
				Solution:            solution,
			}
		}
	} else if round == 2 {
		for i := 0; i < numProblems; i++ {
			// Select a random base shape from the GridProblems list
			randProblem := GridProblems[rand.Intn(len(GridProblems))]
			gridCenter := float64(GridSize * CellSize / 2)
			minMoves := rand.Intn(4) + 1 

			// Initial state
			initialShapePoints, err := ParseGridToCornerPoints(randProblem.InitialShape)
			if err != nil {
				return nil, fmt.Errorf("failed to parse grid for problem %d: %w", randProblem.ID, err)
			}
			initialShapePath := pointsToPathString(initialShapePoints)
			initialGridPoints := GenerateGridLines()
			initialGridPath := pointsToPathString(initialGridPoints)

			// Generate a valid random solution
			solution := generateRandomSolution(initialShapePoints, minMoves, true)

			// Final state
			finalShapePoints := ApplyTransformationsToPoints(initialShapePoints, solution, gridCenter, gridCenter)
			finalShapePath := pointsToPathString(finalShapePoints)
			finalGridPoints := ApplyTransformationsToPoints(initialGridPoints, solution, gridCenter, gridCenter)
			finalGridPath := pointsToPathString(finalGridPoints)

			result[i] = ShapeRotationProblemWithFinalShape{
				ID:                  randProblem.ID, // This might not be unique if numProblems > len(GridProblems)
				Round:               2,
				InitialShape:        initialShapePath,
				FinalShape:          finalShapePath,
				InitialGridPath:     initialGridPath,
				FinalGridPath:       finalGridPath,
				InitialShapeCenterX: gridCenter,
				InitialShapeCenterY: gridCenter,
				FinalShapeCenterX:   gridCenter,
				FinalShapeCenterY:   gridCenter,
				MinMoves:            minMoves,
				Solution:            solution,
			}
		}
	} else {
		return GetProblems(1, numProblems)
	}

	return result, nil
}

// VerifySolution checks if the user's solution is correct by applying transformations.
func VerifySolution(problem ShapeRotationProblemWithFinalShape, userSolution []string) bool {
	if len(userSolution) > problem.MinMoves {
		return false
	}

	var initialPoints []Point
	var transformedPoints []Point

	if problem.Round == 2 {
		var originalGridProblem *ShapeRotationProblem
		for _, p := range GridProblems {
			if p.ID == problem.ID {
				originalGridProblem = &p
				break
			}
		}
		if originalGridProblem != nil {
			var err error
			initialPoints, err = ParseGridToCornerPoints(originalGridProblem.InitialShape)
			if err != nil {
				return false
			}
		} else {
			return false // Should not happen
		}
		gridCenter := float64(GridSize * CellSize / 2)
		transformedPoints = ApplyTransformationsToPoints(initialPoints, userSolution, gridCenter, gridCenter)
	} else {
		initialPoints = ParseShapeToPoints(problem.InitialShape)
		transformedPoints = ApplyTransformationsToPoints(initialPoints, userSolution)
	}

	finalPoints := ParseShapeToPoints(problem.FinalShape)
	return ComparePointSets(transformedPoints, finalPoints)
}

