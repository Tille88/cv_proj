var WIDTH = window.innerWidth - 30;
var HEIGHT = window.innerHeight - 30;

var CONFIG = {
	DEBUG: false,
	globe: {
		EARTH_RAD: 20,
		MULTIPLIER: 0.0005,
		WIDTH,
		HEIGHT,

	},
	camera: {
		FOV: 45,
		ASPECT: WIDTH / HEIGHT,
		NEAR: 0.1,
		FAR: 100,
	}
};

export default CONFIG;