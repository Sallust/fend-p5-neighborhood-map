var initialCats = [
	{
		clickCount: 0,
		name: 'Tabby',
		imgSrc: 'img/tabby.jpg',
		imgAttribution: 'http://www.flickr.com',
		nicknames: ["The Cutest!!", "Almost as Cute", "As cute as Unicorn Smiles", "The Cat"]
	},
	{
		clickCount: 0,
		name: 'Sleepy',
		imgSrc: 'img/sleepy.jpg',
		imgAttribution: 'http://www.flickr.com',
		nicknames: ["Super the sleepiest!!!", "Almost as Cute", "As cute as Unicorn Smiles", "The Cat"]
	},
	{
		clickCount: 0,
		name: 'Lioness',
		imgSrc: 'img/rawr.jpg',
		imgAttribution: 'http://www.flickr.com',
		nicknames: ["King of Kute", "Cub with the Cute", "As cute as Unicorn Smiles", "The Cat"]
	},
	{
		clickCount: 0,
		name: 'Sarah Rebecca Elizabeth Windsor',
		imgSrc: 'img/lawncat.jpg',
		imgAttribution: 'http://www.flickr.com',
		nicknames: ["Her Royal Meowjesty", "Princess of Purrdom", "As cute as Unicorn Smiles", "The Cat"]
	},
	{
		clickCount: 0,
		name: 'The Donald',
		imgSrc: 'img/fatcat.jpg',
		imgAttribution: 'http://www.flickr.com',
		nicknames: ["Present!", "R U Still here?", "Hair for days", "The Cat"]
	}
]

var topPicks = ["Jefferson Vineyards", "Monticello", "University of Virginia", "Downtown Mall", "Ash Lawn-Highland"];

var MapFunc = {
	map: null,
	mapOptions: {
		center: {lat: 38.031, lng: -78.486},
    	zoom: 8,
    	disableDefaultUI: true
  	},
	callback: function(results, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
      	console.log(results);
    	}
	},
	init: function () {
		this.map = new google.maps.Map(document.querySelector('#map'), this.mapOptions);
		var service = new google.maps.places.PlacesService(this.map);

		service.textSearch({query: "The White House"}, this.callback)


	},
	test: function() {
		console.log("I'm bear")
		function callback(results, status) {
			console.log(status);
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      console.log("I'm alive");
    }
  }

		var service = new google.maps.places.PlacesService(this.map);
		service.nearbySearch({quhery: "The White House"}, callback)

	}


}


var Place = function(placeName) {
	console.log(placeName);
	var self = this;
	//var service;
	var request = { query: placeName}

	//service = new google.maps.places.PlacesService(map);
	function callback(results, status) {
		console.log(results)
	}

  	//service.textSearch(request, callback);
  	//console.log(service)
/*
	var callback = function(results, status) {
		console.log("I'm here")
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				console.log(results)
	  		}
		}
*/

	//service.textSearch(request, callback);

}

var Cat = function(data) {
	this.clickCount = ko.observable(data.clickCount);
	this.name = ko.observable(data.name);
	this.imgSrc = ko.observable(data.imgSrc);
	this.imgAttribution = ko.observable(data.imgAttribution);

	this.catLevelArray = ["infant","toddler", "pre-teen", "annoying teen", "teen", "adolescent", "adult", "dead...awkward. You totally killed it"]

	this.catLevel = ko.computed(function() {
		return this.catLevelArray[Math.floor(this.clickCount()/10)];
	},this)

	this.nicknames = ko.observable(data.nicknames);
}

var ViewModel = function() {
	MapFunc.init();

	var self = this;
	console.log("sup");

	self.catList = ko.observableArray([]);



	initialCats.forEach(function(catItem){
		self.catList.push( new Cat(catItem) );
	});

	self.currentCat = ko.observable( self.catList()[1] );

	this.incrementCounter = function() {
		this.clickCount(this.clickCount() + 1);
	};
	self.setCurrentCat = function() {
		//console.log(self.currentCat())
		self.currentCat ( this );
	};
	this.mapOptions = {
		center: {lat: 38.031, lng: -78.486},
    	zoom: 8,
    	disableDefaultUI: true
  	};
	//this.map = null;
	//self.initializeMap = function() {
	self.placeList = ko.observableArray([]);

	//this.service = new google.maps.places.PlacesService(self.map);
/*
	topPicks.forEach(function(placeName){
		self.placeList.push( new Place(placeName))
	}); */
	function pleaseWork() {
		console.log("Mana from heaven")
	}
	var request = {
        query: "The White House"
      };
      //console.log(self.service.textSearch)


	topPicks.forEach(function(placeName) {
		//self.textSearch({query:placeName}, function() {
			console.log("Please god")
		})

		//console.log("brought to you by insanity")

	//pleaseWork();

	this.callback = function(results, status) {
		console.log(status);
	}
	//}
}
//This now is called by google map success callback
//ko.applyBindings(new ViewModel())

//[Math.floor(this.clickCount / 10)