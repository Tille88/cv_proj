/**
 * Helper object to keep animation logic largely hidden from the globe scene.
 * @param {number} dur Duration of full transition/animation
 * [if numerous animations of one type, split evenly between these]
 */

//  Constructor
var AnimationObject = function(dur){
	this.animCalcFuncs = {};
	this.startTime = null;
	this.dur = dur;
};

/**
 * Adds array of functions to be called to given key
 * @param {string} key
 * @param {Function[]} fnArr
 */
AnimationObject.prototype.addFuncs = function(key, fnArr){
	this.animCalcFuncs[key] = fnArr;
};

/**
 * Jumps to last frame of animations/transitions
 */
AnimationObject.prototype.jumpEnd = function(){
	for(var funcKey in this.animCalcFuncs){
		var funcArr = this.animCalcFuncs[funcKey];
		funcArr.forEach(fn => fn(1));
	}
	this.animCalcFuncs = {};
};

/**
 * Return timestep in the range [0, 1] for full duration of all animations/transitions
 * @param {number} ts timestamp
 */
AnimationObject.prototype.timeStepNorm = function(ts){
	if(!this.startTime) { this.startTime = ts; return 0; }
	return (ts - this.startTime) / this.dur;
};

/**
 * Calls each function in turn that are 'registered'
 * In case multiple ones, the normalized time step is remapped to [0, 1]-range
 * for that individual index
 * @param {number} ts timstamp
 */
AnimationObject.prototype.execute = function(ts){
	var allDone = true;
	for(var funcKey in this.animCalcFuncs){
		var timeStepNorm = this.timeStepNorm(ts);
		var funcArr = this.animCalcFuncs[funcKey];
		var funcIdx = Math.min(Math.floor(timeStepNorm*funcArr.length), funcArr.length-1);
		// Need to remap to [0,1]-range
		var animNotDone = funcArr[funcIdx]((funcArr.length*timeStepNorm - funcIdx));
		if(animNotDone) { allDone = false; }
	}
	// If all animations are done, no need to hold on to any references
	if(allDone) {
		this.animCalcFuncs = {};
		return true;
	}
}

export default AnimationObject;