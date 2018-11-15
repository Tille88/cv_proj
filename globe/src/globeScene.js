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
import { radians, lerp, latLonToSphere, arcLen } from './globeHelpers';
import {default as C} from './config';
import Camera from './camera';
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
		 genPanToLatLon.call(this, LAT_LONS[city].lat, LAT_LONS[city].lon)();
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

// var resize = function(){
// };

// var updateAspect = function(){
// };

// var updateRenderSize = function(){
// };

//////////////////////////////////////////
// PANNING OF CAMERA LOGIC BELOW
// Takes shortest path, makes working with linear interpolation okay
var genPanToLatLon = function(lat, lon){
 var startTime;
 var startPos;
 var endPos;
 var animationHandle;
 var self = this;
 return function panToLatLon(ts){
	 if(!startTime) {startTime = ts;}
	 if(!startPos) {startPos = self.camera.position;}
	 if(!endPos) {
		 endPos = latLonToSphere(
			 lat,
			 lon,
			 C.globe.EARTH_RAD + 3
		 );
	 }
	 var timeStepNorm = (ts - startTime) / 2000 > 1 ? 1 : (ts - startTime) / 2000;
	 if(ts){
		 self.controls.enabled = false;
		 var x = lerp(startPos.x, endPos.x, timeStepNorm);
		 var y = lerp(startPos.y, endPos.y, timeStepNorm);
		 var z =	lerp(startPos.z, endPos.z, timeStepNorm);
		 self.camera.position.set(x, y, z);
	 }
	 animationHandle = requestAnimationFrame(panToLatLon.bind(self));
	 if(timeStepNorm === 1) {
		 cancelAnimationFrame(animationHandle);
		 self.controls.enabled = true;
	 }
 }
};

//////////////////////////////////////////
// "FLIGHT PATH" BELOW
var genTravelPathAnim = function(fromLat, fromLon, toLat, toLon){
 var start = latLonToSphere(fromLat, fromLon, C.globe.EARTH_RAD);
 // TODO: BUG?!
 var middlePointHeight = arcLen(radians(fromLat), radians(fromLon), radians(toLat), radians(toLon), C.globe.EARTH_RAD);
 var middle = latLonToSphere(
	 lerp(fromLat, toLat, 0.5),
	 lerp(fromLon, toLon, 0.5),
	 C.globe.EARTH_RAD + middlePointHeight * C.path.ALT_MULT
 );
 var end = latLonToSphere(toLat, toLon, C.globe.EARTH_RAD);
 var offset = Math.random() * C.path.OFFS_MULT;
 var curve = new THREE.QuadraticBezierCurve3(
	 new THREE.Vector3( start.x, start.y, start.z ),
	 new THREE.Vector3( middle.x + offset, middle.y + offset, middle.z + offset ),
	 new THREE.Vector3( end.x, end.y, end.z ),
 );
 var noPoints = 50;
 var points = curve.getPoints( noPoints );
 var geometry = new THREE.BufferGeometry().setFromPoints( points );
 geometry.setDrawRange(0, 0);
 genAnimPath(geometry, noPoints, 500);


 var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

 // Create the final object to add to the scene
 var curveObject = new THREE.Line( geometry, material );
 this.scene.add(curveObject);
};

var genAnimPath = function(geometry, pointsNo, durationEnd){
 var animHandler;
 var start;
 var cancelAnim = false;
 function anim(ts){
	 if(!start) { start = ts; }
	 var animDur = ts - start;
	 var pointsToShow = Math.floor(lerp(0, pointsNo, animDur/durationEnd));
	 if(pointsToShow > pointsNo){
		 pointsToShow = pointsNo + 1;
		 cancelAnim = true;
	 }
	 geometry.setDrawRange(0, pointsToShow);
	 animHandler = requestAnimationFrame(anim);
	 if(cancelAnim){
		 cancelAnimationFrame(animHandler);
	 }
 };
 animHandler = requestAnimationFrame(anim);
};



export default GlobeScene;
