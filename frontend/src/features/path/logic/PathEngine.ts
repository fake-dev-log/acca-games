import { Cell, PathPuzzle, PathResult, PathSettings } from './types';
import { countFences, samePort, trace, Trace } from './board';
import { generatePuzzle, ROUND_CONFIGS } from './generator';

export interface PathGameState {
  settings: PathSettings;
  id: number;
}

export interface CheckResult {
  success: boolean;
  traces: (Trace & { arrived: boolean })[];
}

export class PathEngine {
  private state: PathGameState | null = null;
  private results: PathResult[] = [];

  public startGame(settings: PathSettings): PathGameState {
    if (settings.rounds.length === 0) throw new Error('라운드를 하나 이상 고르세요');
    this.state = { settings, id: Date.now() };
    this.results = [];
    return this.state;
  }

  public newPuzzle(round: number): PathPuzzle {
    return generatePuzzle(ROUND_CONFIGS[round]);
  }

  // '출발' — 지금 울타리대로 모든 교통수단을 몰아 본다
  public check(puzzle: PathPuzzle, board: Cell[][]): CheckResult {
    const traces = puzzle.vehicles.map((v) => {
      const t = trace(board, v.entry);
      return { ...t, arrived: samePort(t.exit, v.target) };
    });
    return { success: traces.every((t) => t.arrived), traces };
  }

  public record(input: {
    round: number; puzzle: PathPuzzle; board: Cell[][]; isCorrect: boolean;
    clicks: number; attempts: number; timeMs: number; revealed: boolean;
  }): PathResult {
    if (!this.state) throw new Error('Game not started');
    const result: PathResult = {
      ...input,
      sessionId: this.state.id,
      problemNum: this.results.length + 1,
      fencesUsed: countFences(input.board),
    };
    this.results.push(result);
    return result;
  }

  public getResults(): PathResult[] {
    return this.results;
  }
}

export const pathEngine = new PathEngine();
