import { radians, lerp, latLonToSphere, arcLen } from './globeHelpers';
import {default as C} from './config';

var PathContainer = function(target){
	this.target = target;
	this.lines = [];
};

var NO_POINTS = 50;


var genTravelPath = function(fromLat, fromLon, toLat, toLon){
	var start = latLonToSphere(fromLat, fromLon, C.globe.EARTH_RAD);
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
	var points = curve.getPoints( NO_POINTS );
	var geometry = new THREE.BufferGeometry().setFromPoints( points );
	geometry.setDrawRange(0, 0);
	var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
	var curveObject = new THREE.Line( geometry, material );
	this.lines.push(curveObject);
	this.target.add(curveObject);
	return curveObject;
 };


 PathContainer.prototype.genLineAnimation = function(fromLat, fromLon, toLat, toLon){
	 var lastNoPoints;
	 var self = this;
	 if(fromLat){
		var line = genTravelPath.call(this, fromLat, fromLon, toLat, toLon);
		return function lineAnimation(timeStepNorm){
			if(timeStepNorm > 1 && lastNoPoints > NO_POINTS + 1){ return false; }
			// var line = self.lines[self.lines.length-1];
			var pointsToShow = lastNoPoints = Math.floor(lerp(0, NO_POINTS + 1, timeStepNorm));
	// console.log("SHOWING POINTS: ", pointsToShow);
			line.geometry.setDrawRange(0, pointsToShow);
			return true;
		};
	 } else{
		//  This is for reverse animations
		return function lineAnimation(timeStepNorm){
			if(timeStepNorm > 1 && lastNoPoints <= 0){
				self.target.remove(self.lines.pop());
				return false;
			}
			var line = self.lines[self.lines.length-1];
			var pointsToShow = lastNoPoints = Math.floor(lerp(NO_POINTS + 1, 0, timeStepNorm));
			line.geometry.setDrawRange(0, pointsToShow);
			return true;
		};
	 }
 };
//  BACKUP
//  PathContainer.prototype.lineAnimationGen = function(fromLat, fromLon, toLat, toLon){
// 		genTravelPath.call(this, fromLat, fromLon, toLat, toLon);
// 		var lastNoPoints;
// 		var self = this;
// 		return function lineAnimation(timeStepNorm){
// 			if(timeStepNorm > 1 && lastNoPoints > NO_POINTS + 1){ return false; }
// 			var line = self.lines[self.lines.length-1];
// 			var pointsToShow = lastNoPoints = Math.floor(lerp(0, NO_POINTS + 1, timeStepNorm));
// 			line.geometry.setDrawRange(0, pointsToShow);
// 			return true;
// 		};
//  };




 export default PathContainer;