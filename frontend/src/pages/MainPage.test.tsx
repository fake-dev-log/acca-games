import { ReactElement } from "react";
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import MainPage from './MainPage';

// Mock the useNavigate hook
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: vi.fn(),
  };
});

describe('MainPage component', () => {
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useNavigate as ReturnType<typeof vi.fn>).mockReturnValue(mockNavigate);
  });

  const renderWithRouter = (ui: ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it('renders all buttons correctly', () => {
    renderWithRouter(<MainPage />);
    expect(screen.getByRole('button', { name: /게임/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /기록/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /테마/i })).toBeInTheDocument();
  });

  it('has no quit button on the web build', () => {
    renderWithRouter(<MainPage />);
    expect(screen.queryByRole('button', { name: /종료/i })).not.toBeInTheDocument();
  });

  it('navigates to /games when the "게임" button is clicked', () => {
    renderWithRouter(<MainPage />);
    fireEvent.click(screen.getByRole('button', { name: /게임/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/games');
  });

  it('navigates to /records when the "기록" button is clicked', () => {
    renderWithRouter(<MainPage />);
    fireEvent.click(screen.getByRole('button', { name: /기록/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/records');
  });
});
