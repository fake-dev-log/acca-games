import { create } from 'zustand';
import { GameMode } from '@constants/gameModes';
import { CheckResult, PathGameState, pathEngine } from '../logic/PathEngine';
import { emptyBoard } from '../logic/board';
import { Cell, PathPuzzle, PathResult, PathSettings } from '../logic/types';

const NEXT: Record<string, Cell> = { null: '/', '/': '\\', '\\': null };

interface PathState {
  gameState: PathGameState | null;
  gameMode: GameMode;
  sessionId: number | null;
  error: string | null;
  results: PathResult[];

  roundIndex: number;
  puzzle: PathPuzzle | null;
  board: Cell[][];
  clicks: number;
  attempts: number;
  puzzleStartedAt: number;
  lastCheck: CheckResult | null; // 마지막 '출발' 결과 — 울타리를 고치면 지운다
  revealed: boolean;
  solved: boolean; // 성공 직후 경로를 잠깐 보여 주는 중

  setGameMode: (mode: GameMode) => void;
  startGame: (settings: PathSettings) => void;
  clickCell: (r: number, c: number) => void;
  launch: () => boolean; // 성공하면 기록하고 solved 로 둔다 — 화면이 잠깐 보여 준 뒤 advance
  advance: () => void;
  skip: () => void;
  reveal: () => void;
  endRound: () => void; // 라운드 시간이 끝났을 때
  resetGame: () => void;
}

const fresh = (puzzle: PathPuzzle) => ({
  puzzle, board: emptyBoard(puzzle.size), clicks: 0, attempts: 0, puzzleStartedAt: Date.now(), lastCheck: null, revealed: false, solved: false,
});

export const usePathStore = create<PathState>((set, get) => {
  const currentRound = () => {
    const { gameState, roundIndex } = get();
    return gameState!.settings.rounds[roundIndex];
  };

  // 지금 문제를 기록한다(성공으로 이미 기록한 문제는 건너뛴다)
  const recordCurrent = (isCorrect: boolean) => {
    const { puzzle, board, clicks, attempts, puzzleStartedAt, revealed, solved } = get();
    if (!puzzle || solved) return;
    const result = pathEngine.record({
      round: currentRound(), puzzle, board, isCorrect, clicks, attempts, timeMs: Date.now() - puzzleStartedAt, revealed,
    });
    set((state) => ({ results: [...state.results, result] }));
  };

  return {
    gameState: null,
    gameMode: 'setup',
    sessionId: null,
    error: null,
    results: [],
    roundIndex: 0,
    puzzle: null,
    board: [],
    clicks: 0,
    attempts: 0,
    puzzleStartedAt: 0,
    lastCheck: null,
    revealed: false,
    solved: false,

    setGameMode: (mode) => set({ gameMode: mode }),

    startGame: (settings) => {
      try {
        const gameState = pathEngine.startGame(settings);
        set({ gameState, sessionId: gameState.id, gameMode: 'playing', error: null, results: [], roundIndex: 0,
          ...fresh(pathEngine.newPuzzle(settings.rounds[0])) });
      } catch (err: any) {
        set({ error: err.message || 'Unknown error', gameMode: 'setup' });
      }
    },

    clickCell: (r, c) => {
      const { board, revealed, solved } = get();
      if (revealed || solved) return;
      const next = board.map((row) => [...row]);
      next[r][c] = NEXT[String(board[r][c])];
      set((state) => ({ board: next, clicks: state.clicks + 1, lastCheck: null }));
    },

    launch: () => {
      const { puzzle, board, revealed, solved } = get();
      if (!puzzle || revealed || solved) return false;
      const check = pathEngine.check(puzzle, board);
      set((state) => ({ attempts: state.attempts + 1, lastCheck: check }));
      if (check.success) {
        recordCurrent(true);
        set({ solved: true });
      }
      return check.success;
    },

    advance: () => set(fresh(pathEngine.newPuzzle(currentRound()))),

    skip: () => {
      recordCurrent(false);
      set(fresh(pathEngine.newPuzzle(currentRound())));
    },

    reveal: () => {
      const { puzzle } = get();
      if (!puzzle) return;
      set({ revealed: true, board: puzzle.solution.map((row) => [...row]), lastCheck: pathEngine.check(puzzle, puzzle.solution) });
    },

    endRound: () => {
      // 시간이 끝났을 때 손도 안 댄 문제는 기록하지 않는다(풀 기회가 없었다)
      if (get().clicks > 0) recordCurrent(false);
      const { gameState, roundIndex } = get();
      if (roundIndex + 1 >= gameState!.settings.rounds.length) {
        set({ puzzle: null, gameMode: 'result' });
        return;
      }
      const nextRound = gameState!.settings.rounds[roundIndex + 1];
      set({ roundIndex: roundIndex + 1, ...fresh(pathEngine.newPuzzle(nextRound)) });
    },

    resetGame: () => set({ gameState: null, gameMode: 'setup', sessionId: null, error: null, results: [], puzzle: null, board: [], roundIndex: 0 }),
  };
});
