import acad from '../../assets/ui/icons/acad/school.svg';
import heart from '../../assets/ui/icons/priv_hobbies/heart.svg';
import prof from '../../assets/ui/icons/prof/briefcase.svg';
import attach from '../../assets/ui/icons/attach/paperclip.svg';
import loc from '../../assets/ui/icons/loc/map-marker.svg';
import CvTrack from './cvTrack';


var TRACK_WIDTH = 130;

// Set up data model here
var cvData = [
	{
		id: "pers",
		header: {
			text: "Personal",
			icon: heart // Will later be same as logo for site...
		},
		trackData: []
	},
	{
		id: "prof",
		header: {
			text: "Professional",
			icon: prof
		},
		trackData: []
	},
	{
		id: "acad",
		header: {
			text: "Academic",
			icon: acad
		},
		trackData: [
			{start:new Date(1989,1,1), end:new Date(1991,12,30), text:"Fill text..."}
		]
	},
	{
		id: "attach",
		header: {
			text: "Attachments",
			icon: attach
		},
		trackData: []
	},
	{
		id: "loc",
		header: {
			text: "Location",
			icon: loc
		},
		trackData: []
	},
];



// Constructor - need to initialize headers + tracks...
var CvTracks = function(timeScale, opts){
	if(!opts) { opts = {}; }
	this.tracks = [];
	this.target = opts.target;
	this.margin = opts.margin;
	var self = this;
	cvData.forEach(function(dataMod, i){

		self.tracks.push(new CvTrack(dataMod, {
			target: self.target,
			headerHeight: 60,
			margin: {
				left: self.margin.left + TRACK_WIDTH * i,
				top: self.margin.top
			},
			width: dataMod.id === "loc" ? TRACK_WIDTH - 30 : TRACK_WIDTH
		}));

	});

};



export default CvTracks;