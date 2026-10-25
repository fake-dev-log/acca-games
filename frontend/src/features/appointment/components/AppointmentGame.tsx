import { useCallback, useEffect, useRef, useState } from 'react';
import { useAppointmentStore } from '../stores/appointmentStore';
import { ROUND_INFO } from '../logic/AppointmentEngine';
import { GameLayout } from '@components/layout/GameLayout';
import { ProgressBar } from '@components/common/ProgressBar';
import { useGameLifecycle } from '@hooks/useGameLifecycle';
import { AppointmentOptions, PersonItems } from './AppointmentItems';

const PEOPLE = ['🧑', '👩', '🧓'];
const INTRO_MS = 1500;
const GAP_MS = 500;
const FEEDBACK_MS = 1200;

type Phase =
  | { kind: 'intro' }
  | { kind: 'person'; index: number }
  | { kind: 'gap'; next: number } // next = 3 이면 질문으로
  | { kind: 'question' }
  | { kind: 'feedback'; choice: string | null };

export function AppointmentGame() {
  const { gameState, submitAnswer, setGameMode, resetGame } = useAppointmentStore();
  const [problemIndex, setProblemIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>({ kind: 'intro' });
  const questionStartRef = useRef(0);
  const answeredRef = useRef(false); // 클릭과 시간 초과가 겹쳐도 한 번만 제출

  const problems = gameState?.problems ?? [];
  const problem = problems[problemIndex];
  const settings = gameState?.settings;

  const goNext = useCallback(() => {
    if (problemIndex + 1 >= problems.length) {
      setGameMode('result');
      return;
    }
    const nextRoundStarts = problems[problemIndex + 1].round !== problems[problemIndex].round;
    setProblemIndex(problemIndex + 1);
    setPhase(nextRoundStarts ? { kind: 'intro' } : { kind: 'person', index: 0 });
  }, [problemIndex, problems, setGameMode]);

  const answer = useCallback((choice: string | null) => {
    if (!problem || !settings || phase.kind !== 'question' || answeredRef.current) return;
    answeredRef.current = true;
    const elapsed = choice === null ? settings.responseTimeLimitMs : Date.now() - questionStartRef.current;
    submitAnswer(problem.questionNum, choice, elapsed);
    if (settings.isRealMode) goNext();
    else setPhase({ kind: 'feedback', choice });
  }, [problem, settings, phase.kind, submitAnswer, goNext]);

  const { progress, start, stop } = useGameLifecycle({
    onTimeUp: () => answer(null),
    timeLimit: settings?.responseTimeLimitMs ?? 0,
  });

  // 제시 → 빈 화면 → 다음 사람 … → 질문 순서로 자동 진행
  useEffect(() => {
    if (!settings) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (phase.kind === 'intro') timer = setTimeout(() => setPhase({ kind: 'person', index: 0 }), INTRO_MS);
    if (phase.kind === 'person') timer = setTimeout(() => setPhase({ kind: 'gap', next: phase.index + 1 }), settings.presentationTimeMs);
    if (phase.kind === 'gap') {
      timer = setTimeout(() => setPhase(phase.next < PEOPLE.length ? { kind: 'person', index: phase.next } : { kind: 'question' }), GAP_MS);
    }
    if (phase.kind === 'feedback') timer = setTimeout(goNext, FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [phase, settings, goNext]);

  useEffect(() => {
    if (phase.kind === 'question') {
      answeredRef.current = false;
      questionStartRef.current = Date.now();
      start();
    } else {
      stop();
    }
  }, [phase.kind, start, stop]);

  useEffect(() => {
    if (!gameState) setGameMode('setup');
  }, [gameState, setGameMode]);

  if (!problem || !settings) return null;

  const info = ROUND_INFO[problem.round];
  const marks: Record<string, 'correct' | 'wrong'> = {};
  if (phase.kind === 'feedback') {
    marks[problem.answer] = 'correct';
    if (phase.choice && phase.choice !== problem.answer) marks[phase.choice] = 'wrong';
  }

  const body = () => {
    switch (phase.kind) {
      case 'intro':
        return (
          <div className="text-center space-y-3">
            <p className="text-3xl font-bold">{problem.round}라운드 · {info.name}</p>
            <p className="text-xl">{info.question}</p>
            {problem.round === 4 && <p className="text-lg text-danger font-bold">이번 라운드는 '아무도 타지 않은' 번호가 답입니다</p>}
          </div>
        );
      case 'person':
        return (
          <div className="flex flex-col items-center gap-6">
            <p className="text-2xl font-bold">{PEOPLE[phase.index]} {phase.index + 1}번째 사람</p>
            <PersonItems round={problem.round} items={problem.people[phase.index]} />
          </div>
        );
      case 'gap':
        return <div className="h-40" />;
      case 'question':
      case 'feedback':
        return (
          <div className="flex flex-col items-center gap-6 w-full max-w-2xl">
            <ProgressBar progress={phase.kind === 'question' ? progress : 0} />
            <p className="text-2xl font-bold">{info.question}</p>
            <AppointmentOptions round={problem.round} options={problem.options} marks={marks}
              disabled={phase.kind !== 'question'} onSelect={(option) => answer(option)} />
            <div className="h-8 text-xl font-bold">
              {phase.kind === 'feedback' && (phase.choice === problem.answer
                ? <span className="text-success">정답</span>
                : <span className="text-danger">{phase.choice === null ? '시간 초과' : '오답'}</span>)}
            </div>
          </div>
        );
    }
  };

  return (
    <GameLayout onExit={resetGame}>
      <div className="absolute top-4 left-4 font-mono text-lg">
        {problem.round}라운드 · {problemIndex + 1} / {problems.length}
      </div>
      {body()}
    </GameLayout>
  );
}
