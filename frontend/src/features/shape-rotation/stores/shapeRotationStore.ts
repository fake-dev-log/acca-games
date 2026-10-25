import { create } from 'zustand';
import { GameMode } from "@constants/gameModes";
import { Transform, ShapeRotationSettings, ShapeRotationProblem, ShapeRotationResult } from '../logic/types';
import { shapeRotationEngine } from '../logic/ShapeRotationEngine';

interface ShapeRotationState {
  gameMode: GameMode;
  sessionId: number | null;
  settings: ShapeRotationSettings;
  problems: ShapeRotationProblem[];
  currentProblemIndex: number;
  userSolution: Transform[];
  clickCount: number;
  isCorrect: boolean | null;
  results: ShapeRotationResult[];
  loading: boolean;
  error: string | null;

  setSessionId: (id: number) => void;
  setGameMode: (mode: GameMode) => void;
  setSettings: (settings: ShapeRotationSettings) => void;
  startGame: () => void;
  addTransform: (transform: Transform) => void;
  undoTransform: () => void;
  clearTransforms: () => void;
  submitAnswer: (elapsedTime: number) => void;
  nextProblem: () => void;
  resetGame: () => void;
}

const useShapeRotationStore = create<ShapeRotationState>((set, get) => ({
  gameMode: 'setup',
  sessionId: null,
  settings: {
    round: 1,
    numProblems: 5,
    timeLimit: 180,
    isRealMode: false,
  },
  problems: [],
  currentProblemIndex: 0,
  userSolution: [],
  clickCount: 0,
  isCorrect: null,
  results: [],
  loading: false,
  error: null,

  setSessionId: (id) => set({ sessionId: id }),
  setGameMode: (mode) => set({ gameMode: mode }),
  setSettings: (settings) => set({ settings }),

  startGame: () => {
    set({ loading: true, error: null });
    try {
      const { sessionId, problems } = shapeRotationEngine.startGame(get().settings);
      set({
        sessionId,
        problems,
        gameMode: 'playing',
        currentProblemIndex: 0,
        userSolution: [],
        clickCount: 0,
        isCorrect: null,
        results: [],
        loading: false,
      });
    } catch (err: any) {
      set({ error: err.message, loading: false, gameMode: 'setup' });
    }
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

  submitAnswer: (elapsedTime: number) => {
    const { problems, currentProblemIndex, userSolution, clickCount, results } = get();
    const currentProblem = problems[currentProblemIndex];
    
    try {
      const result = shapeRotationEngine.submitAnswer(currentProblem, userSolution, elapsedTime, clickCount);
      set({
        results: [...results, result],
      });
    } catch (err) {
      console.error("Failed to submit answer:", err);
    }
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
      results: [],
    });
  },
}));

export default useShapeRotationStore;
