import { act } from '@testing-library/react';
import { vi } from 'vitest';
import useShapeRotationStore, { ShapeRotationProblem, Transform } from './shapeRotationStore';

const initialState = useShapeRotationStore.getState();

describe('useShapeRotationStore', () => {
  beforeEach(() => {
    act(() => {
      useShapeRotationStore.setState(initialState);
    });
    vi.clearAllMocks();
  });

  describe('settings and problems', () => {
    it('should set settings', () => {
      const newSettings = {
        round: 1,
        numProblems: 10,
        timeLimit: 60,
        isRealMode: true,
      };
      act(() => {
        useShapeRotationStore.getState().setSettings(newSettings);
      });
      expect(useShapeRotationStore.getState().settings).toEqual(newSettings);
    });

    it('should set problems', () => {
      const mockProblems: ShapeRotationProblem[] = [
        { ID: 1, Round: 1, InitialShape: 'path1', FinalShape: 'path2', MinMoves: 1, Solution: ['flip_horizontal'], InitialShapeCenterX: 0, InitialShapeCenterY: 0, FinalShapeCenterX: 0, FinalShapeCenterY: 0 },
      ];
      act(() => {
        useShapeRotationStore.getState().setProblems(mockProblems);
      });
      expect(useShapeRotationStore.getState().problems).toEqual(mockProblems);
    });
  });

  describe('game flow', () => {
    it('should start a round', () => {
      act(() => {
        useShapeRotationStore.setState({
          gameMode: 'setup',
          currentProblemIndex: 5,
          userSolution: ['flip_vertical'],
        });
      });

      act(() => {
        useShapeRotationStore.getState().startRound();
      });

      const state = useShapeRotationStore.getState();
      expect(state.gameMode).toBe('playing');
      expect(state.currentProblemIndex).toBe(0);
      expect(state.userSolution).toEqual([]);
      expect(state.clickCount).toBe(0);
      expect(state.isCorrect).toBeNull();
    });

    it('should proceed to the next problem', () => {
      act(() => {
        useShapeRotationStore.setState({
          currentProblemIndex: 0,
          userSolution: ['rotate_left_45'],
          isCorrect: true,
        });
      });

      act(() => {
        useShapeRotationStore.getState().nextProblem();
      });

      const state = useShapeRotationStore.getState();
      expect(state.currentProblemIndex).toBe(1);
      expect(state.userSolution).toEqual([]);
      expect(state.clickCount).toBe(0);
      expect(state.isCorrect).toBeNull();
    });

    it('should reset the game', () => {
      act(() => {
        useShapeRotationStore.setState({
          gameMode: 'playing',
          currentProblemIndex: 2,
          isCorrect: false,
        });
      });

      act(() => {
        useShapeRotationStore.getState().resetGame();
      });

      const state = useShapeRotationStore.getState();
      expect(state.gameMode).toBe('setup');
      expect(state.currentProblemIndex).toBe(0);
      expect(state.isCorrect).toBeNull();
    });
  });

  describe('user actions (transforms)', () => {
    it('should add a transform to the user solution', () => {
      act(() => {
        useShapeRotationStore.getState().addTransform('flip_horizontal');
      });
      let state = useShapeRotationStore.getState();
      expect(state.userSolution).toEqual(['flip_horizontal']);
      expect(state.clickCount).toBe(1);

      act(() => {
        useShapeRotationStore.getState().addTransform('rotate_right_45');
      });
      state = useShapeRotationStore.getState();
      expect(state.userSolution).toEqual(['flip_horizontal', 'rotate_right_45']);
      expect(state.clickCount).toBe(2);
    });

    it('should not add more than 8 transforms', () => {
      const transforms: Transform[] = [
        'flip_horizontal', 'flip_vertical', 'rotate_left_45', 'rotate_right_45',
        'flip_horizontal', 'flip_vertical', 'rotate_left_45', 'rotate_right_45',
      ];
      act(() => {
        useShapeRotationStore.setState({ userSolution: transforms });
      });

      act(() => {
        useShapeRotationStore.getState().addTransform('flip_horizontal');
      });

      const state = useShapeRotationStore.getState();
      expect(state.userSolution.length).toBe(8);
    });

    it('should undo the last transform', () => {
      act(() => {
        useShapeRotationStore.setState({ userSolution: ['flip_horizontal', 'rotate_right_45'], clickCount: 2 });
      });

      act(() => {
        useShapeRotationStore.getState().undoTransform();
      });

      const state = useShapeRotationStore.getState();
      expect(state.userSolution).toEqual(['flip_horizontal']);
      expect(state.clickCount).toBe(3);
    });

    it('should clear all transforms', () => {
      act(() => {
        useShapeRotationStore.setState({ userSolution: ['flip_horizontal', 'rotate_right_45'], clickCount: 2 });
      });

      act(() => {
        useShapeRotationStore.getState().clearTransforms();
      });

      const state = useShapeRotationStore.getState();
      expect(state.userSolution).toEqual([]);
      expect(state.clickCount).toBe(3);
    });

    it('should not allow more than 20 clicks total', () => {
      act(() => {
        useShapeRotationStore.setState({ clickCount: 19 });
      });

      act(() => {
        useShapeRotationStore.getState().addTransform('flip_horizontal');
      });
      expect(useShapeRotationStore.getState().clickCount).toBe(20);

      // This one should be ignored
      act(() => {
        useShapeRotationStore.getState().addTransform('flip_vertical');
      });
      expect(useShapeRotationStore.getState().clickCount).toBe(20);
      expect(useShapeRotationStore.getState().userSolution.length).toBe(1);
    });
  });
});
