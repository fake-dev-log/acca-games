import { AppointmentGameState, AppointmentProblem, AppointmentResult, AppointmentSettings } from './types';

export const DAYS = ['월', '화', '수', '목', '금', '토', '일'];
export const PLACES = Array.from({ length: 16 }, (_, i) => String(i)); // 마을 지도의 건물 16채, 왼쪽 위부터 행 순서
export const MENUS = ['김밥', '라면', '떡볶이', '돈가스', '짜장면', '초밥', '피자', '햄버거'];

export const ROUND_INFO: Record<number, { name: string; question: string }> = {
  1: { name: '요일', question: '어떤 요일에 만나면 좋을까요?' },
  2: { name: '장소', question: '어떤 장소에서 만나면 좋을까요?' },
  3: { name: '메뉴', question: '어떤 메뉴를 먹으면 좋을까요?' },
  4: { name: '버스', question: '아무도 타지 않은 버스는?' },
};

// 실전: 4라운드 × 10문항, 한 사람 1초, 응답 3초
export const REAL_SETTINGS: AppointmentSettings = {
  rounds: [1, 2, 3, 4], problemsPerRound: 10, presentationTimeMs: 1000, responseTimeLimitMs: 3000, isRealMode: true,
};

const PEOPLE = 3;
const BASE_ITEMS = 3; // 라운드 후반(6번째 문항부터)은 4개

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
    if (others.every((o) => !people.every((p) => p.includes(o)))) return people;
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

export const itemsPerPersonAt = (index: number, problemsPerRound: number) =>
  BASE_ITEMS + (index >= Math.ceil(problemsPerRound / 2) ? 1 : 0);

export class AppointmentEngine {
  private state: AppointmentGameState | null = null;
  private results: AppointmentResult[] = [];

  public startGame(settings: AppointmentSettings): AppointmentGameState {
    const problems: AppointmentProblem[] = [];
    for (const round of settings.rounds) {
      let previous: Omit<AppointmentProblem, 'questionNum'> | null = null;
      for (let i = 0; i < settings.problemsPerRound; i++) {
        const itemsPerPerson = itemsPerPersonAt(i, settings.problemsPerRound);
        // 정답이 바로 앞 문항과 같거나 같은 자리에 오지 않게 한다(자리로 외우는 걸 막는다)
        let problem: Omit<AppointmentProblem, 'questionNum'>;
        do {
          problem = this.generateProblem(round, itemsPerPerson);
        } while (previous && (problem.answer === previous.answer
          || problem.options.indexOf(problem.answer) === previous.options.indexOf(previous.answer)));
        previous = problem;
        problems.push({ ...problem, questionNum: problems.length + 1 });
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
      // 세 사람이 탄 번호를 합치면 itemsPerPerson × 2 개. 아무도 안 탄 번호 하나를 더해 보기를 만든다.
      const [answer, ...ridden] = busNumbers(itemsPerPerson * 2 + 1);
      let people: string[][];
      do {
        people = Array.from({ length: PEOPLE }, () => pick(ridden, itemsPerPerson));
      } while (new Set(people.flat()).size < ridden.length);
      return { round, itemsPerPerson, people, options: shuffle([answer, ...ridden]), answer };
    }

    const universe = round === 1 ? DAYS : round === 2 ? PLACES : MENUS;
    const answer = universe[Math.floor(Math.random() * universe.length)];
    const people = commonOnly(universe, answer, itemsPerPerson);
    // 요일은 월~일 7장, 장소는 지도 전체가 보기다. 메뉴는 화면에 나왔던 메뉴만 보기로 써서
    // '한두 사람만 고른 메뉴' 가 함정이 되게 한다.
    const options = round === 3 ? shuffle([...new Set(people.flat())]) : universe;
    return { round, itemsPerPerson, people, options, answer };
  }
}

export const appointmentEngine = new AppointmentEngine();
