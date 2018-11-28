import d3 from '../lib/d3';

import play from '../../assets/ui/icons/contr/play.svg';
import pause from '../../assets/ui/icons/contr/pause.svg';
import acad from '../../assets/ui/icons/acad/school.svg';

var layout = {
	header: {
		height: 100,
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

var DOMHEIGHT = [layout.header.height, 900];
var SVG_WIDTH = 700;


// Abstract class/interface needed "track", containing header and track...
var Header = function(){

};


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

	// Defs
	var defs = this.svg.append("defs");

	defs.append('style')
		.attr('type', 'text/css')
		.text(`
		@font-face {
			font-family: 'jura';
			src: url('../../../assets/ui/fonts/jura/jura.ttf');
		}

		@font-face {
			font-family: 'kanit';
			src: url('../../../assets/ui/fonts/jura/jura.ttf');
		}
	`);

	// Time ticks
	this.timeTicks = this.svg.append("g").attr("class", "timeTicks").selectAll("text")
		.data(YEARS)
		.enter()
		.append("text")
		.attr("x", 20)
		.attr("y", (d) => this.timeScale(new Date(d, 1, 1)))
		.attr("text-anchor", "middle")
		.attr('dominant-baseline', 'central')
		.style('font-family', '"kanit", futura, helvetica, sans-serif')
		.text(d => d);

	// First track (here for now...)
	var acadTrackHeader = {
		text: "Academic",
		icon: acad
	};
	var acadTrackData = [
		{start:new Date(1989,1,1), end:new Date(1991,12,30), text:"Fill text..."}
	];
	var acadTrack = this.svg.append("g").attr("class", "acad-track").style('font-family', '"kanit", futura, helvetica, sans-serif');
	acadTrack.append("line")
		.attr("x1", 50)
		.attr("y1", 0)
		.attr("x2", 50)
		.attr("y2", DOMHEIGHT[1])
		.attr("stroke-width", 1)
		.attr("stroke-dasharray", 4)
		.attr("opacity", 0.5)
		.attr("stroke", "black");
	acadTrack.append("line")
		.attr("x1", 200)
		.attr("y1", 0)
		.attr("x2", 200)
		.attr("y2", DOMHEIGHT[1])
		.attr("stroke-width", 0.1)
		.attr("stroke-dasharray", 4)
		.attr("opacity", 0.5)
		.attr("stroke", "black");
	acadTrack.append("image")
		.attr("x", 60)
		.attr("y", 50 - 12)
		.attr("xlink:href", acadTrackHeader.icon);
	acadTrack.append("text")
		.attr("x", 90)
		.attr("y", 50)
		.attr('dominant-baseline', 'central')
		.text(acadTrackHeader.text);
	this.path = acadTrack.append("path")
		.attr("d", roundedRect(
			50 + 5, //x
			this.timeScale(acadTrackData[0].start), //y
			150 - 10, //width
			this.timeScale(acadTrackData[0].end) - this.timeScale(acadTrackData[0].start), //height
			10,
			10
			))
			.attr("fill", "rgb(244,244,244)")
			.attr("stroke", "black");
	// debugger;

	acadTrack.append("text")
		.attr("x", 50 + 10)
		.attr("y", this.timeScale(acadTrackData[0].start) + 10)
		.attr('dominant-baseline', 'central')
		.text(acadTrackData[0].text);

	// Current location line
	var timeScaleY = this.timeScale(new Date(YEARS[0], 1, 1))
	var timeIndicatorGroup = this.svg.append("g").attr("class", "timeIndicator");

	timeIndicatorGroup.append("line")
			.attr("x1", 50)
			.attr("y1", timeScaleY)
			.attr("x2", SVG_WIDTH - 30)
			.attr("y2", timeScaleY)
			.attr("stroke-width", 2)
			.attr("stroke", "black");

	this.control = timeIndicatorGroup.append("image")
		.attr("x", SVG_WIDTH - 20)
		.attr("y", timeScaleY - 12)
		.attr("xlink:href", play);


	initListeners.call(this);
};

TimeLineCV.prototype.play = function(){
	this.control.attr("xlink:href", pause);
};

var initListeners = function(){
	this.path.on("click", () => console.log("CLICKED"));
};


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

// Refactor and put into class... first morph heigh, then morph width...
var morphHeight = function(x, y, width, height, radiusTop, radiusBottom){

};

export default TimeLineCV;