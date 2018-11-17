// TODO:
// - May want the animation object to emit events instead, but returning true when all done seems to work well enough for now.
// - Make sure render only called more rarely if no animations, throttle and break out rescaling functions.
// - Want fewer lines if lower resolution, will look impossibly dense if not... subsample the linesgroup, or hide

// Dependencies
import THREE from '../lib/THREE';
import {default as C} from './config';
import Camera from './camera';
import PathContainer from './pathContainer';
import Globe from './globe';
import AnimationObject from './animationObj';


//////////////////////////////////////////////
// GlobeScene class
/**
 * GlobeScene
 * Sets up all elements needed for scene and controls the render loop
 * including animations on outside pan requests
 * @class
 */

//  Constructor
var GlobeScene = function(){
	this.scene = initScene();
	initGlobe.call(this);
	this.frame = document.getElementById('globe-scene-container');
	this.camera = new Camera(this.frame.clientWidth/this.frame.clientHeight);
	this.pathContainer = new PathContainer(this.scene);
	// Create DOM connection
	this.renderer = initRenderer.call(this);
	this.frame.appendChild(this.renderer.domElement);

	this.controls = new THREE.OrbitControls( this.camera );
	// Possibly useful settings
	// this.controls.autoRotate = true;
	// this.controls.enabled = false;
	this.controls.update();

	if(C.DEBUG){
		// X=red, Y=green and Z=blue.
		var axesHelper = new THREE.AxesHelper(15);
		this.scene.add( axesHelper );
	}
};

// Static private, not returning anything since after initializations
// there is no need for update
// (May change if TODO - update line count requires access to globe object)
var initGlobe = function() {
	var globe = new Globe();
	this.scene.add(globe.earthMesh);
	this.scene.add(globe.lineGroup);
};

// Static private
// Factory function returns new scene
var initScene = function() {
	var scene = new THREE.Scene();
	var light = new THREE.AmbientLight(0x04040c);
	scene.add(light);
	return scene;
};


// Static private
// Factory function returns new renderer and sets basic settings
var initRenderer = function(){
	var renderer = new THREE.WebGLRenderer({antialiasing : true});
	renderer.setSize(this.frame.clientWidth, this.frame.clientHeight);
	renderer.domElement.style.position = 'relative';
	renderer.setClearColor (0x000000, 1);
	return renderer;
};

/**
 * Starts render loop
 * @param {number} ts Timestamp that the requestAnimationFrame passes in
 * @instance
 */
GlobeScene.prototype.render = function render(ts) {
	// Changes aspect ratio and size of renderer if needed (e.g. if resized)
	// TODO: refactor out, and call on throttle if keeping at rate of animationframe
	var aspect = this.frame.clientWidth/this.frame.clientHeight;
	if(this.camera.aspect !== aspect){
		this.camera.aspect = this.frame.clientWidth/this.frame.clientHeight;
		this.camera.updateProjectionMatrix();
	}
	this.renderer.setSize(this.frame.clientWidth, this.frame.clientHeight);
	// Call animation update functions
	if(this.pathAnimFuncs){
		var allDone = this.pathAnimFuncs.execute(ts);
		if(allDone) { this.pathAnimFuncs = null; }
	}
	this.controls.update();
	// Render and request new animation frame
	this.renderer.render(this.scene, this.camera);
	this.animationHandle = requestAnimationFrame(render.bind(this));
};

/**
 * Starts a path animation including panning
 * If multiple locations, pans to last location only, while paths are evenly spaced during pan
 * @param {Array} locArr array of locations, see commander object for example of calling code
 * @param {object} opts Options, including duration of full animation and if reversed or not
 * @instance
 */
GlobeScene.prototype.startPathAnim = function(locArr, opts){
	var defaults = { dur: 3000, forward: true};
	opts = Object.assign({}, defaults, opts);
	// At each request newing up a new animation object to reduce risk of memory leaks
	this.pathAnimFuncs = new AnimationObject(opts.dur);
	var panFuncArr, pathFuncArr;
	// Generate functions for updating draw location of objects
	// Differences in calling depending if in reverse or forward mode
	if(opts.forward){
		panFuncArr = [this.camera.genPanToLatLon(locArr[locArr.length-1][1].lat, locArr[locArr.length-1][1].lon)];
		pathFuncArr = locArr.map((el)=>{
			return this.pathContainer.genLineAnimation({fromLat: el[0].lat, fromLon: el[0].lon, toLat: el[1].lat, toLon: el[1].lon});
		});
	} else{
		panFuncArr = [this.camera.genPanToLatLon(locArr[locArr.length-1][0].lat, locArr[locArr.length-1][0].lon)];
		pathFuncArr = locArr.map((el, idx )=>{
			return this.pathContainer.genLineAnimation({ idx });
		});
	}
	// Add in these to the created animationObject
	this.pathAnimFuncs.addFuncs('pan', panFuncArr);
	this.pathAnimFuncs.addFuncs('path', pathFuncArr);
 };

/**
 * Stops animation and jumps to "last frame"
 * @returns {boolean} Wheather anything has been cancelled
 * @instance
 */
 GlobeScene.prototype.cancelPathAnim = function(){
	if(!this.pathAnimFuncs) { return false; }
	this.pathAnimFuncs.jumpEnd();
	this.pathAnimFuncs = null;
	return true;
 }


export default GlobeScene;

























////////////////////////////////////////////////////////////////////
// For when getting to the TODOS
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