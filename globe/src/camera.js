// import * as THREE from 'three';
import THREE from '../lib/THREE';
import {default as C} from './config';

var Camera = function(){
	var camera = new THREE.PerspectiveCamera(
		C.camera.FOV,
		C.camera.ASPECT,
		C.camera.NEAR,
		C.camera.FAR);

	camera.position.set(-80, 0, 30);
	camera.up.set(0,0,1);
	camera.lookAt( 0,0,0 );
	return camera;
};

export default Camera;