import GlobeScene from './globeScene';
import {range} from './globeHelpers';

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
// var citiesOrder = ["ST", "KL", "ST", "TP"];


var GlobeAnimCommander = function(){
	this.cityIdx = 0;
	this.globeScene = new GlobeScene();
	this.globeScene.render();
	var TBR=this.genLatLonArr(3);
	this.globeScene.startPathAnim(
		TBR
	);

	// setTimeout(()=> { this.globeScene.cancelPathAnim() }, 2000)

	// this.globeScene.startPathAnim(
	// 	this.genLatLonArr(3)
	// );

	setTimeout(()=> {
		var TBR = this.genLatLonArr(0);
		this.globeScene.startPathAnim(TBR, {forward: false});
	}, 6000)
	// setTimeout(()=> { this.globeScene.cancelPathAnim() }, 7000)
};

GlobeAnimCommander.prototype.goToCityIdx = function(idx){
	var latLonArr = this.genLatLonArr(idx);
	this.globeScene.startPathAnim(latLonArr);
};


GlobeAnimCommander.prototype.genLatLonArr = function(toIdx){
	var idxArr = toIdx > this.cityIdx ? range(this.cityIdx, toIdx) : range(this.cityIdx, toIdx-1, -1);
	var res = idxArr.map((cityIdx) => {
		return [LAT_LONS[citiesOrder[cityIdx]], LAT_LONS[citiesOrder[cityIdx+1]]];
	});
	this.cityIdx = idxArr[idxArr.length-1];
	return res;
};

export default GlobeAnimCommander;