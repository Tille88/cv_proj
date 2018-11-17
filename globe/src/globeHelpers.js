/**
 * Helper functions for the globe
 */

/**
 * Converts degrees to radians
 * @param {number} deg degrees
 * @returns radians
 */
var radians = function(deg){
	return deg * Math.PI * 2 / 360;
};

/**
 * Converts lat lon and radius of sphere to location on spheric surface.
 * https://en.wikipedia.org/wiki/Spherical_coordinate_system
 * @param {number} lat latitude
 * @param {number} lon longitude
 * @param {number} rad radius
 * @returns {object} object containing x, y, z fields
 */
var latLonToSphere = function(lat, lon, rad){
		return {
			x: rad * Math.cos(radians(lat))*Math.cos(radians(lon)),
			y: rad * Math.cos(radians(lat))*Math.sin(radians(lon)),
			z: rad * Math.sin(radians(lat))
		};
};

/**
 * Calculates the distance between two points along the arc on the surface of the earth
 * Lat lon, etc. in degrees
 * Not requiring high precision, so haversine function is overkill
 * https://en.wikipedia.org/wiki/Great-circle_distance
 * @param {number} lat1 latitude1
 * @param {number} lon1 longitude1
 * @param {number} lat2 latitude2
 * @param {number} lon2 longitude2
 */
var arcLen = function(lat1, lon1, lat2, lon2, radius){
	var m = Math;
	lat1 = radians(lat1); lon1 = radians(lon1); lat2 = radians(lat2); lon2 = radians(lon2);
	var centralAng = m.acos(m.sin(lat1)*m.sin(lat2) + m.cos(lat1)*m.cos(lat2)*m.cos(m.abs(lon1-lon2)));
	return radius * centralAng;
};


// Just need a linear function for now, later on better easings... D3's will do
/**
 * Linear interpolation function
 * e.g. lerp(0,10,0.5) => 5
 * @param {number} a start value of interpolation
 * @param {number} b end value of interpolation
 * @param {number} n fraction of the interpolation to return
 */
var lerp = function(a, b, n) {
  return (1 - n) * a + n * b;
};

// Returns an array containing values similar to Pyhon's range-function
// Stealing the underscore implementation
var range = function(start, stop, step){
	if (stop == null) {
		stop = start || 0;
		start = 0;
	}
	step = step || 1;
	var length = Math.max(Math.ceil((stop - start) / step), 0);
	var range = Array(length);
	for (var idx = 0; idx < length; idx++, start += step) {
		range[idx] = start;
	}
	return range;
};

export { radians, latLonToSphere, arcLen, lerp, range };