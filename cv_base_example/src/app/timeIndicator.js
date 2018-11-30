import play from '../../assets/ui/icons/contr/play.svg';
import pause from '../../assets/ui/icons/contr/pause.svg';


// Constructor
var TimeIndicator = function(timeScale, opts){
	if(!opts) { opts = {}; }
	this.timeScale = timeScale || null;
	this.currY = null;
	this.target = opts.target;
	this.timeIndicatorLine = null;
	this.control = null;
	initTimeLine.call(this, opts.yearArr[0], opts.margin);
};


var initTimeLine = function(startYear, margin){
	this.currY = this.timeScale(new Date(startYear, 1, 1));
	var timeIndicatorGroup = this.target.append("g").attr("class", "timeIndicator");

	this.timeIndicatorLine = timeIndicatorGroup.append("line")
			.attr("x1", margin.left)
			.attr("y1", this.currY)
			.attr("x2", margin.right)
			.attr("y2", this.currY)
			.attr("stroke-width", 2)
			.attr("stroke", "black");

	this.control = timeIndicatorGroup
		.append("image")
		.attr("x", margin.right)
		.attr("y", this.currY - 12)
		.attr("xlink:href", play);

};


TimeIndicator.prototype.play = function(){
	this.control.attr("xlink:href", pause);
};

TimeIndicator.prototype.getCurrTimeLoc = function(){
	return this.currY;
};

export default TimeIndicator;