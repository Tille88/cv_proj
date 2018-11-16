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
// var citiesOrder = ["ST", "KL", "ST", "TP"];

var TBR = 2000;

var GlobeAnimCommander = function(){
	this.cityIdx = 0;
	this.globeScene = new GlobeScene();
	this.globeScene.render();
	var TBR=this.genLatLonArr(3);
	console.log(TBR);
	this.globeScene.startPathAnim(
		TBR
	);

	// this.globeScene.startPathAnim(
	// 	this.genLatLonArr(3)
	// );

	setTimeout(()=> {
		var TBR = this.genLatLonArr(0);
		console.log(TBR);
		this.globeScene.startPathAnim(TBR, {forward: false});
	}, 6000)
	// setTimeout(()=> { this.globeScene.cancelPathAnim() }, 1000)


	// var intervalHanlde = setInterval(() => {
	// 	this.globeScene.startPathAnim([LAT_LONS[citiesOrder[this.cityIdx]], LAT_LONS[citiesOrder[this.cityIdx+1]]]);
	// 	this.cityIdx++;
	// 	if(this.cityIdx===citiesOrder.length-1){
	// 		clearInterval(intervalHanlde);
	// 	}
	// }, TBR);
	// var intervalHanlde2 = setInterval(() => {
	// 	this.globeScene.startPathAnim([LAT_LONS[citiesOrder[this.cityIdx-1]], LAT_LONS[citiesOrder[this.cityIdx]]], {forward: false});
	// 	this.cityIdx--;
	// }, TBR * citiesOrder.length);
	// setTimeout(() => {
	// 	this.globeScene.startPathAnim([LAT_LONS[citiesOrder[1]], LAT_LONS[citiesOrder[2]]]);
	// }, 5000);
	// setTimeout(() => {
	// 	this.globeScene.startPathAnim([LAT_LONS[citiesOrder[1]], LAT_LONS[citiesOrder[2]]], {forward: false});
	// }, 8000);
	// setTimeout(() => {
	// 	this.globeScene.startPathAnim([LAT_LONS[citiesOrder[0]], LAT_LONS[citiesOrder[1]]], {forward: false});
	// }, 11000);
};

GlobeAnimCommander.prototype.genLatLonArr = function(toIdx){
	var res = [];
	var idxBump = toIdx > this.cityIdx ? 1 : -1;
	for(var cityIdx = this.cityIdx; cityIdx !== toIdx; cityIdx+=idxBump){
		console.log(cityIdx);
		res.push([LAT_LONS[citiesOrder[cityIdx]], LAT_LONS[citiesOrder[cityIdx+1]]]);
	}
	this.cityIdx = toIdx;
	return res;
};

export default GlobeAnimCommander;