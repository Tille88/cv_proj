// TODO: ALL DONE => EVENT...


var AnimationObject = function(dur){
	this.animCalcFuncs = {};
	this.startTime = null;
	this.dur = dur;
};

AnimationObject.prototype.addFuncs = function(key, fnArr){
	this.animCalcFuncs[key] = fnArr;
};

AnimationObject.prototype.jumpEnd = function(){
	for(var funcKey in this.animCalcFuncs){
		var funcArr = this.animCalcFuncs[funcKey];
		funcArr.forEach(fn => fn(1));
	}
	this.animCalcFuncs = {};
};

AnimationObject.prototype.timeStepNorm = function(ts){
	if(!this.startTime) { this.startTime = ts; return 0; }
	return (ts - this.startTime) / this.dur;
};

AnimationObject.prototype.execute = function(ts){
	var allDone = true;
	for(var funcKey in this.animCalcFuncs){
		var timeStepNorm = this.timeStepNorm(ts);
		var funcArr = this.animCalcFuncs[funcKey];
		var funcIdx = Math.min(Math.floor(timeStepNorm*funcArr.length), funcArr.length-1);
		// NEED TO REMAP IT SO EACH ONE GOES IN [0,1]-range
		var animNotDone = funcArr[funcIdx]((funcArr.length*timeStepNorm - funcIdx));
		if(animNotDone) { allDone = false; }
	}
	if(allDone) {
		this.animCalcFuncs = {};
		return true;
	}
}

export default AnimationObject;