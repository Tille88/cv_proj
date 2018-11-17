// Dependencies
import GlobeScene from './globeScene';
import {range} from './globeHelpers';

// LOOKUPS (lat/lons + ordering)
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

/**
 * GlobeAnimCommander
 * Works as calling code, for the globe scene, triggering transitions as needed through interface
 * and keeping state of current index.
 * Constructor triggers scee and start render loop
 * @class
 */
var GlobeAnimCommander = function(){
	this.cityIdx = 0;
	this.globeScene = new GlobeScene();
	this.globeScene.render();
	triggerExample.call(this);
};

// Simple example
// Private instance
var triggerExample = function(){
	// this.goToCityIdx(3);
	setTimeout(()=> { this.goToCityIdx(3); }, 1000);
	setTimeout(()=> { this.goToCityIdx(0); }, 5000);
	// setTimeout(()=> { this.goToCityIdx(0); }, 8000);
	// setTimeout(()=> { this.goToCityIdx(3); }, 2000);
	// setTimeout(()=> { this.goToCityIdx(6); }, 6000);
	// setTimeout(()=> { this.goToCityIdx(9); }, 10000);
	// setTimeout(()=> { this.goToCityIdx(6); }, 14000);
	// setTimeout(()=> { this.goToCityIdx(3); }, 18000);
	// setTimeout(()=> { this.goToCityIdx(0); }, 22000);
};

/**
 * Starts animation to the index out of listed city indexes in lookup/order array above
 * @param {number} toIdx
 * @instance
 */
GlobeAnimCommander.prototype.goToCityIdx = function(toIdx){
	var forward = toIdx > this.cityIdx;
	var latLonArr = genLatLonArr.call(this, toIdx);
	this.globeScene.startPathAnim(latLonArr, { forward });
};


/**
 * Generate array as formatted the API requires
 * @param {number} toIdx
 * @returns {Array} Resulting array of cities to be put into animation call
 */
var genLatLonArr = function(toIdx){
	var idxArr = toIdx > this.cityIdx ? range(this.cityIdx, toIdx) : range(this.cityIdx, toIdx-1, -1);
	var res = idxArr.map((cityIdx) => {
		return [LAT_LONS[citiesOrder[cityIdx]], LAT_LONS[citiesOrder[cityIdx+1]]];
	});
	this.cityIdx = idxArr[idxArr.length-1];
	return res;
};

export default GlobeAnimCommander;