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
// Returns function that given duration returns x, y, z
var panningDecorator = function(){
	this.genPanToLatLon = function(lat, lon){
		var startPos, endPos;
		var self = this;
		return function panToLatLon(timeStepNorm){
// console.log(timeStepNorm);
			if(timeStepNorm >= 1){ return false; }
			if(startPos === undefined || endPos === undefined) {
				startPos = Object.assign({}, self.position);
				endPos = latLonToSphere(
					lat,
					lon,
					C.globe.EARTH_RAD + 3
					);
				}
			var x = lerp(startPos.x, endPos.x, timeStepNorm);
			var y = lerp(startPos.y, endPos.y, timeStepNorm);
			var z =	lerp(startPos.z, endPos.z, timeStepNorm);
			self.position.set(x, y, z);
			return true;
		}
	 };
};



export default Camera;