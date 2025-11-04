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

export namespace types {
	
	export class GameSession {
	    id: number;
	    gameCode: string;
	    playDatetime: string;
	    settings: string;
	
	    static createFrom(source: any = {}) {
	        return new GameSession(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.gameCode = source["gameCode"];
	        this.playDatetime = source["playDatetime"];
	        this.settings = source["settings"];
	    }
	}
	export class NBackRecord {
	    id: number;
	    sessionId: number;
	    round: number;
	    questionNum: number;
	    isCorrect: boolean;
	    responseTimeMs: number;
	    playerChoice: string;
	    correctChoice: string;
	
	    static createFrom(source: any = {}) {
	        return new NBackRecord(source);
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
	export class NBackResult {
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
	        this.sessionId = source["sessionId"];
	        this.round = source["round"];
	        this.questionNum = source["questionNum"];
	        this.isCorrect = source["isCorrect"];
	        this.responseTimeMs = source["responseTimeMs"];
	        this.playerChoice = source["playerChoice"];
	        this.correctChoice = source["correctChoice"];
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
	    sessionID: number;
	    problem: NumberPressingProblemR1;
	    timeTaken: number;
	    isCorrect: boolean;
	
	    static createFrom(source: any = {}) {
	        return new NumberPressingResultR1(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
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

}

