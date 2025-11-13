package shape_rotation

import (
	"strconv"
	"strings"
)

const (
	GridSize = 4
	CellSize = 50
)

// ParseGridToCornerPoints parses a grid string into a slice of points representing the corners of each active cell.
// For each active cell, it generates 8 points representing the 4 line segments of its border.
func ParseGridToCornerPoints(grid string) ([]Point, error) {
	var points []Point
	rows := strings.Split(grid, "/")
	for y, row := range rows {
		for x, char := range row {
			if val, err := strconv.Atoi(string(char)); err == nil && val == 1 {
				top := float64(y * CellSize)
				left := float64(x * CellSize)
				right := left + float64(CellSize)
				bottom := top + float64(CellSize)

				// Top line (left to right)
				points = append(points, Point{X: left, Y: top}, Point{X: right, Y: top})
				// Right line (top to bottom)
				points = append(points, Point{X: right, Y: top}, Point{X: right, Y: bottom})
				// Bottom line (right to left)
				points = append(points, Point{X: right, Y: bottom}, Point{X: left, Y: bottom})
				// Left line (bottom to top)
				points = append(points, Point{X: left, Y: bottom}, Point{X: left, Y: top})
			}
		}
	}
	return points, nil
}

