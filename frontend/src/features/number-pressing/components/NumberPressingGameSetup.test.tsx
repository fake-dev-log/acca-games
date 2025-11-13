import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { NumberPressingGameSetup } from './NumberPressingGameSetup';
import { useNumberPressingStore } from '@features/number-pressing/stores/numberPressingStore';

// Mock dependencies
vi.mock('@features/number-pressing/stores/numberPressingStore');

describe('NumberPressingGameSetup component', () => {
  const mockStartGame = vi.fn();
  const mockResetGame = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNumberPressingStore as jest.Mock).mockReturnValue({
      loading: false,
      error: null,
      startGame: mockStartGame,
      resetGame: mockResetGame,
    });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <NumberPressingGameSetup />
      </MemoryRouter>
    );
  };

  it('renders form elements with default values', () => {
    renderComponent();
    expect(screen.getByRole('button', { name: '모든 라운드' })).toHaveClass('bg-primary-light');
    expect(screen.getByLabelText('라운드 당 문제 수 (5-20)')).toHaveValue(10);
    expect(screen.getByLabelText('1라운드 제한 시간 (초, 10-60)')).toHaveValue(30);
    expect(screen.getByLabelText('2라운드 제한 시간 (초, 30-120)')).toHaveValue(60);
  });

  it('updates settings on user input', () => {
    renderComponent();

    // Change round
    fireEvent.click(screen.getByRole('button', { name: /활성화된 숫자 빠르게 누르기/i }));
    expect(screen.getByRole('button', { name: /활성화된 숫자 빠르게 누르기/i })).toHaveClass('bg-primary-light');

    // Change number input
    const problemsInput = screen.getByLabelText('라운드 당 문제 수 (5-20)');
    fireEvent.change(problemsInput, { target: { value: '15' } });
    expect(problemsInput).toHaveValue(15);
  });

  it('calls startGame with correct settings on form submission', () => {
    renderComponent();

    // Change settings
    fireEvent.click(screen.getByRole('button', { name: /무작위 배열에서 순서대로 누르기/i }));
    fireEvent.change(screen.getByLabelText('라운드 당 문제 수 (5-20)'), { target: { value: '20' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: '게임 시작' }));

    expect(mockStartGame).toHaveBeenCalledWith({
      isRealMode: false,
      rounds: [2],
      problemsPerRound: 20,
      timeLimitR1: 30,
      timeLimitR2: 60,
    });
  });

  it('calls resetGame on unmount', () => {
    const { unmount } = renderComponent();
    unmount();
    expect(mockResetGame).toHaveBeenCalledTimes(1);
  });
});
