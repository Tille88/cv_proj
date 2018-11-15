var WIDTH = window.innerWidth - 30;
var HEIGHT = window.innerHeight - 30;
// var WIDTH = test.innerWidth;
// var HEIGHT = test.innerHeight;

var CONFIG = {
	DEBUG: false,
	globe: {
		EARTH_RAD: 1,
		MULTIPLIER: 1E-5,
		WIDTH,
		HEIGHT,
	},
	camera: {
		FOV: 45,
		ASPECT: WIDTH / HEIGHT,
		NEAR: 0.1,
		FAR: 200,
		INIT_POS: {
			x: 2,
			y: 0.6,
			z: 4
		}
	},
	path: {
		ALT_MULT: 5E-1,
		OFFS_MULT: 1E-1
	}
};

export default CONFIG;