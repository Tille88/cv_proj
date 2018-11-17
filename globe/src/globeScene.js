// TODO:
// 1) Refactor out animations - movementPath class, event all done? GlobeScene shouldnt really know about it's stuff...
// 2) Documentation + cleanup (magic numbers... colours, etc.)
// MERGING TIME

// 3) Make sure render only called more rarely if no animations, throttle and break out rescaling functions.
// 4) Want fewer lines if lower resolution, will look impossibly dense if not... subsample the linesgroup, or hide

import THREE from '../lib/THREE';
import {default as C} from './config';
import Camera from './camera';
import PathContainer from './pathContainer';
import Globe from './globe';


//////////////////////////////////////////////
// GlobeScene class
var GlobeScene = function(){
	this.scene = initScene();
	this.initGlobe();
	this.frame = document.getElementById('globe-scene-container');
	this.camera = new Camera(this.frame.clientWidth/this.frame.clientHeight);
	this.pathContainer = new PathContainer(this.scene);
	this.renderer = initRenderer.call(this);
	this.frame.appendChild(this.renderer.domElement);

	this.controls = new THREE.OrbitControls( this.camera );
	// this.controls.autoRotate = true;
	// this.controls.enabled = false;
	this.controls.update();

	if(C.DEBUG){
		// X=red, Y=green and Z=blue.
		var axesHelper = new THREE.AxesHelper(15);
		this.scene.add( axesHelper );
	}
};

GlobeScene.prototype.initGlobe = function() {
	var globe = new Globe();
	this.scene.add(globe.earthMesh);
	this.scene.add(globe.lineGroup);
};



// Static private
var initScene = function() {
	var scene = new THREE.Scene();
	var light = new THREE.AmbientLight(0x04040c);
	scene.add(light);
	return scene;
};


// Static private
var initRenderer = function(){
	var renderer = new THREE.WebGLRenderer({antialiasing : true});
	renderer.setSize(this.frame.clientWidth, this.frame.clientHeight);
	renderer.domElement.style.position = 'relative';
	renderer.setClearColor (0x000000, 1);
	return renderer;
};

GlobeScene.prototype.render = function render(ts) {
	var aspect = this.frame.clientWidth/this.frame.clientHeight;
	if(this.camera.aspect !== aspect){
		this.camera.aspect = this.frame.clientWidth/this.frame.clientHeight;
		this.camera.updateProjectionMatrix();
	}
	this.renderer.setSize(this.frame.clientWidth, this.frame.clientHeight);
	if(this.pathAnimFuncs){
		var allDone = true;
		for(var funcKey in this.pathAnimFuncs.fn){
// if(funcKey === "panDesc"){ debugger; }
			var timeStepNorm = this.pathAnimFuncs.timeStepNorm(ts);
			var funcArr = this.pathAnimFuncs.fn[funcKey];
			// REPLACE WITH CLAMP
			var funcIdx = Math.min(Math.floor(timeStepNorm*funcArr.length), funcArr.length-1);
			// var animNotDone = funcArr[funcIdx](timeStepNorm);
			// NEED TO REMAP IT SO EACH ONE GOES IN [0,1]-range
			var animNotDone = funcArr[funcIdx]((funcArr.length*timeStepNorm - funcIdx));
			if(animNotDone) { allDone = false; }
		}
		if(allDone) { this.pathAnimFuncs = null; }
	}
	this.controls.update();
	this.renderer.render(this.scene, this.camera);
	this.animationHandle = requestAnimationFrame(render.bind(this));
};

GlobeScene.prototype.startPathAnim = function(locArr, opts){
	var defaults = { dur: 3000, forward: true};
	opts = Object.assign({}, defaults, opts);
	var startTime;
	this.pathAnimFuncs = {
		fn: {}
	};
	if(opts.forward){
		this.pathAnimFuncs.fn.pan =  [this.camera.genPanToLatLon(locArr[locArr.length-1][1].lat, locArr[locArr.length-1][1].lon)];
		this.pathAnimFuncs.fn.path = locArr.map((el)=>{
			return this.pathContainer.genLineAnimation({fromLat: el[0].lat, fromLon: el[0].lon, toLat: el[1].lat, toLon: el[1].lon});
		});
	} else{
		this.pathAnimFuncs.fn.panDesc =  [this.camera.genPanToLatLon(locArr[locArr.length-1][0].lat, locArr[locArr.length-1][0].lon)];
		this.pathAnimFuncs.fn.pathDesc = locArr.map((el, idx )=>{
			return this.pathContainer.genLineAnimation({ idx });
		});
	}
	this.pathAnimFuncs.timeStepNorm = function(ts){
		if(!startTime) { startTime = ts; return 0; }
		return (ts - startTime) / opts.dur;
	};
 };

//  CALL WITH LAST VALUE OR FAST FORWARD? DONT WANT THEM TO END UP OUT OF SYNC...
 GlobeScene.prototype.cancelPathAnim = function(){
	// FAST FORWARD
	if(!this.pathAnimFuncs) { return false; }
	for(var funcKey in this.pathAnimFuncs.fn){
		var funcArr = this.pathAnimFuncs.fn[funcKey];
		funcArr.forEach(fn => fn(1));
	}
	this.pathAnimFuncs = null;
 }


export default GlobeScene;










////////////////////////////////////////////////////////////////////
// Throttle...
// var throttle = function(fn, interv){
// 	console.log("called throttle");
// 	var calledTs = -1;
// 	return function(){
// 		console.log("called throttled func");
// 		var newTs = Date.now();
// 		if(newTs - calledTs  > interv){
// 			calledTs = newTs;
// 			return fn.apply(this, arguments);
// 		}
// 	};
// };
// TBR
// var throttledFunc = throttle(()=> console.log("DONE"), 1000);
// setInterval(throttledFunc, 100);

// var once = function(fn, context) {
// 	var result;
// 	return function() {
// 			if (fn) {
// 					result = fn.apply(context || this, arguments);
// 					fn = null;
// 			}
// 			return result;
// 	};
// };

// var resize = function(){
// 	if(!oldWidth || !oldHeight){
// 		var oldWidth = this.frame.clientWidth;
// 		var oldHeight = this.frame.clientHeight;
// 	}
// 	// if(this.){

// 	// }
// };

// var updateAspect = function(){
// };

// var updateRenderSize = function(){
// };