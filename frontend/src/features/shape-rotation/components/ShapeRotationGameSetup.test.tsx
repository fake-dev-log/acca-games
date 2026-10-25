import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ShapeRotationGameSetup from './ShapeRotationGameSetup';
import useShapeRotationStore from '@features/shape-rotation/stores/shapeRotationStore';

vi.mock('@features/shape-rotation/stores/shapeRotationStore');

describe('ShapeRotationGameSetup component', () => {
  const mockSetSettings = vi.fn();
  const mockStartGame = vi.fn();

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
      startGame: mockStartGame,
    });
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

    fireEvent.click(screen.getByRole('button', { name: /4x4 그리드 도형 회전 및 반전/i }));
    expect(mockSetSettings).toHaveBeenCalledWith({ ...defaultSettings, round: 2 });

    fireEvent.click(screen.getByRole('button', { name: /모든 라운드/i }));
    expect(mockSetSettings).toHaveBeenCalledWith({ ...defaultSettings, round: 0 });

    fireEvent.change(screen.getByLabelText(/문제 수/i), { target: { value: '5' } });
    expect(mockSetSettings).toHaveBeenCalledWith({ ...defaultSettings, numProblems: 5 });
  });

  it('starts the game on form submission', () => {
    renderComponent();
    fireEvent.submit(screen.getByRole('button', { name: '게임 시작' }));
    expect(mockStartGame).toHaveBeenCalledTimes(1);
  });
});
