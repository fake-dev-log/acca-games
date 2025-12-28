import { Transform, ShapeRotationSettings, ShapeRotationProblem, ShapeRotationResult } from './types';

interface Point {
  x: number;
  y: number;
}

const EPSILON = 1e-3;
const TESSELLATION_SEGMENTS = 10;
const GRID_SIZE = 4;
const CELL_SIZE = 50;

const CANONICAL_SHAPES: Record<string, string> = {
  "F": "M 9 41.1 L 9 71.4 L 0 71.4 L 0 0 L 39.9 0 L 39.9 7.9 L 9 7.9 L 9 33.2 L 38 33.2 L 38 41.1 L 9 41.1 Z",
  "G": "M 34.601 42.7 L 34.601 34.7 L 59.301 34.7 L 59.301 69.7 Q 53.501 71.6 47.601 72.5 Q 41.701 73.4 34.201 73.4 Q 23.101 73.4 15.501 68.95 Q 7.901 64.5 3.951 56.25 Q 0.001 48 0.001 36.7 Q 0.001 25.5 4.401 17.3 Q 8.801 9.1 17.051 4.55 Q 25.301 0 37.001 0 Q 43.001 0 48.351 1.1 Q 53.701 2.2 58.301 4.2 L 54.901 12 Q 51.101 10.3 46.351 9.1 Q 41.601 7.9 36.501 7.9 Q 28.001 7.9 21.901 11.4 Q 15.801 14.9 12.601 21.35 Q 9.401 27.8 9.401 36.7 Q 9.401 45.2 12.151 51.75 Q 14.901 58.3 20.801 61.95 Q 26.701 65.6 36.301 65.6 Q 41.001 65.6 44.301 65.1 Q 47.601 64.6 50.301 63.9 L 50.301 42.7 L 34.601 42.7 Z",
  "J": "M 0 89.1 L 0 81.5 Q 1.6 81.9 3.4 82.2 Q 5.2 82.5 7.2 82.5 Q 9.7 82.5 11.95 81.5 Q 14.2 80.5 15.6 78 Q 17 75.5 17 71 L 17 0 L 26 0 L 26 70.3 Q 26 77.2 23.7 81.65 Q 21.4 86.1 17.2 88.25 Q 13 90.4 7.4 90.4 Q 5 90.4 3.2 90.05 Q 1.4 89.7 0 89.1 Z",
  "L": "M 40.2 71.4 L 0 71.4 L 0 0 L 9 0 L 9 63.4 L 40.2 63.4 L 40.2 71.4 Z",
  "P": "M 0 0.001 L 18.9 0.001 Q 32.9 0.001 39.3 5.501 Q 45.7 11.001 45.7 21.001 Q 45.7 25.401 44.25 29.451 Q 42.8 33.501 39.5 36.701 Q 36.2 39.901 30.7 41.751 Q 25.2 43.601 17.2 43.601 L 9 43.601 L 9 71.401 L 0 71.401 L 0 0.001 Z M 18.1 7.701 L 9 7.701 L 9 35.901 L 16.2 35.901 Q 23 35.901 27.5 34.451 Q 32 33.001 34.2 29.801 Q 36.4 26.601 36.4 21.401 Q 36.4 14.501 32 11.101 Q 27.6 7.701 18.1 7.701 Z",
  "Q": "M 45.101 71.701 L 62.201 89.501 L 49.301 89.501 L 35.501 73.401 Q 34.901 73.401 34.251 73.451 Q 33.601 73.501 33.001 73.501 Q 24.601 73.501 18.401 70.851 Q 12.201 68.201 8.101 63.351 Q 4.001 58.501 2.001 51.701 Q 0.001 44.901 0.001 36.601 Q 0.001 25.601 3.601 17.401 Q 7.201 9.201 14.551 4.601 Q 21.901 0.001 33.101 0.001 Q 43.801 0.001 51.101 4.551 Q 58.401 9.101 62.151 17.351 Q 65.901 25.601 65.901 36.701 Q 65.901 45.401 63.551 52.501 Q 61.201 59.601 56.601 64.501 Q 52.001 69.401 45.101 71.701 Z M 9.501 36.701 Q 9.501 45.701 12.001 52.201 Q 14.501 58.701 19.751 62.201 Q 25.001 65.701 33.001 65.701 Q 41.101 65.701 46.251 62.201 Q 51.401 58.701 53.901 52.201 Q 56.401 45.701 56.401 36.701 Q 56.401 23.201 50.801 15.551 Q 45.201 7.901 33.101 7.901 Q 25.001 7.901 19.751 11.351 Q 14.501 14.801 12.001 21.251 Q 9.501 27.701 9.501 36.701 Z",
  "R": "M 0 0 L 19.7 0 Q 28.6 0 34.35 2.25 Q 40.1 4.5 42.9 9 Q 45.7 13.5 45.7 20.3 Q 45.7 26 43.6 29.8 Q 41.5 33.6 38.25 35.85 Q 35 38.1 31.4 39.4 L 51 71.4 L 40.5 71.4 L 23.2 41.9 L 9 41.9 L 9 71.4 L 0 71.4 L 0 0 Z M 19.2 7.8 L 9 7.8 L 9 34.3 L 19.7 34.3 Q 28.4 34.3 32.4 30.85 Q 36.4 27.4 36.4 20.7 Q 36.4 16 34.55 13.2 Q 32.7 10.4 28.9 9.1 Q 25.1 7.8 19.2 7.8 Z",
};

const GRID_PROBLEMS = [
  { ID: 10, InitialShape: "0110/0110/0110/1110" },
  { ID: 11, InitialShape: "0100/1110/0110/0010" },
  { ID: 12, InitialShape: "0011/0110/1100/1000" },
  { ID: 13, InitialShape: "1110/1100/1000/1000" },
  { ID: 14, InitialShape: "1000/1000/1010/1100" },
  { ID: 15, InitialShape: "1000/1100/0100/0110" },
  { ID: 16, InitialShape: "1000/1100/1110/0111" },
  { ID: 17, InitialShape: "1000/0100/0010/0011" },
];

const AVAILABLE_TRANSFORMS: Transform[] = ["rotate_left_45", "rotate_right_45", "flip_horizontal", "flip_vertical"];
const OPPOSITE_MOVES: Record<string, string> = {
  "rotate_left_45": "rotate_right_45",
  "rotate_right_45": "rotate_left_45",
  "flip_horizontal": "flip_horizontal",
  "flip_vertical": "flip_vertical",
};

export class ShapeRotationEngine {
  private currentSessionId: number | null = null;
  private currentProblems: ShapeRotationProblem[] = [];
  private results: ShapeRotationResult[] = [];

  public startGame(settings: ShapeRotationSettings): { sessionId: number; problems: ShapeRotationProblem[] } {
    this.currentSessionId = Date.now();
    this.currentProblems = this.generateProblems(settings.round, settings.numProblems);
    this.results = [];
    return { sessionId: this.currentSessionId, problems: this.currentProblems };
  }

  public submitAnswer(problem: ShapeRotationProblem, userSolution: Transform[], solveTime: number, clickCount: number): ShapeRotationResult {
    if (!this.currentSessionId) throw new Error("No active session");

    const isCorrect = this.verifySolution(problem, userSolution);

    const result: ShapeRotationResult = {
      sessionId: this.currentSessionId,
      problemId: problem.ID,
      userSolution,
      isCorrect,
      solveTime,
      clickCount,
    };

    this.results.push(result);
    return result;
  }

  public getResults(): ShapeRotationResult[] {
    return this.results;
  }

  private generateProblems(round: number, numProblems: number): ShapeRotationProblem[] {
    const problems: ShapeRotationProblem[] = [];
    const actualRound = round === 0 ? 1 : round; // Simplify for now

    for (let i = 0; i < numProblems; i++) {
      if (actualRound === 1) {
        const shapeKeys = Object.keys(CANONICAL_SHAPES);
        const shapeKey = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
        const initialShape = CANONICAL_SHAPES[shapeKey];
        const minMoves = Math.floor(Math.random() * 4) + 1;

        const initialPoints = this.parseShapeToPoints(initialShape);
        const solution = this.generateRandomSolution(initialPoints, minMoves, false);
        const finalPoints = this.applyTransformations(initialPoints, solution);
        const finalShapeStr = this.pointsToPathString(finalPoints);

        const { x: icx, y: icy } = this.getCenter(initialPoints);
        const { x: fcx, y: fcy } = this.getCenter(finalPoints);

        problems.push({
          ID: i + 1,
          Round: 1,
          InitialShape: initialShape,
          FinalShape: finalShapeStr,
          InitialShapeCenterX: icx,
          InitialShapeCenterY: icy,
          FinalShapeCenterX: fcx,
          FinalShapeCenterY: fcy,
          MinMoves: minMoves,
          Solution: solution,
        });
      } else {
        const randProblem = GRID_PROBLEMS[Math.floor(Math.random() * GRID_PROBLEMS.length)];
        const gridCenter = (GRID_SIZE * CELL_SIZE) / 2;
        const minMoves = Math.floor(Math.random() * 4) + 1;

        const initialShapePoints = this.parseGridToCornerPoints(randProblem.InitialShape);
        const initialShapePath = this.pointsToPathString(initialShapePoints);
        const initialGridPoints = this.generateGridLines();
        const initialGridPath = this.pointsToPathString(initialGridPoints);

        const solution = this.generateRandomSolution(initialShapePoints, minMoves, true);

        const finalShapePoints = this.applyTransformations(initialShapePoints, solution, gridCenter, gridCenter);
        const finalShapePath = this.pointsToPathString(finalShapePoints);
        const finalGridPoints = this.applyTransformations(initialGridPoints, solution, gridCenter, gridCenter);
        const finalGridPath = this.pointsToPathString(finalGridPoints);

        problems.push({
          ID: randProblem.ID,
          Round: 2,
          InitialShape: initialShapePath,
          FinalShape: finalShapePath,
          InitialGridPath: initialGridPath,
          FinalGridPath: finalGridPath,
          InitialShapeCenterX: gridCenter,
          InitialShapeCenterY: gridCenter,
          FinalShapeCenterX: gridCenter,
          FinalShapeCenterY: gridCenter,
          MinMoves: minMoves,
          Solution: solution,
        });
      }
    }
    return problems;
  }

  private generateRandomSolution(initialPoints: Point[], numMoves: number, isGrid: boolean): Transform[] {
    const gridCenter = isGrid ? (GRID_SIZE * CELL_SIZE) / 2 : undefined;
    
    while (true) {
      const solution: Transform[] = [];
      for (let i = 0; i < numMoves; i++) {
        let nextMove: Transform;
        const prevMove = solution[i - 1];
        
        while (true) {
          nextMove = AVAILABLE_TRANSFORMS[Math.floor(Math.random() * AVAILABLE_TRANSFORMS.length)];
          if (prevMove && OPPOSITE_MOVES[prevMove] === nextMove) continue;
          break;
        }
        solution.push(nextMove);
      }

      const finalPoints = this.applyTransformations(initialPoints, solution, gridCenter, gridCenter);
      if (!this.comparePointSets(initialPoints, finalPoints)) {
        return solution;
      }
    }
  }

  private verifySolution(problem: ShapeRotationProblem, userSolution: Transform[]): boolean {
    if (userSolution.length > problem.MinMoves) return false;

    let initialPoints: Point[];
    let transformedPoints: Point[];

    if (problem.Round === 2) {
      // Find original grid problem by ID
      const original = GRID_PROBLEMS.find(p => p.ID === problem.ID);
      if (!original) return false;
      initialPoints = this.parseGridToCornerPoints(original.InitialShape);
      const gridCenter = (GRID_SIZE * CELL_SIZE) / 2;
      transformedPoints = this.applyTransformations(initialPoints, userSolution, gridCenter, gridCenter);
    } else {
      initialPoints = this.parseShapeToPoints(problem.InitialShape);
      transformedPoints = this.applyTransformations(initialPoints, userSolution);
    }

    const finalPoints = this.parseShapeToPoints(problem.FinalShape);
    return this.comparePointSets(transformedPoints, finalPoints);
  }

  // --- Utility Methods ---

  private parseShapeToPoints(pathData: string): Point[] {
    const points: Point[] = [];
    const re = /([MLQCZ])([^MLQCZ]*)/g;
    let match;

    let currentPos = { x: 0, y: 0 };
    let startPos = { x: 0, y: 0 };

    while ((match = re.exec(pathData)) !== null) {
      const command = match[1];
      const args = (match[2].trim().split(/[ ,]+/).map(Number)).filter(n => !isNaN(n));

      switch (command) {
        case "M":
          currentPos = { x: args[0], y: args[1] };
          startPos = { ...currentPos };
          break;
        case "L":
          points.push({ ...currentPos }, { x: args[0], y: args[1] });
          currentPos = { x: args[0], y: args[1] };
          break;
        case "Q":
          const ctrl1 = { x: args[0], y: args[1] };
          const endQ = { x: args[2], y: args[3] };
          points.push(...this.tessellateQuadratic(currentPos, ctrl1, endQ));
          currentPos = endQ;
          break;
        case "C":
          const ctrl1C = { x: args[0], y: args[1] };
          const ctrl2C = { x: args[2], y: args[3] };
          const endC = { x: args[4], y: args[5] };
          points.push(...this.tessellateCubic(currentPos, ctrl1C, ctrl2C, endC));
          currentPos = endC;
          break;
        case "Z":
          points.push({ ...currentPos }, { ...startPos });
          break;
      }
    }
    return points;
  }

  private tessellateQuadratic(p0: Point, p1: Point, p2: Point): Point[] {
    const curvePoints: Point[] = [];
    for (let i = 0; i <= TESSELLATION_SEGMENTS; i++) {
      const t = i / TESSELLATION_SEGMENTS;
      const mt = 1 - t;
      const x = mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x;
      const y = mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y;
      curvePoints.push({ x, y });
    }
    const lines: Point[] = [];
    for (let i = 0; i < curvePoints.length - 1; i++) {
      lines.push(curvePoints[i], curvePoints[i + 1]);
    }
    return lines;
  }

  private tessellateCubic(p0: Point, p1: Point, p2: Point, p3: Point): Point[] {
    const curvePoints: Point[] = [];
    for (let i = 0; i <= TESSELLATION_SEGMENTS; i++) {
      const t = i / TESSELLATION_SEGMENTS;
      const mt = 1 - t;
      const x = Math.pow(mt, 3) * p0.x + 3 * Math.pow(mt, 2) * t * p1.x + 3 * mt * t * t * p2.x + Math.pow(t, 3) * p3.x;
      const y = Math.pow(mt, 3) * p0.y + 3 * Math.pow(mt, 2) * t * p1.y + 3 * mt * t * t * p2.y + Math.pow(t, 3) * p3.y;
      curvePoints.push({ x, y });
    }
    const lines: Point[] = [];
    for (let i = 0; i < curvePoints.length - 1; i++) {
      lines.push(curvePoints[i], curvePoints[i + 1]);
    }
    return lines;
  }

  private parseGridToCornerPoints(grid: string): Point[] {
    const points: Point[] = [];
    const rows = grid.split("/");
    rows.forEach((row, y) => {
      [...row].forEach((char, x) => {
        if (char === "1") {
          const top = y * CELL_SIZE;
          const left = x * CELL_SIZE;
          const right = left + CELL_SIZE;
          const bottom = top + CELL_SIZE;

          points.push({ x: left, y: top }, { x: right, y: top });
          points.push({ x: right, y: top }, { x: right, y: bottom });
          points.push({ x: right, y: bottom }, { x: left, y: bottom });
          points.push({ x: left, y: bottom }, { x: left, y: top });
        }
      });
    });
    return points;
  }

  private generateGridLines(): Point[] {
    const points: Point[] = [];
    const size = GRID_SIZE * CELL_SIZE;
    for (let i = 0; i <= GRID_SIZE; i++) {
      points.push({ x: i * CELL_SIZE, y: 0 }, { x: i * CELL_SIZE, y: size });
      points.push({ x: 0, y: i * CELL_SIZE }, { x: size, y: i * CELL_SIZE });
    }
    return points;
  }

  private applyTransformations(points: Point[], transforms: Transform[], cx_in?: number, cy_in?: number): Point[] {
    let cx = 0, cy = 0;
    if (cx_in !== undefined && cy_in !== undefined) {
      cx = cx_in; cy = cy_in;
    } else {
      points.forEach(p => { cx += p.x; cy += p.y; });
      cx /= points.length;
      cy /= points.length;
    }

    let newPoints = points.map(p => ({ x: p.x - cx, y: p.y - cy }));

    for (const transform of transforms) {
      let angle = 0;
      let isFlipH = false;
      let isFlipV = false;

      switch (transform) {
        case "rotate_right_45": angle = Math.PI / 4; break;
        case "rotate_left_45": angle = -Math.PI / 4; break;
        case "flip_horizontal": isFlipH = true; break;
        case "flip_vertical": isFlipV = true; break;
      }

      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      newPoints = newPoints.map(p => {
        let { x, y } = p;
        if (angle !== 0) {
          const nx = x * cosA - y * sinA;
          const ny = x * sinA + y * cosA;
          x = nx; y = ny;
        }
        if (isFlipH) x = -x;
        if (isFlipV) y = -y;
        return { x, y };
      });
    }

    return newPoints.map(p => ({ x: p.x + cx, y: p.y + cy }));
  }

  private comparePointSets(a: Point[], b: Point[]): boolean {
    if (a.length !== b.length) return false;

    const sortFn = (p1: Point, p2: Point) => {
      if (Math.abs(p1.x - p2.x) > EPSILON) return p1.x - p2.x;
      return p1.y - p2.y;
    };

    const aSorted = [...a].sort(sortFn);
    const bSorted = [...b].sort(sortFn);

    return aSorted.every((p, i) => 
      Math.abs(p.x - bSorted[i].x) < EPSILON && 
      Math.abs(p.y - bSorted[i].y) < EPSILON
    );
  }

  private pointsToPathString(points: Point[]): string {
    let path = "";
    for (let i = 0; i < points.length; i += 2) {
      const p1 = points[i];
      const p2 = points[i + 1];
      if (i === 0 || Math.abs(points[i - 1].x - p1.x) > EPSILON || Math.abs(points[i - 1].y - p1.y) > EPSILON) {
        path += `M ${p1.x.toFixed(3)} ${p1.y.toFixed(3)} `;
      }
      path += `L ${p2.x.toFixed(3)} ${p2.y.toFixed(3)} `;
    }
    return path.trim();
  }

  private getCenter(points: Point[]): Point {
    if (points.length === 0) return { x: 0, y: 0 };
    let minX = points[0].x, minY = points[0].y, maxX = points[0].x, maxY = points[0].y;
    points.forEach(p => {
      minX = Math.min(minX, p.x); minY = Math.min(minY, p.y);
      maxX = Math.max(maxX, p.x); maxY = Math.max(maxY, p.y);
    });
    return { x: minX + (maxX - minX) / 2, y: minY + (maxY - minY) / 2 };
  }
}

export const shapeRotationEngine = new ShapeRotationEngine();
