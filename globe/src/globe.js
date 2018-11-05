// TODO:
// Smaller globe in globe la...
// Incoming data format (more dense data), depending on where on globe... around equator needs to be denser
// refactor, scene as top GlobeScene, contains lights + renderer... globe comes in as dependency
// On interval, pan to different part
// make interactive (mouse, keys, zoom)
// calculate and draw + autopan movement paths
// Staying years animation


import * as THREE from 'three';
import {default as C} from './config';
import Camera from './camera';
import lines from '../data/no_kernel_full_2';


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
	this.animate();

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
		var skippedLast;
		lines[lat].forEach((el, i, arr) => {
			if(el === -500) {
				skippedLast = true;
				return;
			}
			var inCoords = latLonToSphere(lat, 360/arr.length*i, C.globe.EARTH_RAD + el*C.globe.MULTIPLIER );
			var valToPush = (!newVals[lat].length || skippedLast) ? [inCoords] : inCoords;
			if(!newVals[lat].length || skippedLast){
				newVals[lat].push(valToPush);
			} else{
				newVals[lat][Math.max(0, newVals[lat].length-1)].push(valToPush);
			}
			skippedLast = false;
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
			var points = curve.getPoints( 50 );
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


Globe.prototype.rotate = function(){
	this.lineGroup.rotateZ(0.004);
	this.renderer.render(this.scene, this.camera);
};

Globe.prototype.animate = function animate(){
	this.rotate();
	requestAnimationFrame(animate.bind(this));
};

export default Globe;
