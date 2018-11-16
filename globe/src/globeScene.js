// TODO:
// Camera should deal with panning
// Refactor out animations - movementPath class
// Have scene call the above two
// animationhandle should be possible to cancel at any time based on event, easing function...
// Should be able to fast forward to last anim only.
// CALL API FROM INDEX
// Documentation


import THREE from '../lib/THREE';
import {default as C} from './config';
import Camera from './camera';
// import genTravelPathAnim from './locationPathGenerator';
import PathContainer from './locationPathGenerator';
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
			var timeStepNorm = this.pathAnimFuncs.timeStepNorm(ts);
			var animNotDone = this.pathAnimFuncs.fn[funcKey](timeStepNorm);
			if(animNotDone) { allDone = false; }
		}
		if(allDone) { this.pathAnimFuncs = null; }
	}
	this.controls.update();
	this.renderer.render(this.scene, this.camera);
	this.animationHandle = requestAnimationFrame(render.bind(this));
};

GlobeScene.prototype.startPathAnim = function(locArr, dur){
	dur = dur || 1000;
	var startTime;
	this.pathAnimFuncs = {
		fn: {}
	};
	this.pathAnimFuncs.fn.pan =  this.camera.genPanToLatLon(locArr[0].lat, locArr[0].lon);
	this.pathAnimFuncs.timeStepNorm = function(ts){
		if(!startTime) { startTime = ts; }
		return (ts - startTime) / dur > 1 ? 1 : (ts - startTime) / dur;
	};
 };

//  GlobeScene.prototype.cancelPathAnim = function(){
// 	// cancelAnimationFrame(this.pathAnimHandle);
// 	// REMOVE FUNCTION POINTERS
// 	this.pathAnimHandle = null;
//  }


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