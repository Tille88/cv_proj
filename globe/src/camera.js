// import * as THREE from 'three';
import THREE from '../lib/THREE';
import {default as C} from './config';
import { lerp, latLonToSphere } from './globeHelpers';

var Camera = function(aspect){
	var camera = new THREE.PerspectiveCamera(
		C.camera.FOV,
		aspect,
		C.camera.NEAR,
		C.camera.FAR);

	var pos = C.camera.INIT_POS;
	camera.position.set(pos.x, pos.y, pos.z);
	camera.up.set(0,0,1);
	camera.lookAt( 0,0,0 );
	// Add in panning method for camera, only one so no biggie...
	panningDecorator.call(camera);
	return camera;
};

//////////////////////////////////////////
// PANNING OF CAMERA LOGIC BELOW
// Takes shortest path, makes working with linear interpolation okay
var panningDecorator = function(){
	this.genPanToLatLon = function(lat, lon){
		var startTime;
		var startPos;
		var endPos;
		var animationHandle;
		var self = this;
		return function panToLatLon(ts){
			if(!startTime) {startTime = ts;}
			if(!startPos) {startPos = self.position;}
			if(!endPos) {
				endPos = latLonToSphere(
					lat,
					lon,
					C.globe.EARTH_RAD + 3
				);
			}
			var timeStepNorm = (ts - startTime) / 2000 > 1 ? 1 : (ts - startTime) / 2000;
			if(ts){
				// self.controls.enabled = false;
				var x = lerp(startPos.x, endPos.x, timeStepNorm);
				var y = lerp(startPos.y, endPos.y, timeStepNorm);
				var z =	lerp(startPos.z, endPos.z, timeStepNorm);
				self.position.set(x, y, z);
			}
			animationHandle = requestAnimationFrame(panToLatLon.bind(self));
			if(timeStepNorm === 1) {
				cancelAnimationFrame(animationHandle);
				// self.controls.enabled = true;
			}
		}
	 };
};



export default Camera;