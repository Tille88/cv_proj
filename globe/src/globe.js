// TODO:
// - Try alterantive meshes for paths... not only lines of thickness == 1
// - animate movement paths + color by year scale + legend
// - refactor, scene as top GlobeScene, contains lights + renderer... globe comes in as dependency, not depend on window width... animationhandle should be possible to cancel at any time based on event, easing function...
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

// import * as THREE from 'three';
import THREE from '../lib/THREE';
import { TweenLite } from 'gsap/TweenLite';
import {default as C} from './config';
import Camera from './camera';
// import lines from '../data/no_kernel_full_2';
// import lines from '../data/test_with_clean_data_1of8_sampl';
import lines from '../data/test_with_clean_data_1of5_sampl';
// import lines from '../data/test_with_clean_data_1of5_sampl_min_5_per_line';
// import lines from '../data/test_with_clean_data_1of5_sampl_min_3_per_line';
// import lines from '../data/LOW_FREQ_test_with_clean_data_1of5_sampl';
// import lines from '../data/HIGH_FREQ_test_with_clean_data_1of5_sampl';
// import lines from '../data/test_with_clean_data_1of3_sampl';


//////////////////////////////////////////////
// Helper functions
var degToRad = function(deg){
	return deg * Math.PI * 2 / 360;
};

// https://en.wikipedia.org/wiki/Spherical_coordinate_system
var latLonToSphere = function(lat, lon, rad){
		return {
			x: rad * Math.cos(degToRad(lat))*Math.cos(degToRad(lon)),
			y: rad * Math.cos(degToRad(lat))*Math.sin(degToRad(lon)),
			z: rad * Math.sin(degToRad(lat))
		};
};


// Just need a linear function for now, later on better easings... D3's will do
var lerp = function(a, b, n) {
  return (1 - n) * a + n * b;
};


//////////////////////////////////////////////
// Globe class
var Globe = function(){

	this.lineData = prepareLineData();
	this.camera = new Camera();
	this.scene = initScene();
	this.earthMesh = initEarthMesh();
	this.scene.add(this.earthMesh);
	this.lineGroup = initLineGroup.call(this);
	this.scene.add(this.lineGroup);
	this.renderer = initRenderer();
	var container = document.getElementById('container');
	container.appendChild(this.renderer.domElement);

	this.controls = new THREE.OrbitControls( this.camera );
	// this.controls.autoRotate = true;
	this.controls.update();

	if(C.DEBUG){
		// X=red, Y=green and Z=blue.
		var axesHelper = new THREE.AxesHelper(15);
		this.scene.add( axesHelper );
	}
};

// Static private
var initScene = function() {
	var scene = new THREE.Scene();
	var light = new THREE.AmbientLight(0x04040c);
	scene.add(light);
	return scene;
};

// Static private
var initEarthMesh = function(){
	var earthGeo = new THREE.SphereGeometry(C.globe.EARTH_RAD, 16, 16);

	var earthMat = new THREE.MeshPhongMaterial({
				transparent: true,
				opacity: 0.7
			});

	var earthMesh = new THREE.Mesh(earthGeo, earthMat);
	earthMesh.position.set(0, 0, 0);

	return earthMesh;
};

// Static private
var initRenderer = function(){
	var renderer = new THREE.WebGLRenderer({antialiasing : true});
	renderer.setSize(C.globe.WIDTH, C.globe.HEIGHT);
	renderer.domElement.style.position = 'relative';
	renderer.setClearColor (0x000000, 1);
	return renderer;
};


// Static private
var prepareLineData = function() {
	var newVals = {};
	for(var lat in lines){
		newVals[lat] = [];
		lines[lat].forEach((arr) => {
					var TBR = arr.map((coordObj) => {
						return latLonToSphere(lat, coordObj.l, C.globe.EARTH_RAD + coordObj.a*C.globe.MULTIPLIER );
					});
					newVals[lat].push(TBR);
				});
	};
	return newVals;
};


// Instance private
var initLineGroup = function(){
	var lineGroup = new THREE.Group();

	var materialLine = new THREE.LineBasicMaterial({color: 0x46ae73});
	for(var lat in this.lineData){
		this.lineData[lat].forEach((arr) => {
			var vectorArr = arr.map(p => new THREE.Vector3( p.x, p.y, p.z ));
			if(vectorArr.length <= 1) { return; }
			var curve = new THREE.CatmullRomCurve3(vectorArr);
			var points = curve.getPoints( vectorArr.length*4 );
			var geometry = new THREE.BufferGeometry().setFromPoints( points );
			var curveObject = new THREE.Line( geometry, materialLine );
			lineGroup.add(curveObject);
		});
	}
	return lineGroup;
};

Globe.prototype.render = function() {
	 this.renderer.render(this.scene, this.camera);
};



var once = false;
var cityIdx = 0;
Globe.prototype.animate = function animate(ts){
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
		}, 7000);
		once = true;
	}
	this.controls.update();
	requestAnimationFrame(animate.bind(this));
	this.renderer.render(this.scene, this.camera);
};

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
				C.globe.EARTH_RAD + 50
			);
		}
		var timeStepNorm = (ts - startTime) / 5000 > 1 ? 1 : (ts - startTime) / 5000;
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
	var middle = latLonToSphere(
		lerp(fromLat, toLat, 0.5),
		lerp(fromLon, toLon, 0.5),
		C.globe.EARTH_RAD+10 + Math.random()
	);
	var end = latLonToSphere(toLat, toLon, C.globe.EARTH_RAD);
	var offset = Math.random();
	var curve = new THREE.QuadraticBezierCurve3(
		new THREE.Vector3( start.x, start.y, start.z ),
		new THREE.Vector3( middle.x + offset, middle.y + offset, middle.z + offset ),
		new THREE.Vector3( end.x, end.y, end.z ),
	);
	var noPoints = 50;
	var points = curve.getPoints( noPoints );
	var geometry = new THREE.BufferGeometry().setFromPoints( points );
	geometry.setDrawRange(0, 0);
	genAnimPath(geometry, noPoints, 1000);


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
			pointsToShow = pointsNo;
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


export default Globe;
