import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ShapeRotationGameSetup from './ShapeRotationGameSetup';
import useShapeRotationStore from '@features/shape-rotation/stores/shapeRotationStore';
import * as App from '@wails/go/main/App';

// Mock dependencies
vi.mock('@features/shape-rotation/stores/shapeRotationStore');
vi.mock('@wails/go/main/App', () => ({
  SaveShapeRotationSession: vi.fn(),
  GetShapeRotationProblems: vi.fn(),
}));

describe('ShapeRotationGameSetup component', () => {
  const mockSetSettings = vi.fn();
  const mockSetProblems = vi.fn();
  const mockSetGameMode = vi.fn();
  const mockSetSessionId = vi.fn();

  const defaultSettings = {
    round: 1,
    numProblems: 10,
    timeLimit: 180,
    isRealMode: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useShapeRotationStore as any).mockReturnValue({
      settings: defaultSettings,
      setSettings: mockSetSettings,
      setProblems: mockSetProblems,
      setGameMode: mockSetGameMode,
      setSessionId: mockSetSessionId,
    });
    (App.SaveShapeRotationSession as vi.Mock).mockResolvedValue(123);
    (App.GetShapeRotationProblems as vi.Mock).mockResolvedValue([]);
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <ShapeRotationGameSetup />
      </MemoryRouter>
    );
  };

  it('renders form elements with default values from the store', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: /영어 대문자 회전 및 반전/i })).toHaveClass('bg-primary-light');
    expect(screen.getByLabelText(/문제 수/i)).toHaveValue(10);
    expect(screen.getByLabelText(/제한 시간/i)).toHaveValue(180);
  });

  it('calls setSettings when user changes an input', () => {
    renderComponent();

    // Change round
    fireEvent.click(screen.getByRole('button', { name: /4x4 그리드 도형 회전 및 반전/i }));
    expect(mockSetSettings).toHaveBeenCalledWith({ ...defaultSettings, round: 2 });

    // Change number of problems
    fireEvent.change(screen.getByLabelText(/문제 수/i), { target: { value: '5' } });
    expect(mockSetSettings).toHaveBeenCalledWith({ ...defaultSettings, numProblems: 5 });
  });

  it('calls functions to start the game on form submission', async () => {
    renderComponent();

    // Submit form
    await fireEvent.submit(screen.getByRole('button', { name: '게임 시작' }));

    // Check that loading mode is set
    expect(mockSetGameMode).toHaveBeenCalledWith('loading');

    // Check that session is saved and problems are fetched
    expect(App.SaveShapeRotationSession).toHaveBeenCalledWith(defaultSettings);
    await screen.findByText('게임 시작'); // Wait for async operations to complete
    expect(mockSetSessionId).toHaveBeenCalledWith(123);
    expect(App.GetShapeRotationProblems).toHaveBeenCalledWith(defaultSettings.round, defaultSettings.numProblems);
    expect(mockSetProblems).toHaveBeenCalledWith([]);

    // Check that game mode is set to playing
    expect(mockSetGameMode).toHaveBeenCalledWith('playing');
  });

  it('reverts to setup mode if starting the game fails', async () => {
    (App.SaveShapeRotationSession as vi.Mock).mockRejectedValue(new Error('Failed to save'));
    renderComponent();

    await fireEvent.submit(screen.getByRole('button', { name: '게임 시작' }));

    expect(mockSetGameMode).toHaveBeenCalledWith('loading');
    await screen.findByText('게임 시작'); // Wait for async operations to complete
    expect(mockSetGameMode).toHaveBeenCalledWith('setup');
  });
});
