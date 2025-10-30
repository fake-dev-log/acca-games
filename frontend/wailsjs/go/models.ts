export namespace games {
	
	export class NBackGameState {
	    settings: types.NBackSettings;
	    shapeSequence: string[];
	    sessionId: number;
	
	    static createFrom(source: any = {}) {
	        return new NBackGameState(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.settings = this.convertValues(source["settings"], types.NBackSettings);
	        this.shapeSequence = source["shapeSequence"];
	        this.sessionId = source["sessionId"];
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

}

