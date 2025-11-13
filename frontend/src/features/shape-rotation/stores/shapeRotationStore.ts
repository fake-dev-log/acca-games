import { create } from 'zustand';
import { types } from '@wails/go/models';
import { getPaginatedShapeRotationSessionsWithResults } from '@api/shapeRotation';
import { GameMode } from "@constants/gameModes";

// Temporary definition until wails generates the real one
export interface ShapeRotationProblem {
  ID: number;
  Round: number;
  InitialShape: string;
  FinalShape: string;
  InitialGridPath?: string;
  FinalGridPath?: string;
  InitialShapeCenterX: number;
  InitialShapeCenterY: number;
  FinalShapeCenterX: number;
  FinalShapeCenterY: number;
  MinMoves: number;
  Solution: string[];
}

export type Transform = 'rotate_left_45' | 'rotate_right_45' | 'flip_horizontal' | 'flip_vertical';

interface ShapeRotationState {
  gameMode: GameMode;
  sessionId: number | null;
  settings: {
    round: number;
    numProblems: number;
    timeLimit: number;
    isRealMode: boolean;
  };
  problems: ShapeRotationProblem[];
  currentProblemIndex: number;
  userSolution: Transform[];
  clickCount: number;
  isCorrect: boolean | null;

  paginatedSessions: {
    sessions: types.ShapeRotationSessionWithResults[];
    totalCount: number;
  };
  loading: boolean;
  error: string | null;

  setSessionId: (id: number) => void;
  setGameMode: (mode: GameMode) => void;
  setSettings: (settings: ShapeRotationState['settings']) => void;
  setProblems: (problems: ShapeRotationProblem[]) => void;
  startRound: () => void;
  addTransform: (transform: Transform) => void;
  undoTransform: () => void;
  clearTransforms: () => void;
  submitAnswer: () => void; // This will be complex
  nextProblem: () => void;
  resetGame: () => void;

  fetchPaginatedSessions: (page: number, limit: number) => Promise<void>;
}

const useShapeRotationStore = create<ShapeRotationState>((set, get) => ({
  gameMode: 'setup',
  sessionId: null,
  settings: {
    round: 0, // 0 for all, 1 for round 1, 2 for round 2
    numProblems: 5,
    timeLimit: 180, // 3 minutes
    isRealMode: false,
  },
  problems: [],
  currentProblemIndex: 0,
  userSolution: [],
  clickCount: 0,
  isCorrect: null,

  paginatedSessions: { sessions: [], totalCount: 0 },
  loading: false,
  error: null,

  setSessionId: (id) => set({ sessionId: id }),
  setGameMode: (mode) => set({ gameMode: mode }),
  setSettings: (settings) => set({ settings }),
  setProblems: (problems) => set({ problems }),

  startRound: () => {
    set({
      gameMode: 'playing',
      currentProblemIndex: 0,
      userSolution: [],
      clickCount: 0,
      isCorrect: null,
    });
  },

  addTransform: (transform) => {
    if (get().userSolution.length < 8 && get().clickCount < 20) {
      set((state) => ({
        userSolution: [...state.userSolution, transform],
        clickCount: state.clickCount + 1,
      }));
    }
  },

  undoTransform: () => {
    if (get().clickCount < 20) {
      set((state) => ({
        userSolution: state.userSolution.slice(0, -1),
        clickCount: state.clickCount + 1,
      }));
    }
  },

  clearTransforms: () => {
    if (get().clickCount < 20) {
      set((state) => ({
        userSolution: [],
        clickCount: state.clickCount + 1,
      }));
    }
  },

  submitAnswer: () => {
    // Placeholder for submission logic
    console.log('Submitting answer:', get().userSolution);
  },

  nextProblem: () => {
    set((state) => ({
      currentProblemIndex: state.currentProblemIndex + 1,
      userSolution: [],
      clickCount: 0,
      isCorrect: null,
    }));
  },

  resetGame: () => {
    set({
      gameMode: 'setup',
      currentProblemIndex: 0,
      userSolution: [],
      isCorrect: null,
    });
  },

  fetchPaginatedSessions: async (page: number, limit: number) => {
    set({ loading: true, error: null });
    try {
      const paginatedResult = await getPaginatedShapeRotationSessionsWithResults(page, limit);
      const typedSessions = paginatedResult.sessions.map(s => types.ShapeRotationSessionWithResults.createFrom(s));
      const parsedSessions = typedSessions.map(s => {
        s.settings = JSON.parse(s.settings as unknown as string);
        return s;
      });
      set({ 
        paginatedSessions: {
          sessions: parsedSessions,
          totalCount: paginatedResult.totalCount,
        }, 
        loading: false 
      });
    } catch (err: any) {
      set({ error: `Failed to fetch paginated sessions for shape-rotation: ${err.message || 'Unknown error'}`, loading: false });
    }
  },
}));


export default useShapeRotationStore;