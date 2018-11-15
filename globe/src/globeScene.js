// TODO:
// Camera should deal with panning
// Refactor out animations - movementPath class
// Have scene call the above two
// animationhandle should be possible to cancel at any time based on event, easing function...
// Should be able to fast forward to last anim only.
// Documentation

// WILL BE IN CALLING CODE (lat/lons + ordering)
var LAT_LONS = {
	// Stockholm
	ST: {lat: 59.3, lon: 18.0},
	// Kuala Lumpur
	KL: {lat: 3.1, lon: 101.6},
	// Taipei
	TP: {lat: 25.1, lon: 121.5},
	// Shanghai
	SH: {lat: 31.2, lon: 121.4},
	// Mumbai
	MB: {lat: 19.0, lon: 72.8},
	// London
	LDN: {lat: 51.5, lon: -0.1},
	// Beijing
	BJ: {lat: 39.9, lon: 116.3},
	// Phan Rang
	PR: {lat: 11.5, lon: 108.9},
};

var citiesOrder = ["ST", "KL", "ST", "TP", "ST", "SH", "ST", "MB", "LDN", "ST", "BJ", "SH", "PR", "SH"];

import THREE from '../lib/THREE';
import {default as C} from './config';
import Camera from './camera';
import genTravelPathAnim from './locationPathGenerator';
import Globe from './globe';


//////////////////////////////////////////////
// GlobeScene class
var GlobeScene = function(){

	this.scene = initScene();
	this.initGlobe();
	this.frame = document.getElementById('globe-scene-container');
	this.camera = new Camera(this.frame.clientWidth/this.frame.clientHeight);
	this.renderer = initRenderer.call(this);
	this.frame.appendChild(this.renderer.domElement);

	this.controls = new THREE.OrbitControls( this.camera );
	// this.controls.autoRotate = true;
	this.controls.enabled = false;
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


GlobeScene.prototype.render = function() {
	this.renderer.render(this.scene, this.camera);
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



var once = false;
var cityIdx = 0;
GlobeScene.prototype.animate = function animate(ts){
 if(!once){
	 setInterval(() => {
		 var city = citiesOrder[cityIdx];
		 if(cityIdx !== 0){
			 var prevCity = citiesOrder[cityIdx-1];
			 genTravelPathAnim.call(
				 this,
				 LAT_LONS[prevCity].lat,
				 LAT_LONS[prevCity].lon,
				 LAT_LONS[city].lat,
				 LAT_LONS[city].lon,
				 );
		 }


		 cityIdx++;
		 cityIdx = citiesOrder[cityIdx] ? cityIdx : 0;
		 this.camera.genPanToLatLon(LAT_LONS[city].lat, LAT_LONS[city].lon)();
	 }, 4000);
	 once = true;
 }
 this.controls.update();
 requestAnimationFrame(animate.bind(this));
 this.renderer.render(this.scene, this.camera);
	// FOR NOW will be in render function, not animate...:
	// AND want it throttled with kept values to check against (only if clientWidth/Height changed...)
	var aspect = this.frame.clientWidth/this.frame.clientHeight;
	if(this.camera.aspect !== aspect){
		this.camera.aspect = this.frame.clientWidth/this.frame.clientHeight;
		this.camera.updateProjectionMatrix();
	}
	this.renderer.setSize(this.frame.clientWidth, this.frame.clientHeight);
};


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