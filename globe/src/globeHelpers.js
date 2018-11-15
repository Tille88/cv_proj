var radians = function(deg){
	return deg * Math.PI * 2 / 360;
};

// https://en.wikipedia.org/wiki/Spherical_coordinate_system
var latLonToSphere = function(lat, lon, rad){
		return {
			x: rad * Math.cos(radians(lat))*Math.cos(radians(lon)),
			y: rad * Math.cos(radians(lat))*Math.sin(radians(lon)),
			z: rad * Math.sin(radians(lat))
		};
};

// https://en.wikipedia.org/wiki/Great-circle_distance
// input in radians, will not be needed for high precision, so haversine not required
var arcLen = function(lat1, lon1, lat2, lon2, radius){
	var m = Math;
	var centralAng = m.acos(m.sin(lat1)*m.sin(lat2) + m.cos(lat1)*m.cos(lat2)*m.cos(m.abs(lon1-lon2)));
	return radius * centralAng;
};


// Just need a linear function for now, later on better easings... D3's will do
var lerp = function(a, b, n) {
  return (1 - n) * a + n * b;
};


export { radians, latLonToSphere, arcLen, lerp };