import { radians, lerp, latLonToSphere, arcLen } from './globeHelpers';
import {default as C} from './config';

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


 export default genTravelPathAnim;