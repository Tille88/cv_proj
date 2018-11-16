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
	// this.globeScene.panTo(LAT_LONS.KL.lat, LAT_LONS.KL.lon);
	// this.globeScene.startPathAnim([{lat: LAT_LONS.KL.lat, lon: LAT_LONS.KL.lon}]);
	setTimeout(() => {
		console.log("CALLING ANIM");
		this.globeScene.startPathAnim([LAT_LONS[citiesOrder[1]]]);
	}, 5000);
};


// FAST FORWARD
// REWIND

export default GlobeAnimCommander;