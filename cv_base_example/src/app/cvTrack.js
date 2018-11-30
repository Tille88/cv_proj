// Need sidelines and header, other class for entryboxes...

var FONT_FAMILY =  '"kanit", futura, helvetica, sans-serif';


var CvTrack = function(trackModel, opts){
	if(!opts) { opts = {}; }

	this.trackGroup = opts.target.append("g")
		.attr("class", `${trackModel.id}-track`)
		.style('font-family', FONT_FAMILY);
	this.margin = opts.margin;
	this.headerHeight = opts.headerHeight;
	this.width = opts.width;
	initLines.call(this);
	initHeader.call(this, trackModel.header.icon, trackModel.header.text);

};

var initLines = function(){
	this.trackGroup.append("line")
		.attr("x1", this.margin.left)
		.attr("y1", this.margin.top)
		.attr("x2", this.margin.left)
		.attr("y2", 1000)
		.attr("stroke-width", 1)
		.attr("stroke-dasharray", 4)
		.attr("opacity", 0.5)
		.attr("stroke", "black");


	this.trackGroup.append("line")
		.attr("x1", this.margin.left + this.width)
		.attr("y1", this.margin.top)
		.attr("x2", this.margin.left + this.width)
		.attr("y2", 1000)
		.attr("stroke-width", 0.1)
		.attr("stroke-dasharray", 4)
		.attr("opacity", 0.5)
		.attr("stroke", "black");

};

var initHeader = function(icon, text){
	this.trackGroup.append("image")
		.attr("x", this.margin.left + this.width/15 )
		.attr("y", this.headerHeight/2 - 12)
		.attr("xlink:href", icon);
	this.trackGroup.append("text")
		.attr("x", this.margin.left + this.width/15 * 4)
		.attr("y", this.headerHeight/2)
		.attr('dominant-baseline', 'central')
		.text(text);
};

export default CvTrack;