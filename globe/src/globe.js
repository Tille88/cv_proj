// TODO:
// Data coming in not correct lat lon!!!
// Bug of lat lon to sphere coords

// make interactive
// refactor
// calculate and draw + autopan movement paths
// Inspiration from https://codepen.io/Flamov/pen/MozgXb


import * as THREE from 'three';
// import lines from '../data/no_kernel';
// import lines from '../data/no_kernel_full';
import lines from '../data/DEBUG';

var degToRad = function(deg){
	return deg * Math.PI * 2 / 360;
};
// Athimuth = x = lon
// Inclanation = θ = y = lat


// https://en.wikipedia.org/wiki/Spherical_coordinate_system
var latLonToSphere = function(lat, lon, rad){
	// return {
	// 		// x: rad * Math.cos(degToRad(lat))*Math.cos(degToRad(lon)),
	// 		// y: rad * Math.cos(degToRad(lat))*Math.sin(degToRad(lon)),
	// 		// z: rad * Math.sin(degToRad(lat))
	// 		x: rad * Math.sin(degToRad(lat))*Math.cos(degToRad(lon)),
	// 		y: rad * Math.sin(degToRad(lat))*Math.sin(degToRad(lon)),
	// 		z: rad * Math.cos(degToRad(lat))
	// 	};
		var toReturn =  {
			// x: rad * Math.cos(degToRad(lat))*Math.cos(degToRad(lon)),
			// y: rad * Math.cos(degToRad(lat))*Math.sin(degToRad(lon)),
			// z: rad * Math.sin(degToRad(lat))
			x: rad * Math.sin(degToRad(lat))*Math.cos(degToRad(lon)),
			y: rad * Math.sin(degToRad(lat))*Math.sin(degToRad(lon)),
			z: rad * Math.cos(degToRad(lat))
		};
		// if(lat < -10) { debugger; }
		return toReturn;
};


var Globe = function(){
	var EARTH_RAD = 15;
	var SCALE;
	var OFFSET = 0.00002
	var MULTIPLIER = 0.002;//10e-2;

	var newVals = {};
	for(var lat in lines){
		newVals[lat] = [];
		var skippedLast;
		lines[lat].forEach((el, i, arr) => {
			if(el === -500) {
				skippedLast = true;
				return;
			}
			var inCoords = latLonToSphere(lat, 360/arr.length*i, EARTH_RAD + el*MULTIPLIER );
			var valToPush = (!newVals[lat].length || skippedLast) ? [inCoords] : inCoords;
			if(!newVals[lat].length || skippedLast){
				newVals[lat].push(valToPush);
			} else{
				newVals[lat][Math.max(0, newVals[lat].length-1)].push(valToPush);
			}
			skippedLast = false;
		});
	};




	var WIDTH = window.innerWidth - 30,
    HEIGHT = window.innerHeight - 30;
	var angle = 45,
	aspect = WIDTH / HEIGHT,
	near = 0.1,
	far = 3000;

	var container = document.getElementById('container');

	this.camera = new THREE.PerspectiveCamera(angle, aspect, near, far);
	this.camera.position.set(-80, 0, 0);
	// this.camera.position.set(0, 0, 50);
	this.camera.up.set(0,0,1);

	this.scene = new THREE.Scene();

	// var light = new THREE.SpotLight(0xFFFFFF, 1, 0, Math.PI / 2, 1);
	var light = new THREE.AmbientLight(0xFFFFFF);
	// light.position.set(4000, 4000, 1500);
	// light.target.position.set (1000, 3800, 1000);

	this.scene.add(light);

	var earthGeo = new THREE.SphereGeometry(EARTH_RAD, 16, 16);
	// var earthMat = new THREE.MeshPhongMaterial();
	var earthMat = new THREE.MeshPhongMaterial({
				transparent: true,
				opacity: 0.7
			});

	var earthMesh = new THREE.Mesh(earthGeo, earthMat);
	earthMesh.position.set(0, 0, 0);
	this.scene.add(earthMesh);

	// LINE
	//create a blue LineBasicMaterial
	var materialLine = new THREE.LineBasicMaterial( { color: 0x7722ff } );
	for(var lat in newVals){
		newVals[lat].forEach((arr) => {
			var geometryLine = new THREE.Geometry();
			arr.forEach(p =>{
				geometryLine.vertices.push(new THREE.Vector3( p.x, p.y, p.z) );
			});
			var line = new THREE.Line( geometryLine, materialLine );
			this.scene.add( line );
		});
	}
	// END LINE

	// var curve = new THREE.CatmullRomCurve3( [
	// 	new THREE.Vector3( -10, 0, 10 ),
	// 	new THREE.Vector3( -5, 5, 5 ),
	// 	new THREE.Vector3( 0, 0, 0 ),
	// 	new THREE.Vector3( 5, -5, 5 ),
	// 	new THREE.Vector3( 10, 0, 10 )
	// ] );

	// var points = curve.getPoints( 50 );
	// var geometry = new THREE.BufferGeometry().setFromPoints( points );

	// var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

	// // Create the final object to add to the scene
	// var curveObject = new THREE.Line( geometry, material );

	// X=red, Y=green and Z=blue.
	var axesHelper = new THREE.AxesHelper(15);
	this.scene.add( axesHelper );


	// this.camera.lookAt( earthMesh.position );
	this.camera.lookAt( 0,0,0 );
	//Renderer code. We'll get to this in a moment
	this.renderer = new THREE.WebGLRenderer({antialiasing : true});
	this.renderer.setSize(WIDTH, HEIGHT);
	this.renderer.domElement.style.position = 'relative';

	container.appendChild(this.renderer.domElement);
	this.renderer.autoClear = false;
	// this.renderer.shadowMap.enabled;// = true;
};

Globe.prototype.render = function() {
	 this.renderer.render(this.scene, this.camera);
};


export default Globe;


// import * as THREE from 'three';
// import lines from '../data/no_kernel';

// var degToRad = function(deg){
// 	return deg * Math.PI * 2 / 360;
// };
// // Athimuth = x = lon
// // Inclanation = θ = y = lat


// // https://en.wikipedia.org/wiki/Spherical_coordinate_system
// var latLonToSphere = function(lat, lon, rad){
// 	return {
// 		x: rad * Math.cos(degToRad(lat))*Math.cos(degToRad(lon)),
// 		y: rad * Math.cos(degToRad(lat))*Math.sin(degToRad(lon)),
// 		z: rad * Math.sin(degToRad(lat))
// 	};
// };


// var Globe = function(){
// 	var EARTH_RAD = 15;
// 	var SCALE;
// 	var MULTIPLIER = 0.0005;//10e-2;

// 	var newVals = {};
// 	for(var lat in lines){
// 		newVals[lat] = lines[lat].map((el, i, arr) => {
// 			return latLonToSphere(lat, 360/arr.length*i, EARTH_RAD + 1 + el*MULTIPLIER )
// 		});
// 		// newVals[lat] = [];
// 		// lines[lat].forEach((el, i, arr) => {
// 		// 	if(el === -500) { return; }
// 		// 	newVals[lat].push(latLonToSphere(lat, 360/arr.length*i, EARTH_RAD + 1 + el*MULTIPLIER ));
// 		// });
// 	};




// 	var WIDTH = window.innerWidth - 30,
//     HEIGHT = window.innerHeight - 30;
// 	var angle = 45,
// 	aspect = WIDTH / HEIGHT,
// 	near = 0.1,
// 	far = 3000;

// 	var container = document.getElementById('container');

// 	this.camera = new THREE.PerspectiveCamera(angle, aspect, near, far);
// 	this.camera.position.set(-50, 50, 50);
// 	// this.camera.position.set(0, 0, -50);
// 	this.camera.up.set(0,0,1);

// 	this.scene = new THREE.Scene();

// 	// var light = new THREE.SpotLight(0xFFFFFF, 1, 0, Math.PI / 2, 1);
// 	var light = new THREE.AmbientLight(0xFFFFFF);
// 	// light.position.set(4000, 4000, 1500);
// 	// light.target.position.set (1000, 3800, 1000);

// 	this.scene.add(light);

// 	var earthGeo = new THREE.SphereGeometry(EARTH_RAD, 16, 16);
// 	var earthMat = new THREE.MeshPhongMaterial();
// 	// var earthMat = new THREE.MeshPhongMaterial({
// 				// transparent: true,
// 				// opacity: 0.5
// 			// });

// 	var earthMesh = new THREE.Mesh(earthGeo, earthMat);
// 	earthMesh.position.set(0, 0, 0);
// 	this.scene.add(earthMesh);

// 	// LINE
// 	//create a blue LineBasicMaterial
// 	var materialLine = new THREE.LineBasicMaterial( { color: 0x7722ff } );
// 	for(var lat in newVals){
// 		var geometryLine = new THREE.Geometry();
// 		newVals[lat].forEach((p,i,arr) => {
// 			geometryLine.vertices.push(new THREE.Vector3( p.x, p.y, p.z) );
// 		});
// 		var line = new THREE.Line( geometryLine, materialLine );
// 		this.scene.add( line );
// 	}
// 	// END LINE

// 	// var curve = new THREE.CatmullRomCurve3( [
// 	// 	new THREE.Vector3( -10, 0, 10 ),
// 	// 	new THREE.Vector3( -5, 5, 5 ),
// 	// 	new THREE.Vector3( 0, 0, 0 ),
// 	// 	new THREE.Vector3( 5, -5, 5 ),
// 	// 	new THREE.Vector3( 10, 0, 10 )
// 	// ] );

// 	// var points = curve.getPoints( 50 );
// 	// var geometry = new THREE.BufferGeometry().setFromPoints( points );

// 	// var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );

// 	// // Create the final object to add to the scene
// 	// var curveObject = new THREE.Line( geometry, material );

// 	// X=red, Y=green and Z=blue.
// 	var axesHelper = new THREE.AxesHelper(15);
// 	this.scene.add( axesHelper );


// 	this.camera.lookAt( earthMesh.position );

// 	//Renderer code. We'll get to this in a moment
// 	this.renderer = new THREE.WebGLRenderer({antialiasing : true});
// 	this.renderer.setSize(WIDTH, HEIGHT);
// 	this.renderer.domElement.style.position = 'relative';

// 	container.appendChild(this.renderer.domElement);
// 	this.renderer.autoClear = false;
// 	// this.renderer.shadowMap.enabled;// = true;
// };

// Globe.prototype.render = function() {
// 	 this.renderer.render(this.scene, this.camera);
// };


// export default Globe;
