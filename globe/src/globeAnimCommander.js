import GlobeScene from './globeScene';

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



var GlobeAnimCommander = function(){
	this.globeScene = new GlobeScene();
	this.history = [];
	this.globeScene.render();
	setTimeout(() => {
		this.globeScene.startPathAnim([LAT_LONS[citiesOrder[0]], LAT_LONS[citiesOrder[1]]]);
	}, 2000);
	setTimeout(() => {
		this.globeScene.startPathAnim([LAT_LONS[citiesOrder[1]], LAT_LONS[citiesOrder[2]]]);
	}, 5000);
	setTimeout(() => {
		this.globeScene.startPathAnim([LAT_LONS[citiesOrder[1]], LAT_LONS[citiesOrder[2]]], {forward: false});
	}, 8000);
	setTimeout(() => {
		this.globeScene.startPathAnim([LAT_LONS[citiesOrder[0]], LAT_LONS[citiesOrder[1]]], {forward: false});
	}, 11000);
};

// Execute
// May want exactly same API to make sure rewinding could work...

// FAST FORWARD
// REWIND

export default GlobeAnimCommander;