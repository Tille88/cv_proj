// TODO:

// 1) Make drag behavior work
// Use links:
// 		https://bl.ocks.org/mbostock/4198499
// 		https://stackoverflow.com/questions/31698668/d3-js-how-can-i-make-an-infinite-background-grid
// 		https://bl.ocks.org/mbostock/6123708

// 2) Morph and push down functionality

// 3) Running time indicator

// 4) Make highlight of tracks work

// 5) Full list of icons working

// 6) Style (add colour), check different fonts

// 7) Responsive

// 8) Integrate with 3D globe

import d3 from '../lib/d3';
import TimeIndicator from './timeIndicator';
import TimeTickTrack from './timeTickTrack';
import CvTracks from './cvTracks';

var layout = {
	header: {
		height: 60,
	}
}

var YEARS = [
	1988, 1989,
	1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999,
	2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009,
	2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019
];

var timeInp = {
	start: new Date(YEARS[0],1,1),
	end: new Date(YEARS[YEARS.length - 1],1,1)
};

var DOMHEIGHT = [layout.header.height, 2000];
var SVG_WIDTH = 700;



var TimeScale = function(){
	this.timeScale = d3.scaleTime()
		.domain([timeInp.start, timeInp.end])
		.range(DOMHEIGHT)
	return this.timeScale; //TEMP

};


var TimeLineCV = function(){
	this.target = d3.select('body');
	this.timeScale = new TimeScale();
	this.svg = this.target
	 .append("svg").attr("width", SVG_WIDTH).attr("height", DOMHEIGHT[1]);
	initDefs.call(this);


	// Time ticks
	this.timeTickTrack = new TimeTickTrack(this.timeScale, {
		yearArr: YEARS,
		margin: {left: 20},
		target: this.svg
	})

	this.cvTracks = new CvTracks(this.timeScale, {
		margin: {
			left: 50,
			right: 0,
			top: layout.header.height,
			bottom: 0,
		},
		target: this.svg
	});


	// this.path = acadTrack.append("path")
	// 	.attr("d", roundedRect(
	// 		50 + 5, //x
	// 		this.timeScale(acadTrackData[0].start), //y
	// 		150 - 10, //width
	// 		this.timeScale(acadTrackData[0].end) - this.timeScale(acadTrackData[0].start), //height
	// 		10,
	// 		10
	// 		))
	// 		.attr("fill", "rgb(244,244,244)")
	// 		.attr("stroke", "black");

	// acadTrack.append("text")
	// 	.attr("x", 50 + 10)
	// 	.attr("y", this.timeScale(acadTrackData[0].start) + 10)
	// 	.attr('dominant-baseline', 'central')
	// 	.text(acadTrackData[0].text);
	// // initListeners.call(this);

	// Current location line
	this.timeIndicator = new TimeIndicator(this.timeScale, {
		yearArr: YEARS,
		margin: {
			left: 50,
			right: SVG_WIDTH - 30
		},
		target: this.svg
	});

	// initListeners.call(this);
	initClickRect.call(this);

};

TimeLineCV.prototype.play = function(){
	this.timeIndicator.play();
};

var initDefs = function(){
	var defs = this.svg.append("defs");

	this.clipPath = defs.append('clipPath')
		.attr("id", "clip-path");

	this.clipPathRect = genActiveRect(this.clipPath);

	defs.append('style')
		.attr('type', 'text/css')
		.text(`
		// @font-face {
		// 	font-family: 'jura';
		// 	src: url('../../../assets/ui/fonts/jura/jura.ttf');
		// }
	`);
};

var genActiveRect = function(target){
	return target.append('rect')
	.attr("x", 0)
	.attr("y", layout.header.height - 1)
	.attr("width", SVG_WIDTH)
	.attr("height", DOMHEIGHT[1]);
};

var initClickRect = function(){
	var clickableArea = genActiveRect(this.svg).attr("fill", "rgba(0,0,0,0)");
	var timeScale = this.timeScale;
	clickableArea.on("click", (e) => {

		// d3.mouse(clickableArea.node())
		var coordY = d3.mouse(clickableArea.node())[1];
		console.log(timeScale.invert(coordY));

		}

		);
};

// var initListeners = function(){
// 	this.path.on("click", () => console.log("CLICKED"));
// };
// var initListeners = function(){
// 	this.clipPathRect.on("click", () => console.log("CLICKED"));
// };


var roundedRect = function(x, y, width, height, radiusTop, radiusBottom) {
	return `M${x + radiusTop},${y}
       h${width - 2*radiusTop}
       a${radiusTop},${radiusTop} 0 0 1 ${radiusTop}, ${radiusTop}
       v${height - (radiusBottom + radiusTop)}
       a${radiusBottom},${radiusBottom} 0 0 1 ${-radiusBottom}, ${radiusBottom}
			 h ${2*radiusBottom - width}
			 a${radiusBottom},${radiusBottom} 0 0 1 ${-radiusBottom}, ${-radiusBottom}
			 v${-height + (radiusBottom + radiusTop)}
			 a${radiusTop},${radiusTop} 0 0 1 ${radiusTop}, ${-radiusTop}
       z`;
};

// Refactor and put into class... first morph heigh, then morph width... need to be able to morph left+right
var morphHeight = function(x, y, width, height, radiusTop, radiusBottom){

};

export default TimeLineCV;