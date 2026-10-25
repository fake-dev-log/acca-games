import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { GameEndPage } from './GameEndPage';
import { rpsGame } from '@features/rps/definition';
import { useRpsStore } from '@features/rps/stores/rpsStore';
import { recordStore } from '@records/recordStore';
import { RpsResult, RpsSettings } from '@features/rps/logic/types';

const settings: RpsSettings = { rounds: [1], questionsPerRound: 2, timeLimitMs: 3000, isRealMode: false };
const result = (questionNum: number, isCorrect: boolean, sessionId: number): RpsResult => ({
  sessionId, round: 1, questionNum, problemCardHolder: 'me', givenCard: 'ROCK',
  isCorrect, responseTimeMs: 400, playerChoice: isCorrect ? 'PAPER' : 'ROCK', correctChoice: 'PAPER',
});

const finishGame = (sessionId: number, results: RpsResult[]) => act(() => {
  useRpsStore.setState({
    gameMode: 'result', sessionId, results,
    gameState: { settings, problems: [], id: sessionId, gameCode: 'rps' },
  });
});

const renderPage = () => render(<MemoryRouter><GameEndPage game={rpsGame} /></MemoryRouter>);

describe('GameEndPage', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    act(() => useRpsStore.getState().resetGame());
  });

  it('saves the finished session once and shows the accuracy', async () => {
    const sessionId = 1_700_000_000_001;
    finishGame(sessionId, [result(1, true, sessionId), result(2, false, sessionId)]);
    const save = vi.spyOn(recordStore, 'save');
    renderPage();

    expect(screen.getByText('정답률: 50.0%')).toBeInTheDocument();
    expect(await screen.findByText('기록에 저장했습니다.')).toBeInTheDocument();
    const saved = await recordStore.get(sessionId);
    expect(saved).toMatchObject({ id: sessionId, gameCode: 'RPS', settings, playedAt: new Date(sessionId).toISOString() });
    expect(saved!.results).toHaveLength(2);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('tells the player when the record could not be saved', async () => {
    const sessionId = 1_700_000_000_002;
    finishGame(sessionId, [result(1, true, sessionId)]);
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(recordStore, 'save').mockRejectedValue(new Error('QuotaExceededError'));
    renderPage();

    expect(await screen.findByText(/기록을 저장하지 못했습니다/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '기록 보기' })).not.toBeInTheDocument();
    expect(screen.getByText('정답률: 100.0%')).toBeInTheDocument();
  });

  it('does not save an empty session', async () => {
    finishGame(1_700_000_000_003, []);
    const save = vi.spyOn(recordStore, 'save');
    renderPage();
    expect(screen.getByText('기록된 결과가 없습니다.')).toBeInTheDocument();
    await waitFor(() => expect(save).not.toHaveBeenCalled());
  });

  it('goes back to setup on "다시하기" and toggles the detail view', async () => {
    const sessionId = 1_700_000_000_004;
    finishGame(sessionId, [result(1, true, sessionId)]);
    renderPage();
    await screen.findByText('기록에 저장했습니다.');

    fireEvent.click(screen.getByRole('button', { name: '결과 상세' }));
    expect(screen.getByRole('button', { name: '상세 닫기' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '다시하기' }));
    expect(useRpsStore.getState().gameMode).toBe('setup');
  });
});
