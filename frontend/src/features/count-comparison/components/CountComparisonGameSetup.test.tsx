import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { create, useStore } from 'zustand';
import CountComparisonGameSetup from './CountComparisonGameSetup';

const mockStore = create<any>((set) => ({
  settings: {
    numProblems: 10,
    presentationTime: 1000,
    inputTime: 3000,
    isRealMode: false,
  },
  loading: false,
  error: null,
  setSettings: vi.fn((settings) => set({ settings })),
  startGame: vi.fn(),
  resetGame: vi.fn(),
}));

vi.mock('../stores/countComparisonStore', () => ({
  useCountComparisonStore: (selector: any) => useStore(mockStore, selector),
}));

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
  Link: ({ children, to }: { children: any, to: string }) => <a href={to}>{children}</a>,
}));

describe('CountComparisonGameSetup', () => {
  beforeEach(() => {
    mockStore.setState({
      settings: {
        numProblems: 10,
        presentationTime: 1000,
        inputTime: 3000,
        isRealMode: false,
      },
      loading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  it('renders all input fields correctly', () => {
    render(<CountComparisonGameSetup />);
    expect(screen.getByLabelText('문제 수 (1-50)')).toBeInTheDocument();
    expect(screen.getByLabelText('제시 시간 (초, 0.5-3)')).toBeInTheDocument();
    expect(screen.getByLabelText('입력 시간 (초, 1-10)')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('calls setSettings when the user changes the number of problems', () => {
    const { setSettings } = mockStore.getState();
    render(<CountComparisonGameSetup />);
    const input = screen.getByLabelText('문제 수 (1-50)');
    fireEvent.change(input, { target: { value: '20' } });
    expect(setSettings).toHaveBeenCalledWith({
      numProblems: 20,
      presentationTime: 1000,
      inputTime: 3000,
      isRealMode: false,
    });
  });

  it('calls startGame when the user clicks the start button', () => {
    const { startGame, settings } = mockStore.getState();
    render(<CountComparisonGameSetup />);
    const button = screen.getByRole('button', { name: '게임 시작' });
    fireEvent.click(button);
    expect(startGame).toHaveBeenCalledWith(settings);
  });

  it('disables the start button when loading', () => {
    mockStore.setState({ loading: true });
    render(<CountComparisonGameSetup />);
    const button = screen.getByRole('button', { name: '시작 중...' });
    expect(button).toBeDisabled();
  });

  it('displays an error message', () => {
    mockStore.setState({ error: 'An error occurred' });
    render(<CountComparisonGameSetup />);
    expect(screen.getByText('An error occurred')).toBeInTheDocument();
  });
});