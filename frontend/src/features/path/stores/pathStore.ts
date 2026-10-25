import { create } from 'zustand';
import { GameMode } from '@constants/gameModes';
import { CheckResult, MAX_CLICKS, PathGameState, pathEngine } from '../logic/PathEngine';
import { emptyBoard } from '../logic/board';
import { Cell, Fence, PathPuzzle, PathResult, PathSettings } from '../logic/types';

interface PathState {
  gameState: PathGameState | null;
  gameMode: GameMode;
  sessionId: number | null;
  error: string | null;
  results: PathResult[];

  index: number; // 지금 문제(0부터)
  puzzle: PathPuzzle | null;
  board: Cell[][];
  clicks: number;
  puzzleStartedAt: number;
  submitted: CheckResult | null; // 제출 결과 — 다음 문제로 넘어갈 때까지 보여 준다

  setGameMode: (mode: GameMode) => void;
  startGame: (settings: PathSettings) => void;
  toggleAt: (r: number, c: number, fence: Fence) => void; // 빈칸이면 fence 를 놓고, 울타리가 있으면 치운다
  setCell: (r: number, c: number, value: Cell) => void; // '칸 누르고 방향 고르기'
  submit: () => CheckResult | null;
  next: () => void;
  finish: () => void; // 시간 종료 · '그만하고 결과 보기'
  resetGame: () => void;
}

export const usePathStore = create<PathState>((set, get) => {
  const load = (index: number) => {
    const puzzle = pathEngine.puzzleFor(index);
    return { index, puzzle, board: emptyBoard(puzzle.size), clicks: 0, puzzleStartedAt: Date.now(), submitted: null };
  };

  // 클릭 한 번(최대 MAX_CLICKS)으로 칸을 바꾼다. 벽 · 제출 뒤 · 클릭 소진이면 무시.
  const change = (r: number, c: number, value: Cell) => {
    const { puzzle, board, clicks, submitted } = get();
    if (!puzzle || submitted || clicks >= MAX_CLICKS || puzzle.walls[r][c] || board[r][c] === value) return;
    const nextBoard = board.map((row) => [...row]);
    nextBoard[r][c] = value;
    set({ board: nextBoard, clicks: clicks + 1 });
  };

  const record = (submitted: boolean) => {
    const { puzzle, board, clicks, puzzleStartedAt } = get();
    const result = pathEngine.record(puzzle!, board, clicks, Date.now() - puzzleStartedAt, submitted);
    set((state) => ({ results: [...state.results, result] }));
  };

  return {
    gameState: null,
    gameMode: 'setup',
    sessionId: null,
    error: null,
    results: [],
    index: 0,
    puzzle: null,
    board: [],
    clicks: 0,
    puzzleStartedAt: 0,
    submitted: null,

    setGameMode: (mode) => set({ gameMode: mode }),

    startGame: (settings) => {
      try {
        const gameState = pathEngine.startGame(settings);
        set({ gameState, sessionId: gameState.id, gameMode: 'playing', error: null, results: [], ...load(0) });
      } catch (err: any) {
        set({ error: err.message || 'Unknown error', gameMode: 'setup' });
      }
    },

    toggleAt: (r, c, fence) => change(r, c, get().board[r]?.[c] ? null : fence),

    setCell: (r, c, value) => change(r, c, value),

    submit: () => {
      const { puzzle, board, submitted } = get();
      if (!puzzle || submitted) return null;
      const check = pathEngine.check(puzzle, board);
      record(true);
      set({ submitted: check });
      return check;
    },

    next: () => {
      const { index, gameState } = get();
      if (index + 1 >= gameState!.settings.problemCount) {
        set({ puzzle: null, gameMode: 'result' });
        return;
      }
      set(load(index + 1));
    },

    // 풀던 문제는 손을 댔을 때만 기록한다(제출 전에 끝났으면 못 푼 것으로)
    finish: () => {
      const { puzzle, submitted, clicks } = get();
      if (puzzle && !submitted && clicks > 0) record(false);
      set({ puzzle: null, gameMode: 'result' });
    },

    resetGame: () => set({ gameState: null, gameMode: 'setup', sessionId: null, error: null, results: [], puzzle: null, board: [], index: 0, submitted: null }),
  };
});
