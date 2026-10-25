import { RpsSettings, GameState, Problem, RpsResult } from './types';

export class RPSEngine {
  private currentState: GameState | null = null;
  private results: RpsResult[] = [];
  private readonly cards = ["ROCK", "PAPER", "SCISSORS"];

  public startGame(settings: RpsSettings): GameState {
    const problems: Problem[] = [];
    let questionCounter = 1;

    for (const round of settings.rounds) {
      for (let i = 0; i < settings.questionsPerRound; i++) {
        problems.push(this.generateProblem(round, questionCounter));
        questionCounter++;
      }
    }

    // Generate a pseudo-random ID for the session (since we don't have a DB)
    const sessionId = Date.now();

    this.currentState = {
      settings: settings,
      problems: problems,
      id: sessionId,
      gameCode: "rps",
    };
    this.results = [];

    return this.currentState;
  }

  public submitAnswer(playerChoice: string, responseTimeMs: number, questionNum: number): RpsResult {
    if (!this.currentState || questionNum < 1 || questionNum > this.currentState.problems.length) {
      throw new Error("Invalid game state or question number");
    }

    const problem = this.currentState.problems[questionNum - 1];
    const isCorrect = playerChoice === problem.correctChoice;

    const result: RpsResult = {
      sessionId: this.currentState.id,
      round: problem.round,
      questionNum: problem.questionNum,
      problemCardHolder: problem.problemCardHolder,
      givenCard: problem.givenCard,
      isCorrect: isCorrect,
      responseTimeMs: responseTimeMs,
      playerChoice: playerChoice,
      correctChoice: problem.correctChoice,
    };

    this.results.push(result);
    return result;
  }
  
  public getResults(): RpsResult[] {
    return this.results;
  }

  private generateProblem(round: number, questionNum: number): Problem {
    const card = this.cards[Math.floor(Math.random() * this.cards.length)];
    let problemCardHolder: string;

    if (round === 1) {
      problemCardHolder = "me";
    } else if (round === 2) {
      problemCardHolder = "opponent";
    } else { // Round 3
      problemCardHolder = Math.random() < 0.5 ? "me" : "opponent";
    }

    let correctChoice: string;
    if (problemCardHolder === "me") {
      correctChoice = this.getWinningCard(card);
    } else { // problemCardHolder == "opponent"
      correctChoice = this.getLosingCard(card);
    }

    return {
      round: round,
      questionNum: questionNum,
      problemCardHolder: problemCardHolder,
      givenCard: card,
      correctChoice: correctChoice,
    };
  }

  private getWinningCard(card: string): string {
    switch (card) {
      case "ROCK":
        return "PAPER";
      case "PAPER":
        return "SCISSORS";
      case "SCISSORS":
        return "ROCK";
      default:
        return "";
    }
  }

  private getLosingCard(card: string): string {
    switch (card) {
      case "ROCK":
        return "SCISSORS";
      case "PAPER":
        return "ROCK";
      case "SCISSORS":
        return "PAPER";
      default:
        return "";
    }
  }
}

export const rpsEngine = new RPSEngine();
