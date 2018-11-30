var TimeTickTrack = function(timeScale, opts){
	if(!opts) { opts = {}; }
	this.timeTicks = null
	this.target = opts.target;
	this.timeScale = timeScale;
	initTimeTicks.call(this, opts.yearArr, opts.margin);

};

var initTimeTicks = function(yearArr, margin){
	this.timeTicks = this.target.append("g").attr("class", "timeTicks").selectAll("text")
	.data(yearArr)
	.enter()
	.append("text")
	.attr("x", margin.left)
	.attr("y", (d) => this.timeScale(new Date(d, 1, 1)))
	.attr("text-anchor", "middle")
	.attr('dominant-baseline', 'hanging')
	.style('font-family', '"kanit", futura, helvetica, sans-serif')
	.text(d => d);
};


export default TimeTickTrack;