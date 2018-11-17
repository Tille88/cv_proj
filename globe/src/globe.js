// Dependencies
import THREE from '../lib/THREE';
import { latLonToSphere } from './globeHelpers';
import {default as C} from './config';
import lines from '../data/test_with_clean_data_1of5_sampl';

//////////////////////////////////////////////
// Globe class
/**
 * Globe
 * Globe mesh containing a linegroup following a
 * DEM (digital elevation model)
 */

// Constructor
var Globe = function(){
	var lineData = prepareLineData();
	this.earthMesh = initEarthMesh();
	this.lineGroup = initLineGroup(lineData);
};

// Constants
var WIDTH_SEGS, HEIGHT_SEGS;
WIDTH_SEGS = HEIGHT_SEGS = 16;
var GLOBE_OPACITY = 0.7;



// Static private
var initEarthMesh = function(){
	var earthGeo = new THREE.SphereGeometry(C.globe.EARTH_RAD, WIDTH_SEGS, HEIGHT_SEGS);
	var earthMat = new THREE.MeshPhongMaterial({
				transparent: true,
				opacity: GLOBE_OPACITY
			});
	var earthMesh = new THREE.Mesh(earthGeo, earthMat);
	earthMesh.position.set(0, 0, 0);
	return earthMesh;
};


// Static private
// Given the data formatting, converting to the globe coordinate system
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


// Static private
var initLineGroup = function(lineData){
	var lineGroup = new THREE.Group();

	var materialLine = new THREE.LineBasicMaterial({color: 0x46ae73});
	for(var lat in lineData){
		lineData[lat].forEach((arr) => {
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

export default Globe;
