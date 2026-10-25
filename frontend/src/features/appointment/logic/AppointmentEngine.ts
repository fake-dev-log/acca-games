import { AppointmentGameState, AppointmentProblem, AppointmentResult, AppointmentSettings } from './types';

export const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
export const MAP_CELLS = Array.from({ length: 16 }, (_, i) => String(i)); // 4×4, 왼쪽 위부터 행 순서
export const MENUS = ['김밥', '라면', '떡볶이', '돈가스', '짜장면', '초밥', '피자', '햄버거'];

export const ROUND_INFO: Record<number, { name: string; question: string; baseItems: number }> = {
  1: { name: '요일', question: '세 사람 모두 가능한 요일은?', baseItems: 3 },
  2: { name: '위치', question: '세 사람 모두 표시한 위치는?', baseItems: 4 },
  3: { name: '메뉴', question: '세 사람 모두 고른 메뉴는?', baseItems: 3 },
  4: { name: '버스', question: '아무도 타지 않은 버스는?', baseItems: 2 },
};

const PEOPLE = 3;

const shuffle = <T>(items: T[]): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pick = <T>(items: T[], n: number): T[] => shuffle(items).slice(0, n);

// 셋 모두에 들어 있는 항목이 answer 하나뿐인 목록 세 개
function commonOnly(universe: string[], answer: string, perPerson: number): string[][] {
  const others = universe.filter((u) => u !== answer);
  while (true) {
    const people = Array.from({ length: PEOPLE }, () => shuffle([answer, ...pick(others, perPerson - 1)]));
    const sharedByAll = others.filter((o) => people.every((p) => p.includes(o)));
    if (sharedByAll.length === 0) return people;
  }
}

// 버스 번호: 시내버스처럼 보이도록 1~4자리
function busNumbers(count: number): string[] {
  const set = new Set<string>();
  while (set.size < count) {
    const digits = [1, 2, 3, 3, 4][Math.floor(Math.random() * 5)];
    const min = digits === 1 ? 1 : 10 ** (digits - 1);
    set.add(String(min + Math.floor(Math.random() * (10 ** digits - min))));
  }
  return [...set];
}

export class AppointmentEngine {
  private state: AppointmentGameState | null = null;
  private results: AppointmentResult[] = [];

  public startGame(settings: AppointmentSettings): AppointmentGameState {
    const problems: AppointmentProblem[] = [];
    for (const round of settings.rounds) {
      for (let i = 0; i < settings.problemsPerRound; i++) {
        // 라운드 후반 문제는 한 사람이 보여 주는 항목이 하나 늘어난다
        const itemsPerPerson = ROUND_INFO[round].baseItems + (i >= Math.ceil(settings.problemsPerRound / 2) ? 1 : 0);
        problems.push({ ...this.generateProblem(round, itemsPerPerson), questionNum: problems.length + 1 });
      }
    }
    this.state = { settings, problems, id: Date.now() };
    this.results = [];
    return this.state;
  }

  public submitAnswer(questionNum: number, playerChoice: string | null, responseTimeMs: number): AppointmentResult {
    if (!this.state) throw new Error('Game not started');
    const problem = this.state.problems[questionNum - 1];
    if (!problem) throw new Error('Invalid question number');

    const result: AppointmentResult = {
      sessionId: this.state.id,
      round: problem.round,
      questionNum,
      itemsPerPerson: problem.itemsPerPerson,
      people: problem.people,
      answer: problem.answer,
      playerChoice,
      isCorrect: playerChoice === problem.answer,
      responseTimeMs,
    };
    this.results.push(result);
    return result;
  }

  public getResults(): AppointmentResult[] {
    return this.results;
  }

  private generateProblem(round: number, itemsPerPerson: number): Omit<AppointmentProblem, 'questionNum'> {
    if (round === 4) {
      // 세 사람이 탄 번호를 합치면 itemsPerPerson × 2 개. 아무도 안 탄 번호 하나를 더해 선택지를 만든다.
      const [answer, ...ridden] = busNumbers(itemsPerPerson * 2 + 1);
      let people: string[][];
      do {
        people = Array.from({ length: PEOPLE }, () => pick(ridden, itemsPerPerson));
      } while (new Set(people.flat()).size < ridden.length);
      return { round, itemsPerPerson, people, options: shuffle([answer, ...ridden]), answer };
    }

    const universe = round === 1 ? DAYS : round === 2 ? MAP_CELLS : MENUS;
    const answer = universe[Math.floor(Math.random() * universe.length)];
    // 요일·지도는 원래 순서로 선택지를 보여 주고, 메뉴는 섞는다
    const options = round === 3 ? shuffle(universe) : universe;
    return { round, itemsPerPerson, people: commonOnly(universe, answer, itemsPerPerson), options, answer };
  }
}

export const appointmentEngine = new AppointmentEngine();
