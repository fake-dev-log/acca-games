import { CountComparisonSettings, CountComparisonProblem, CountComparisonResult, WordDetail, DensityParams, AppliedTrap } from './types';
import wordListData from './word_list.json';

const MIN_COUNT = 5;
const MAX_COUNT = 30;

export class CountComparisonEngine {
  private currentSettings: CountComparisonSettings | null = null;
  private currentProblems: CountComparisonProblem[] = [];
  private currentProblemIndex: number = 0;
  private sessionId: number = 0;
  private results: CountComparisonResult[] = [];
  private wordPairs: string[][] = [];

  constructor() {
    this.wordPairs = (wordListData as any).words;
  }

  public startGame(settings: CountComparisonSettings): { sessionId: number } {
    this.currentSettings = settings;
    this.sessionId = Date.now();
    this.currentProblemIndex = 0;
    this.results = [];
    this.currentProblems = this.generateProblems(settings.numProblems);
    
    return { sessionId: this.sessionId };
  }

  public getNextProblem(): CountComparisonProblem | null {
    if (this.currentProblemIndex >= this.currentProblems.length) {
      return null;
    }
    const problem = this.currentProblems[this.currentProblemIndex];
    return problem;
  }

  public submitAnswer(playerChoice: string, responseTimeMs: number): boolean {
    if (this.currentProblemIndex >= this.currentProblems.length) {
      return false;
    }

    const problem = this.currentProblems[this.currentProblemIndex];
    const isCorrect = playerChoice === problem.correctSide;

    const leftWordCount = this.countWords(problem.leftWords);
    const rightWordCount = this.countWords(problem.rightWords);

    const result: CountComparisonResult = {
      sessionId: this.sessionId,
      problemNumber: problem.problemNumber,
      isCorrect,
      responseTimeMs,
      playerChoice,
      correctChoice: problem.correctSide,
      leftWord: problem.leftWordText,
      rightWord: problem.rightWordText,
      leftWordCount,
      rightWordCount,
      appliedTraps: problem.appliedTraps,
    };

    this.results.push(result);
    this.currentProblemIndex++;
    return isCorrect;
  }

  public getResults(): CountComparisonResult[] {
    return this.results;
  }

  private countWords(details: WordDetail[]): number {
    return details.filter(d => !d.isGap).length;
  }

  private generateProblems(numProblems: number): CountComparisonProblem[] {
    // Shuffle word pairs
    const shuffledPairs = [...this.wordPairs].sort(() => Math.random() - 0.5);
    const problems: CountComparisonProblem[] = [];

    for (let i = 0; i < numProblems; i++) {
      const wordPair = shuffledPairs[i % shuffledPairs.length];
      let [leftWord, rightWord] = wordPair;
      if (Math.random() > 0.5) {
        [leftWord, rightWord] = [rightWord, leftWord];
      }

      const difficulty = i / numProblems;
      const mean = Math.random() * 25 + 5;
      const stdDevFactor = 0.5 - (0.4 * difficulty);
      const stdDev = mean * stdDevFactor;

      let count1 = Math.round(this.randomNormal(mean, stdDev));
      let count2 = Math.round(this.randomNormal(mean, stdDev));

      count1 = this.clamp(count1, MIN_COUNT, MAX_COUNT);
      count2 = this.clamp(count2, MIN_COUNT, MAX_COUNT);

      if (count1 === count2) {
        count1++;
        count1 = this.clamp(count1, MIN_COUNT, MAX_COUNT);
      }

      const leftCount = count1;
      const rightCount = count2;
      const correctSide = rightCount > leftCount ? "right" : "left";

      // Traps
      const appliedTraps: AppliedTrap[] = [];
      const trapSide = correctSide === "left" ? "right" : "left"; // Trap on side with fewer items

      const useFontSizeTrap = Math.random() < 0.5;
      const useFontWeightTrap = Math.random() < 0.5;
      const useGapProbabilityTrap = Math.random() < 0.33;

      const leftDensityParams: DensityParams = { areaMultiplier: 1.0, gapProbability: 0.4 };
      const rightDensityParams: DensityParams = { areaMultiplier: 1.0, gapProbability: 0.4 };

      if (useGapProbabilityTrap) {
        if (trapSide === "left") {
          leftDensityParams.gapProbability = 0.8;
        } else {
          rightDensityParams.gapProbability = 0.8;
        }
        appliedTraps.push({ type: "GapProbability", appliedTo: trapSide });
      }
      if (useFontSizeTrap) {
        appliedTraps.push({ type: "FontSize", appliedTo: trapSide });
      }
      if (useFontWeightTrap) {
        appliedTraps.push({ type: "FontWeight", appliedTo: trapSide });
      }

      const leftWords = this.generateWordDetails(leftCount, leftWord, trapSide === "left" && useFontSizeTrap, trapSide === "left" && useFontWeightTrap, leftDensityParams.gapProbability);
      const rightWords = this.generateWordDetails(rightCount, rightWord, trapSide === "right" && useFontSizeTrap, trapSide === "right" && useFontWeightTrap, rightDensityParams.gapProbability);

      problems.push({
        problemNumber: i + 1,
        leftWords,
        rightWords,
        leftWordText: leftWord,
        rightWordText: rightWord,
        density: { left: leftDensityParams, right: rightDensityParams },
        presentationTime: this.currentSettings!.presentationTime,
        inputTime: this.currentSettings!.inputTime,
        correctSide,
        appliedTraps,
      });
    }

    return problems;
  }

  private generateWordDetails(count: number, text: string, hasFontSizeTrap: boolean, hasFontWeightTrap: boolean, gapProbability: number): WordDetail[] {
    const details: WordDetail[] = [];
    let largeFontProb = 0.4;
    let heavyFontProb = 0.4;

    if (hasFontSizeTrap) largeFontProb += 0.1;
    if (hasFontWeightTrap) heavyFontProb += 0.1;

    for (let i = 0; i < count; i++) {
      // Gaps before
      for (let j = 0; j < 3; j++) {
        if (Math.random() < gapProbability) {
          details.push({
            text: "",
            size: 0,
            weight: 0,
            isGap: true,
            gapWidth: Number((1.0 + Math.random() * 1.0).toFixed(2)),
          });
        } else {
          break;
        }
      }

      let size = 0.8 + Math.random() * 0.4;
      if (Math.random() < largeFontProb) {
        size = 1.2 + Math.random() * 0.3;
      }

      let weight = 400;
      if (Math.random() < heavyFontProb) {
        weight = 700;
      }

      details.push({
        text,
        size: Number(size.toFixed(2)),
        weight,
        isGap: false,
        gapWidth: 0,
      });

      // Gaps after
      for (let j = 0; j < 3; j++) {
        if (Math.random() < gapProbability) {
          details.push({
            text: "",
            size: 0,
            weight: 0,
            isGap: true,
            gapWidth: Number((1.0 + Math.random() * 1.0).toFixed(2)),
          });
        } else {
          break;
        }
      }
    }
    return details;
  }

  private randomNormal(mean: number, stdDev: number): number {
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z0 * stdDev + mean;
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}

export const countComparisonEngine = new CountComparisonEngine();
