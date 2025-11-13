package shape_rotation

import (
	"math"
	"regexp"
	"sort"
	"strconv"
	"strings"
)

const epsilon = 1e-3
const tessellationSegments = 10 // Segments per curve

type Point struct {
	X, Y float64
}

// PointsSorter sorts points for consistent comparison.
type PointsSorter []Point

func (p PointsSorter) Len() int      { return len(p) }
func (p PointsSorter) Swap(i, j int) { p[i], p[j] = p[j], p[i] }
func (p PointsSorter) Less(i, j int) bool {
	if math.Abs(p[i].X-p[j].X) > epsilon {
		return p[i].X < p[j].X
	}
	return p[i].Y < p[j].Y
}

// ParseShapeToPoints parses an SVG path data string into a slice of points.
// It handles M, L, Q, C, and Z commands, tessellating curves into polylines.
func ParseShapeToPoints(pathData string) []Point {
	var points []Point
	re := regexp.MustCompile(`([MLQCZ])([^MLQCZ]*)`)
	submatches := re.FindAllStringSubmatch(pathData, -1)

	var currentPos, startPos Point

	for _, match := range submatches {
		command := match[1]
		argsStr := strings.TrimSpace(match[2])
		args := parseArgs(argsStr)

		switch command {
		case "M":
			currentPos = Point{X: args[0], Y: args[1]}
			startPos = currentPos
		case "L":
			points = append(points, currentPos, Point{X: args[0], Y: args[1]})
			currentPos = Point{X: args[0], Y: args[1]}
		case "Q":
			ctrl1 := Point{X: args[0], Y: args[1]}
			end := Point{X: args[2], Y: args[3]}
			points = append(points, tessellateQuadratic(currentPos, ctrl1, end)...)
			currentPos = end
		case "C":
			ctrl1 := Point{X: args[0], Y: args[1]}
			ctrl2 := Point{X: args[2], Y: args[3]}
			end := Point{X: args[4], Y: args[5]}
			points = append(points, tessellateCubic(currentPos, ctrl1, ctrl2, end)...)
			currentPos = end
		case "Z":
			points = append(points, currentPos, startPos)
		}
	}
	return points
}

func parseArgs(argStr string) []float64 {
	f := func(c rune) bool {
		return c == ' ' || c == ','
	}
	fields := strings.FieldsFunc(argStr, f)
	var args []float64
	for _, field := range fields {
		val, _ := strconv.ParseFloat(field, 64)
		args = append(args, val)
	}
	return args
}

func tessellateQuadratic(p0, p1, p2 Point) []Point {
	var points []Point
	for i := 0; i <= tessellationSegments; i++ {
		t := float64(i) / float64(tessellationSegments)
		mt := 1 - t
		x := mt*mt*p0.X + 2*mt*t*p1.X + t*t*p2.X
		y := mt*mt*p0.Y + 2*mt*t*p1.Y + t*t*p2.Y
		points = append(points, Point{X: x, Y: y})
	}
	// Convert curve points to line segments
	var lines []Point
	for i := 0; i < len(points)-1; i++ {
		lines = append(lines, points[i], points[i+1])
	}
	return lines
}

func tessellateCubic(p0, p1, p2, p3 Point) []Point {
	var points []Point
	for i := 0; i <= tessellationSegments; i++ {
		t := float64(i) / float64(tessellationSegments)
		mt := 1 - t
		x := math.Pow(mt, 3)*p0.X + 3*math.Pow(mt, 2)*t*p1.X + 3*mt*t*t*p2.X + math.Pow(t, 3)*p3.X
		y := math.Pow(mt, 3)*p0.Y + 3*math.Pow(mt, 2)*t*p1.Y + 3*mt*t*t*p2.Y + math.Pow(t, 3)*p3.Y
		points = append(points, Point{X: x, Y: y})
	}
	var lines []Point
	for i := 0; i < len(points)-1; i++ {
		lines = append(lines, points[i], points[i+1])
	}
	return lines
}

func GenerateGridLines() []Point {
	var points []Point
	gridPixelSize := float64(GridSize * CellSize)

	for i := 0; i <= GridSize; i++ {
		// Vertical lines
		points = append(points, Point{X: float64(i * CellSize), Y: 0}, Point{X: float64(i * CellSize), Y: gridPixelSize})
		// Horizontal lines
		points = append(points, Point{X: 0, Y: float64(i * CellSize)}, Point{X: gridPixelSize, Y: float64(i * CellSize)})
	}
	return points
}

// ApplyTransformationsToPoints applies a series of transformations to a slice of points.
// It can optionally accept a center of rotation. If not provided, it calculates the centroid of the points.
func ApplyTransformationsToPoints(points []Point, transformations []string, center ...float64) []Point {
	var cx, cy float64
	if len(center) == 2 {
		cx, cy = center[0], center[1]
	} else {
		for _, p := range points {
			cx += p.X
			cy += p.Y
		}
		cx /= float64(len(points))
		cy /= float64(len(points))
	}

	newPoints := make([]Point, len(points))
	for i, p := range points {
		newPoints[i] = Point{X: p.X - cx, Y: p.Y - cy}
	}

	for _, transform := range transformations {
		angle := 0.0
		isFlipH := false
		isFlipV := false

		switch transform {
		case "rotate_right_45":
			angle = math.Pi / 4
		case "rotate_left_45":
			angle = -math.Pi / 4
		case "flip_horizontal":
			isFlipH = true
		case "flip_vertical":
			isFlipV = true
		}

		cosA := math.Cos(angle)
		sinA := math.Sin(angle)

		for i, p := range newPoints {
			newX, newY := p.X, p.Y
			if angle != 0 {
				newX = p.X*cosA - p.Y*sinA
				newY = p.X*sinA + p.Y*cosA
			}
			if isFlipH {
				newX = -newX
			}
			if isFlipV {
				newY = -newY
			}
			newPoints[i] = Point{X: newX, Y: newY}
		}
	}

	// Translate points back
	for i := range newPoints {
		newPoints[i].X += cx
		newPoints[i].Y += cy
	}

	return newPoints
}

// ComparePointSets checks if two slices of points are identical by sorting them and comparing with a tolerance.
func ComparePointSets(a, b []Point) bool {
	if len(a) != len(b) {
		return false
	}

	// Create copies to avoid modifying the original slices
	aCopy := make([]Point, len(a))
	copy(aCopy, a)
	bCopy := make([]Point, len(b))
	copy(bCopy, b)

	// Sort both slices. The custom sorter handles epsilon comparisons during sorting.
	sort.Sort(PointsSorter(aCopy))
	sort.Sort(PointsSorter(bCopy))

	// Compare element by element with a tolerance
	for i := range aCopy {
		if math.Abs(aCopy[i].X-bCopy[i].X) > epsilon || math.Abs(aCopy[i].Y-bCopy[i].Y) > epsilon {
			return false
		}
	}

	return true
}
