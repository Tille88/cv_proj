// Dependencies
import THREE from '../lib/THREE';
import {default as C} from './config';
import { lerp, latLonToSphere } from './globeHelpers';


/**
 * Camera
 * Wrapper, initializing the THREE.js camera to an initial position
 * and making sure a z-up right handed coordinate system is used.
 * Decorating with panning method, since it seems strongly connected to the camera object
 * @param {*} aspect Aspect ratio of camera
 * @class
 */
var Camera = function(aspect){
	// Instantiating object
	var camera = new THREE.PerspectiveCamera(
		C.camera.FOV,
		aspect,
		C.camera.NEAR,
		C.camera.FAR
	);

	var pos = C.camera.INIT_POS;
	camera.position.set(pos.x, pos.y, pos.z);
	// Setting up direction to make sure coordinate system used is correct
	camera.up.set(0,0,1);
	// Placement of globe will have center at [0,0,0]
	camera.lookAt( 0,0,0 );
	// Add in panning method for camera, will only be one camera, so attaching straight to object
	panningDecorator.call(camera);
	return camera;
};

// Constants
var Z_OFFSET = 3;

// Decorator for camera object
var panningDecorator = function(){
	// Method that returns a animation/transition function for a panning and updating
	// the camera instance object.
	// Takes shortest path, works in my case, but not recommended if
	// having paths passing through the globe object.
	// Linear transition function used - in 3D space movement of camera in relation to object works okay.
	this.genPanToLatLon = function(lat, lon){
		var startPos, endPos;
		var self = this;
		// Returns true if having panned, i.e. notDone
		return function panToLatLon(timeStepNorm){
			if(timeStepNorm > 1){ return false; }
			if(startPos === undefined || endPos === undefined) {
				startPos = Object.assign({}, self.position);
				endPos = latLonToSphere(
					lat,
					lon,
					C.globe.EARTH_RAD + Z_OFFSET
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