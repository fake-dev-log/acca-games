import { Cell, PathPuzzle, PathResult, PathSettings, PathVerdict } from './types';
import { countFences, samePort, trace, Trace } from './board';
import { generatePuzzle, levelFor } from './generator';

export interface PathGameState {
  settings: PathSettings;
  id: number;
}

export interface CheckResult {
  verdict: PathVerdict;
  traces: (Trace & { arrived: boolean })[];
}

// 실전: 48문제 · 5분 · 보통 · 정답 비공개
export const REAL_SETTINGS: PathSettings = { isRealMode: true, difficulty: 'normal', timeLimitSec: 300, problemCount: 48 };
export const MAX_CLICKS = 20;

export class PathEngine {
  private state: PathGameState | null = null;
  private results: PathResult[] = [];

  public startGame(settings: PathSettings): PathGameState {
    if (settings.problemCount < 1) throw new Error('문제 수는 1 이상이어야 합니다');
    this.state = { settings, id: Date.now() };
    this.results = [];
    return this.state;
  }

  public puzzleFor(index: number): PathPuzzle {
    if (!this.state) throw new Error('Game not started');
    const { problemCount, difficulty } = this.state.settings;
    return generatePuzzle(levelFor(index, problemCount, difficulty));
  }

  // 지금 울타리대로 모든 교통수단을 몰아 본다
  public check(puzzle: PathPuzzle, board: Cell[][]): CheckResult {
    const traces = puzzle.vehicles.map((v) => {
      const t = trace(board, v.entry, puzzle.walls);
      return { ...t, arrived: samePort(t.exit, v.target) };
    });
    const arrived = traces.every((t) => t.arrived);
    const verdict: PathVerdict = !arrived ? 'wrong' : countFences(board) > puzzle.minFences ? 'excess' : 'perfect';
    return { verdict, traces };
  }

  // submitted=false 는 제출 전에 시간이 끝난 문제 — 판이 맞아 있어도 못 푼 것으로 센다
  public record(puzzle: PathPuzzle, board: Cell[][], clicks: number, timeMs: number, submitted = true): PathResult {
    if (!this.state) throw new Error('Game not started');
    const verdict: PathVerdict = submitted ? this.check(puzzle, board).verdict : 'wrong';
    const fencesUsed = countFences(board);
    const result: PathResult = {
      sessionId: this.state.id,
      problemNum: this.results.length + 1,
      puzzle,
      board,
      isCorrect: verdict !== 'wrong',
      verdict,
      fencesUsed,
      excessFences: verdict === 'wrong' ? 0 : fencesUsed - puzzle.minFences,
      clicks,
      timeMs,
    };
    this.results.push(result);
    return result;
  }

  public getResults(): PathResult[] {
    return this.results;
  }
}

export const pathEngine = new PathEngine();
