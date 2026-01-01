export namespace cat_chaser {
	
	export class CatChaserGameState {
	    settings: types.CatChaserSettings;
	    problems: types.CatChaserProblem[];
	    id: number;
	
	    static createFrom(source: any = {}) {
	        return new CatChaserGameState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.settings = this.convertValues(source["settings"], types.CatChaserSettings);
	        this.problems = this.convertValues(source["problems"], types.CatChaserProblem);
	        this.id = source["id"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace nback {
	
	export class NBackGameState {
	    settings: types.NBackSettings;
	    shapeSequence: string[];
	    id: number;
	
	    static createFrom(source: any = {}) {
	        return new NBackGameState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.settings = this.convertValues(source["settings"], types.NBackSettings);
	        this.shapeSequence = source["shapeSequence"];
	        this.id = source["id"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace rps {
	
	export class Problem {
	    round: number;
	    questionNum: number;
	    problemCardHolder: string;
	    givenCard: string;
	    correctChoice: string;
	
	    static createFrom(source: any = {}) {
	        return new Problem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.round = source["round"];
	        this.questionNum = source["questionNum"];
	        this.problemCardHolder = source["problemCardHolder"];
	        this.givenCard = source["givenCard"];
	        this.correctChoice = source["correctChoice"];
	    }
	}
	export class GameState {
	    settings: types.RpsSettings;
	    problems: Problem[];
	    id: number;
	    gameCode: string;
	
	    static createFrom(source: any = {}) {
	        return new GameState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.settings = this.convertValues(source["settings"], types.RpsSettings);
	        this.problems = this.convertValues(source["problems"], Problem);
	        this.id = source["id"];
	        this.gameCode = source["gameCode"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace shape_rotation {
	
	export class ShapeRotationProblemWithFinalShape {
	    ID: number;
	    Round: number;
	    InitialShape: string;
	    FinalShape: string;
	    InitialGridPath?: string;
	    FinalGridPath?: string;
	    InitialShapeCenterX: number;
	    InitialShapeCenterY: number;
	    FinalShapeCenterX: number;
	    FinalShapeCenterY: number;
	    MinMoves: number;
	    Solution: string[];
	
	    static createFrom(source: any = {}) {
	        return new ShapeRotationProblemWithFinalShape(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.ID = source["ID"];
	        this.Round = source["Round"];
	        this.InitialShape = source["InitialShape"];
	        this.FinalShape = source["FinalShape"];
	        this.InitialGridPath = source["InitialGridPath"];
	        this.FinalGridPath = source["FinalGridPath"];
	        this.InitialShapeCenterX = source["InitialShapeCenterX"];
	        this.InitialShapeCenterY = source["InitialShapeCenterY"];
	        this.FinalShapeCenterX = source["FinalShapeCenterX"];
	        this.FinalShapeCenterY = source["FinalShapeCenterY"];
	        this.MinMoves = source["MinMoves"];
	        this.Solution = source["Solution"];
	    }
	}

}

export namespace types {
	
	export class AppliedTrap {
	    type: string;
	    appliedTo: string;
	
	    static createFrom(source: any = {}) {
	        return new AppliedTrap(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.appliedTo = source["appliedTo"];
	    }
	}
	export class CatChaserProblem {
	    round: number;
	    micePositions: number[];
	    catPositions: number[];
	    redCatIndex: number;
	    blueCatIndex: number;
	
	    static createFrom(source: any = {}) {
	        return new CatChaserProblem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.round = source["round"];
	        this.micePositions = source["micePositions"];
	        this.catPositions = source["catPositions"];
	        this.redCatIndex = source["redCatIndex"];
	        this.blueCatIndex = source["blueCatIndex"];
	    }
	}
	export class CatChaserResult {
	    sessionId: number;
	    round: number;
	    targetColor: string;
	    playerChoice: string;
	    confidence: number;
	    correctChoice: string;
	    isCorrect: boolean;
	    score: number;
	    responseTimeMs: number;
	
	    static createFrom(source: any = {}) {
	        return new CatChaserResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessionId = source["sessionId"];
	        this.round = source["round"];
	        this.targetColor = source["targetColor"];
	        this.playerChoice = source["playerChoice"];
	        this.confidence = source["confidence"];
	        this.correctChoice = source["correctChoice"];
	        this.isCorrect = source["isCorrect"];
	        this.score = source["score"];
	        this.responseTimeMs = source["responseTimeMs"];
	    }
	}
	export class CatChaserRoundStats {
	    round: number;
	    totalQuestions: number;
	    totalCorrect: number;
	    totalScore: number;
	    accuracy: number;
	    averageResponseTimeMs: number;
	
	    static createFrom(source: any = {}) {
	        return new CatChaserRoundStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.round = source["round"];
	        this.totalQuestions = source["totalQuestions"];
	        this.totalCorrect = source["totalCorrect"];
	        this.totalScore = source["totalScore"];
	        this.accuracy = source["accuracy"];
	        this.averageResponseTimeMs = source["averageResponseTimeMs"];
	    }
	}
	export class CatChaserSessionStats {
	    sessionId: number;
	    totalQuestions: number;
	    totalCorrect: number;
	    totalScore: number;
	    overallAccuracy: number;
	    averageResponseTimeMs: number;
	    roundStats: CatChaserRoundStats[];
	
	    static createFrom(source: any = {}) {
	        return new CatChaserSessionStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessionId = source["sessionId"];
	        this.totalQuestions = source["totalQuestions"];
	        this.totalCorrect = source["totalCorrect"];
	        this.totalScore = source["totalScore"];
	        this.overallAccuracy = source["overallAccuracy"];
	        this.averageResponseTimeMs = source["averageResponseTimeMs"];
	        this.roundStats = this.convertValues(source["roundStats"], CatChaserRoundStats);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CatChaserSessionWithResults {
	    id: number;
	    gameCode: string;
	    playDatetime: string;
	    settings: string;
	    results: CatChaserResult[];
	
	    static createFrom(source: any = {}) {
	        return new CatChaserSessionWithResults(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.gameCode = source["gameCode"];
	        this.playDatetime = source["playDatetime"];
	        this.settings = source["settings"];
	        this.results = this.convertValues(source["results"], CatChaserResult);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CatChaserSettings {
	    numTrials: number;
	    difficulty: string;
	    showTime: number;
	    responseTimeLimit: number;
	    isRealMode: boolean;
	
	    static createFrom(source: any = {}) {
	        return new CatChaserSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.numTrials = source["numTrials"];
	        this.difficulty = source["difficulty"];
	        this.showTime = source["showTime"];
	        this.responseTimeLimit = source["responseTimeLimit"];
	        this.isRealMode = source["isRealMode"];
	    }
	}
	export class DensityParams {
	    areaMultiplier: number;
	    gapProbability: number;
	
	    static createFrom(source: any = {}) {
	        return new DensityParams(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.areaMultiplier = source["areaMultiplier"];
	        this.gapProbability = source["gapProbability"];
	    }
	}
	export class DensityInfo {
	    left: DensityParams;
	    right: DensityParams;
	
	    static createFrom(source: any = {}) {
	        return new DensityInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.left = this.convertValues(source["left"], DensityParams);
	        this.right = this.convertValues(source["right"], DensityParams);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class WordDetail {
	    text: string;
	    size: number;
	    weight: number;
	    isGap: boolean;
	    gapWidth: number;
	
	    static createFrom(source: any = {}) {
	        return new WordDetail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.text = source["text"];
	        this.size = source["size"];
	        this.weight = source["weight"];
	        this.isGap = source["isGap"];
	        this.gapWidth = source["gapWidth"];
	    }
	}
	export class CountComparisonProblem {
	    problemNumber: number;
	    leftWords: WordDetail[];
	    rightWords: WordDetail[];
	    leftWordText: string;
	    rightWordText: string;
	    density: DensityInfo;
	    presentationTime: number;
	    inputTime: number;
	    correctSide: string;
	    appliedTraps: AppliedTrap[];
	
	    static createFrom(source: any = {}) {
	        return new CountComparisonProblem(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.problemNumber = source["problemNumber"];
	        this.leftWords = this.convertValues(source["leftWords"], WordDetail);
	        this.rightWords = this.convertValues(source["rightWords"], WordDetail);
	        this.leftWordText = source["leftWordText"];
	        this.rightWordText = source["rightWordText"];
	        this.density = this.convertValues(source["density"], DensityInfo);
	        this.presentationTime = source["presentationTime"];
	        this.inputTime = source["inputTime"];
	        this.correctSide = source["correctSide"];
	        this.appliedTraps = this.convertValues(source["appliedTraps"], AppliedTrap);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CountComparisonResult {
	    id: number;
	    sessionId: number;
	    problemNumber: number;
	    isCorrect: boolean;
	    responseTimeMs: number;
	    playerChoice: string;
	    correctChoice: string;
	    leftWord: string;
	    rightWord: string;
	    leftWordCount: number;
	    rightWordCount: number;
	    appliedTraps: string;
	
	    static createFrom(source: any = {}) {
	        return new CountComparisonResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.sessionId = source["sessionId"];
	        this.problemNumber = source["problemNumber"];
	        this.isCorrect = source["isCorrect"];
	        this.responseTimeMs = source["responseTimeMs"];
	        this.playerChoice = source["playerChoice"];
	        this.correctChoice = source["correctChoice"];
	        this.leftWord = source["leftWord"];
	        this.rightWord = source["rightWord"];
	        this.leftWordCount = source["leftWordCount"];
	        this.rightWordCount = source["rightWordCount"];
	        this.appliedTraps = source["appliedTraps"];
	    }
	}
	export class TrapStat {
	    trapType: string;
	    totalQuestions: number;
	    totalCorrect: number;
	    accuracy: number;
	    averageResponseTime: number;
	
	    static createFrom(source: any = {}) {
	        return new TrapStat(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.trapType = source["trapType"];
	        this.totalQuestions = source["totalQuestions"];
	        this.totalCorrect = source["totalCorrect"];
	        this.accuracy = source["accuracy"];
	        this.averageResponseTime = source["averageResponseTime"];
	    }
	}
	export class CountComparisonSessionStats {
	    sessionId: number;
	    totalQuestions: number;
	    totalCorrect: number;
	    overallAccuracy: number;
	    averageResponseTimeMs: number;
	    trapStats: TrapStat[];
	
	    static createFrom(source: any = {}) {
	        return new CountComparisonSessionStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessionId = source["sessionId"];
	        this.totalQuestions = source["totalQuestions"];
	        this.totalCorrect = source["totalCorrect"];
	        this.overallAccuracy = source["overallAccuracy"];
	        this.averageResponseTimeMs = source["averageResponseTimeMs"];
	        this.trapStats = this.convertValues(source["trapStats"], TrapStat);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CountComparisonSessionWithResults {
	    id: number;
	    gameCode: string;
	    playDatetime: string;
	    settings: string;
	    results: CountComparisonResult[];
	
	    static createFrom(source: any = {}) {
	        return new CountComparisonSessionWithResults(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.gameCode = source["gameCode"];
	        this.playDatetime = source["playDatetime"];
	        this.settings = source["settings"];
	        this.results = this.convertValues(source["results"], CountComparisonResult);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class CountComparisonSettings {
	    numProblems: number;
	    presentationTime: number;
	    inputTime: number;
	    isRealMode: boolean;
	
	    static createFrom(source: any = {}) {
	        return new CountComparisonSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.numProblems = source["numProblems"];
	        this.presentationTime = source["presentationTime"];
	        this.inputTime = source["inputTime"];
	        this.isRealMode = source["isRealMode"];
	    }
	}
	export class CountComparisonSubmission {
	    problemNumber: number;
	    playerChoice: string;
	    responseTimeMs: number;
	
	    static createFrom(source: any = {}) {
	        return new CountComparisonSubmission(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.problemNumber = source["problemNumber"];
	        this.playerChoice = source["playerChoice"];
	        this.responseTimeMs = source["responseTimeMs"];
	    }
	}
	
	
	export class NBackLevelStat {
	    nBackLevel: number;
	    totalQuestions: number;
	    totalCorrect: number;
	    accuracy: number;
	    averageResponseTimeMs: number;
	
	    static createFrom(source: any = {}) {
	        return new NBackLevelStat(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.nBackLevel = source["nBackLevel"];
	        this.totalQuestions = source["totalQuestions"];
	        this.totalCorrect = source["totalCorrect"];
	        this.accuracy = source["accuracy"];
	        this.averageResponseTimeMs = source["averageResponseTimeMs"];
	    }
	}
	export class NBackResult {
	    id: number;
	    sessionId: number;
	    round: number;
	    questionNum: number;
	    isCorrect: boolean;
	    responseTimeMs: number;
	    playerChoice: string;
	    correctChoice: string;
	
	    static createFrom(source: any = {}) {
	        return new NBackResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.sessionId = source["sessionId"];
	        this.round = source["round"];
	        this.questionNum = source["questionNum"];
	        this.isCorrect = source["isCorrect"];
	        this.responseTimeMs = source["responseTimeMs"];
	        this.playerChoice = source["playerChoice"];
	        this.correctChoice = source["correctChoice"];
	    }
	}
	export class NBackRoundStats {
	    round: number;
	    totalQuestions: number;
	    totalCorrect: number;
	    accuracy: number;
	    averageResponseTimeMs: number;
	    nBackLevelStats?: NBackLevelStat[];
	
	    static createFrom(source: any = {}) {
	        return new NBackRoundStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.round = source["round"];
	        this.totalQuestions = source["totalQuestions"];
	        this.totalCorrect = source["totalCorrect"];
	        this.accuracy = source["accuracy"];
	        this.averageResponseTimeMs = source["averageResponseTimeMs"];
	        this.nBackLevelStats = this.convertValues(source["nBackLevelStats"], NBackLevelStat);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class NBackSessionStats {
	    sessionId: number;
	    totalQuestions: number;
	    totalCorrect: number;
	    overallAccuracy: number;
	    averageResponseTimeMs: number;
	    roundStats: NBackRoundStats[];
	
	    static createFrom(source: any = {}) {
	        return new NBackSessionStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessionId = source["sessionId"];
	        this.totalQuestions = source["totalQuestions"];
	        this.totalCorrect = source["totalCorrect"];
	        this.overallAccuracy = source["overallAccuracy"];
	        this.averageResponseTimeMs = source["averageResponseTimeMs"];
	        this.roundStats = this.convertValues(source["roundStats"], NBackRoundStats);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class NBackSessionWithResults {
	    id: number;
	    gameCode: string;
	    playDatetime: string;
	    settings: string;
	    results: NBackResult[];
	
	    static createFrom(source: any = {}) {
	        return new NBackSessionWithResults(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.gameCode = source["gameCode"];
	        this.playDatetime = source["playDatetime"];
	        this.settings = source["settings"];
	        this.results = this.convertValues(source["results"], NBackResult);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class NBackSettings {
	    numTrials: number;
	    presentationTime: number;
	    nBackLevel: number;
	    shapeGroup: string;
	    isRealMode: boolean;
	
	    static createFrom(source: any = {}) {
	        return new NBackSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.numTrials = source["numTrials"];
	        this.presentationTime = source["presentationTime"];
	        this.nBackLevel = source["nBackLevel"];
	        this.shapeGroup = source["shapeGroup"];
	        this.isRealMode = source["isRealMode"];
	    }
	}
	export class NumberPressingConditionStat {
	    conditionType: string;
	    totalQuestions: number;
	    totalCorrect: number;
	    accuracy: number;
	    averageTimeTakenSec: number;
	
	    static createFrom(source: any = {}) {
	        return new NumberPressingConditionStat(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.conditionType = source["conditionType"];
	        this.totalQuestions = source["totalQuestions"];
	        this.totalCorrect = source["totalCorrect"];
	        this.accuracy = source["accuracy"];
	        this.averageTimeTakenSec = source["averageTimeTakenSec"];
	    }
	}
	export class NumberPressingProblemR2 {
	    doubleClick: number[];
	    skip: number[];
	
	    static createFrom(source: any = {}) {
	        return new NumberPressingProblemR2(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.doubleClick = source["doubleClick"];
	        this.skip = source["skip"];
	    }
	}
	export class NumberPressingProblemR1 {
	    targetNumber: number;
	
	    static createFrom(source: any = {}) {
	        return new NumberPressingProblemR1(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.targetNumber = source["targetNumber"];
	    }
	}
	export class NumberPressingSetup {
	    isRealMode: boolean;
	    rounds: number[];
	    problemsPerRound: number;
	    timeLimitR1: number;
	    timeLimitR2: number;
	
	    static createFrom(source: any = {}) {
	        return new NumberPressingSetup(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.isRealMode = source["isRealMode"];
	        this.rounds = source["rounds"];
	        this.problemsPerRound = source["problemsPerRound"];
	        this.timeLimitR1 = source["timeLimitR1"];
	        this.timeLimitR2 = source["timeLimitR2"];
	    }
	}
	export class NumberPressingGameState {
	    setup: NumberPressingSetup;
	    problemsR1: NumberPressingProblemR1[];
	    problemsR2: NumberPressingProblemR2[];
	    id: number;
	
	    static createFrom(source: any = {}) {
	        return new NumberPressingGameState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.setup = this.convertValues(source["setup"], NumberPressingSetup);
	        this.problemsR1 = this.convertValues(source["problemsR1"], NumberPressingProblemR1);
	        this.problemsR2 = this.convertValues(source["problemsR2"], NumberPressingProblemR2);
	        this.id = source["id"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	
	export class NumberPressingResultR1 {
	    id: number;
	    sessionID: number;
	    problem: NumberPressingProblemR1;
	    timeTaken: number;
	    isCorrect: boolean;
	
	    static createFrom(source: any = {}) {
	        return new NumberPressingResultR1(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.sessionID = source["sessionID"];
	        this.problem = this.convertValues(source["problem"], NumberPressingProblemR1);
	        this.timeTaken = source["timeTaken"];
	        this.isCorrect = source["isCorrect"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class NumberPressingResultR2 {
	    id: number;
	    sessionID: number;
	    problem: NumberPressingProblemR2;
	    playerClicks: number[];
	    correctClicks: number[];
	    timeTaken: number;
	    isCorrect: boolean;
	
	    static createFrom(source: any = {}) {
	        return new NumberPressingResultR2(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.sessionID = source["sessionID"];
	        this.problem = this.convertValues(source["problem"], NumberPressingProblemR2);
	        this.playerClicks = source["playerClicks"];
	        this.correctClicks = source["correctClicks"];
	        this.timeTaken = source["timeTaken"];
	        this.isCorrect = source["isCorrect"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class NumberPressingResultsBundle {
	    resultsR1: NumberPressingResultR1[];
	    resultsR2: NumberPressingResultR2[];
	
	    static createFrom(source: any = {}) {
	        return new NumberPressingResultsBundle(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.resultsR1 = this.convertValues(source["resultsR1"], NumberPressingResultR1);
	        this.resultsR2 = this.convertValues(source["resultsR2"], NumberPressingResultR2);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class NumberPressingRoundStats {
	    round: number;
	    totalQuestions: number;
	    totalCorrect: number;
	    accuracy: number;
	    averageTimeTakenSec: number;
	    conditionStats?: NumberPressingConditionStat[];
	
	    static createFrom(source: any = {}) {
	        return new NumberPressingRoundStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.round = source["round"];
	        this.totalQuestions = source["totalQuestions"];
	        this.totalCorrect = source["totalCorrect"];
	        this.accuracy = source["accuracy"];
	        this.averageTimeTakenSec = source["averageTimeTakenSec"];
	        this.conditionStats = this.convertValues(source["conditionStats"], NumberPressingConditionStat);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class NumberPressingSessionStats {
	    sessionId: number;
	    totalQuestions: number;
	    totalCorrect: number;
	    overallAccuracy: number;
	    averageTimeTakenSec: number;
	    roundStats: NumberPressingRoundStats[];
	
	    static createFrom(source: any = {}) {
	        return new NumberPressingSessionStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessionId = source["sessionId"];
	        this.totalQuestions = source["totalQuestions"];
	        this.totalCorrect = source["totalCorrect"];
	        this.overallAccuracy = source["overallAccuracy"];
	        this.averageTimeTakenSec = source["averageTimeTakenSec"];
	        this.roundStats = this.convertValues(source["roundStats"], NumberPressingRoundStats);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class NumberPressingSessionWithResults {
	    id: number;
	    gameCode: string;
	    playDatetime: string;
	    settings: string;
	    results: NumberPressingResultsBundle;
	
	    static createFrom(source: any = {}) {
	        return new NumberPressingSessionWithResults(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.gameCode = source["gameCode"];
	        this.playDatetime = source["playDatetime"];
	        this.settings = source["settings"];
	        this.results = this.convertValues(source["results"], NumberPressingResultsBundle);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class PaginatedCatChaserSessions {
	    sessions: CatChaserSessionWithResults[];
	    totalCount: number;
	
	    static createFrom(source: any = {}) {
	        return new PaginatedCatChaserSessions(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessions = this.convertValues(source["sessions"], CatChaserSessionWithResults);
	        this.totalCount = source["totalCount"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PaginatedCountComparisonSessions {
	    sessions: CountComparisonSessionWithResults[];
	    totalCount: number;
	
	    static createFrom(source: any = {}) {
	        return new PaginatedCountComparisonSessions(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessions = this.convertValues(source["sessions"], CountComparisonSessionWithResults);
	        this.totalCount = source["totalCount"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PaginatedNBackSessions {
	    sessions: NBackSessionWithResults[];
	    totalCount: number;
	
	    static createFrom(source: any = {}) {
	        return new PaginatedNBackSessions(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessions = this.convertValues(source["sessions"], NBackSessionWithResults);
	        this.totalCount = source["totalCount"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PaginatedNumberPressingSessions {
	    sessions: NumberPressingSessionWithResults[];
	    totalCount: number;
	
	    static createFrom(source: any = {}) {
	        return new PaginatedNumberPressingSessions(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessions = this.convertValues(source["sessions"], NumberPressingSessionWithResults);
	        this.totalCount = source["totalCount"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class RpsResult {
	    id: number;
	    sessionId: number;
	    round: number;
	    questionNum: number;
	    problemCardHolder: string;
	    givenCard: string;
	    isCorrect: boolean;
	    responseTimeMs: number;
	    playerChoice: string;
	    correctChoice: string;
	
	    static createFrom(source: any = {}) {
	        return new RpsResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.sessionId = source["sessionId"];
	        this.round = source["round"];
	        this.questionNum = source["questionNum"];
	        this.problemCardHolder = source["problemCardHolder"];
	        this.givenCard = source["givenCard"];
	        this.isCorrect = source["isCorrect"];
	        this.responseTimeMs = source["responseTimeMs"];
	        this.playerChoice = source["playerChoice"];
	        this.correctChoice = source["correctChoice"];
	    }
	}
	export class RpsSessionWithResults {
	    id: number;
	    gameCode: string;
	    playDatetime: string;
	    settings: string;
	    results: RpsResult[];
	
	    static createFrom(source: any = {}) {
	        return new RpsSessionWithResults(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.gameCode = source["gameCode"];
	        this.playDatetime = source["playDatetime"];
	        this.settings = source["settings"];
	        this.results = this.convertValues(source["results"], RpsResult);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PaginatedRpsSessions {
	    sessions: RpsSessionWithResults[];
	    totalCount: number;
	
	    static createFrom(source: any = {}) {
	        return new PaginatedRpsSessions(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessions = this.convertValues(source["sessions"], RpsSessionWithResults);
	        this.totalCount = source["totalCount"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class ShapeRotationResult {
	    id: number;
	    sessionId: number;
	    problemId: number;
	    userSolution: string[];
	    isCorrect: boolean;
	    solveTime: number;
	    clickCount: number;
	
	    static createFrom(source: any = {}) {
	        return new ShapeRotationResult(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.sessionId = source["sessionId"];
	        this.problemId = source["problemId"];
	        this.userSolution = source["userSolution"];
	        this.isCorrect = source["isCorrect"];
	        this.solveTime = source["solveTime"];
	        this.clickCount = source["clickCount"];
	    }
	}
	export class ShapeRotationSessionWithResults {
	    id: number;
	    gameCode: string;
	    playDatetime: string;
	    settings: string;
	    results: ShapeRotationResult[];
	
	    static createFrom(source: any = {}) {
	        return new ShapeRotationSessionWithResults(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.gameCode = source["gameCode"];
	        this.playDatetime = source["playDatetime"];
	        this.settings = source["settings"];
	        this.results = this.convertValues(source["results"], ShapeRotationResult);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class PaginatedShapeRotationSessions {
	    sessions: ShapeRotationSessionWithResults[];
	    totalCount: number;
	
	    static createFrom(source: any = {}) {
	        return new PaginatedShapeRotationSessions(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessions = this.convertValues(source["sessions"], ShapeRotationSessionWithResults);
	        this.totalCount = source["totalCount"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class RpsProblemCardHolderStat {
	    problemCardHolder: string;
	    totalQuestions: number;
	    totalCorrect: number;
	    accuracy: number;
	    averageResponseTimeMs: number;
	
	    static createFrom(source: any = {}) {
	        return new RpsProblemCardHolderStat(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.problemCardHolder = source["problemCardHolder"];
	        this.totalQuestions = source["totalQuestions"];
	        this.totalCorrect = source["totalCorrect"];
	        this.accuracy = source["accuracy"];
	        this.averageResponseTimeMs = source["averageResponseTimeMs"];
	    }
	}
	
	export class RpsRoundStats {
	    round: number;
	    totalQuestions: number;
	    totalCorrect: number;
	    accuracy: number;
	    averageResponseTimeMs: number;
	    problemCardHolderStats: RpsProblemCardHolderStat[];
	
	    static createFrom(source: any = {}) {
	        return new RpsRoundStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.round = source["round"];
	        this.totalQuestions = source["totalQuestions"];
	        this.totalCorrect = source["totalCorrect"];
	        this.accuracy = source["accuracy"];
	        this.averageResponseTimeMs = source["averageResponseTimeMs"];
	        this.problemCardHolderStats = this.convertValues(source["problemCardHolderStats"], RpsProblemCardHolderStat);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	export class RpsSessionStats {
	    sessionId: number;
	    totalQuestions: number;
	    totalCorrect: number;
	    overallAccuracy: number;
	    averageResponseTimeMs: number;
	    roundStats: RpsRoundStats[];
	
	    static createFrom(source: any = {}) {
	        return new RpsSessionStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessionId = source["sessionId"];
	        this.totalQuestions = source["totalQuestions"];
	        this.totalCorrect = source["totalCorrect"];
	        this.overallAccuracy = source["overallAccuracy"];
	        this.averageResponseTimeMs = source["averageResponseTimeMs"];
	        this.roundStats = this.convertValues(source["roundStats"], RpsRoundStats);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class RpsSettings {
	    rounds: number[];
	    questionsPerRound: number;
	    timeLimitMs: number;
	    isRealMode: boolean;
	
	    static createFrom(source: any = {}) {
	        return new RpsSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.rounds = source["rounds"];
	        this.questionsPerRound = source["questionsPerRound"];
	        this.timeLimitMs = source["timeLimitMs"];
	        this.isRealMode = source["isRealMode"];
	    }
	}
	
	export class ShapeRotationRoundStats {
	    round: number;
	    totalQuestions: number;
	    totalCorrect: number;
	    accuracy: number;
	    averageSolveTimeMs: number;
	    averageClickCount: number;
	
	    static createFrom(source: any = {}) {
	        return new ShapeRotationRoundStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.round = source["round"];
	        this.totalQuestions = source["totalQuestions"];
	        this.totalCorrect = source["totalCorrect"];
	        this.accuracy = source["accuracy"];
	        this.averageSolveTimeMs = source["averageSolveTimeMs"];
	        this.averageClickCount = source["averageClickCount"];
	    }
	}
	export class ShapeRotationSessionStats {
	    sessionId: number;
	    totalQuestions: number;
	    totalCorrect: number;
	    overallAccuracy: number;
	    averageSolveTimeMs: number;
	    averageClickCount: number;
	    roundStats: ShapeRotationRoundStats[];
	
	    static createFrom(source: any = {}) {
	        return new ShapeRotationSessionStats(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.sessionId = source["sessionId"];
	        this.totalQuestions = source["totalQuestions"];
	        this.totalCorrect = source["totalCorrect"];
	        this.overallAccuracy = source["overallAccuracy"];
	        this.averageSolveTimeMs = source["averageSolveTimeMs"];
	        this.averageClickCount = source["averageClickCount"];
	        this.roundStats = this.convertValues(source["roundStats"], ShapeRotationRoundStats);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class ShapeRotationSettings {
	    numProblems: number;
	    timeLimit: number;
	    round: number;
	    isRealMode: boolean;
	
	    static createFrom(source: any = {}) {
	        return new ShapeRotationSettings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.numProblems = source["numProblems"];
	        this.timeLimit = source["timeLimit"];
	        this.round = source["round"];
	        this.isRealMode = source["isRealMode"];
	    }
	}
	

}

