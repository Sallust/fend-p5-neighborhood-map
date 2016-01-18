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
var categories = ["food","drinks"]

var topPicks = ["Jefferson Vineyards", "Monticello", "University of Virginia", "Downtown Mall", "Ash Lawn-Highland"];

var dynamicModel = {
	arrayOfArrays: ko.observableArray(),
	resultsLimit: 3,
	init: function() {
		console.log("I'm a dynamic Model")
		var parent = this;
		categories.forEach(function(category){
			var categoryResults = ko.observableArray([]);
			//parent.arrayOfArrays.push(categoryArray()); //this is wrong

			var foursquareAPI = 'https://api.foursquare.com/v2/venues/explore?client_id=EVYYCGOOZ5MFLVODPTDVDSDZEFQXD4TBNDIGOYTWOT0SQZHJ&client_secret=EWZJ2VJM5HRURCEVMSXQ3LEVVPL1PZXND5RHNAFNOYRTH3JS&v=20130815&ll=38.03,-78.49&section=' + category + '&limit=' + parent.resultsLimit;
			$.getJSON(foursquareAPI, function(data) {
				for (var i = 0; i < data.response.groups[0].items.length; i++) {
					console.log(data.response.groups[0].items[i].venue.name)
					var resultName = data.response.groups[0].items[i].venue.name;
					categoryResults.push(resultName);
					//send name to google text Search here
				};
				//console.log(data.response.groups[0].items[0].venue.name)
			})


		})
	},




}

var MapFunc = {
	mapOptions: {
		center: {lat: 38.031, lng: -78.486},
    	zoom: 8,
    	disableDefaultUI: true
  	},
	callback: function(results, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			MapFunc.initialData.push( new Place(results[0]));
			MapFunc.getGoogleDetails(results[0].place_id);

    	}
	},
	initialData: ko.observableArray(),
	init: function () {
		this.map = new google.maps.Map(document.querySelector('#map'), this.mapOptions);
		this.service = new google.maps.places.PlacesService(this.map);
		this.infoWindow = new google.maps.InfoWindow();

		//this.initialData = ko.observableArray();

		this.getInitialData(topPicks,this.initialData);

	},

	getInitialData: function(namesArray, placeDataArray) {
		function callback (results, status) {
			console.log(placeDataArray);
			console.log(MapFunc.initialData())
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			placeDataArray.push( new Place(results[0]));
			MapFunc.getGoogleDetails(results[0].place_id);
    		}
    	}

		var parent = this;
		namesArray.forEach(function(placeName) {
			parent.service.textSearch({query: placeName}, callback)
		})

	},
	getGoogleDetails: function(placeID) {
		MapFunc.service.getDetails({placeId: placeID}, MapFunc.googleDetailsCallback );
	},
	setInfoWindow: function(marker) {
		this.infoWindow.setContent(marker.infoWindowContent);
		this.infoWindow.open(this.map, marker);
	},
	googleDetailsCallback: function(results, status){
		if (status == google.maps.places.PlacesServiceStatus.OK) {
    		MapFunc.initialData().forEach(function(place) {
    			if (place.placeID == results.place_id) {
    				//place.phone = results.formatted_phone_number;
    				fancierPlace(place, results);
    			}
    		})

  		}
	},
	getGoogleData: function() {

	}

  }




var Place = function(placeData) {
	//console.log(placeData.types);
	//console.log(placeData);
	this.placeID = placeData.place_id;
	this.name = placeData.name;
	this.address = placeData.formatted_address;
	this.lat = placeData.geometry.location.lat();
	this.lng = placeData.geometry.location.lng();
	this.location = placeData.geometry.location;
	this.photoUrl = placeData.photos[0].getUrl({'maxWidth':65, 'maxHeight':65});
	this.marker = new google.maps.Marker({
			position: placeData.geometry.location,
			map: MapFunc.map,
			animation: google.maps.Animation.DROP
		})
	this.wikiURL = ko.observable('');

	var wikiAPI = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + this.name +'&format=json'

	var self = this;
	$.ajax({
			url: wikiAPI,
			dataType: "jsonp",
			success: function(data) {
				self.wikiURL(data[3][0]);
			}
		})
	this.reviewsArray = ko.observableArray([]);
	this.phone = ko.observable('');
	this.website = ko.observable('');




	//ko.computed(function() {
	//	return "<h2>" + this.name + "</h2>"
	//},this);

	google.maps.event.addListener(this.marker, 'click', function(e) {
		MapFunc.setInfoWindow( this );
	})
}

var fancierPlace = function (place, detailsData) {
	place.reviewsArray(detailsData.reviews);
	//console.log(detailsData.reviews)
	place.phone(detailsData.formatted_phone_number)
	place.website(detailsData.website)// =  || "No Website Given";
	//place.marker.infoWindowContent = "<h2>" + place.name + "</h2>" + "<p>" + place.website + "</p>"; //stored as property of marker for easy referenec at call time
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
	var self = this;
	MapFunc.init();
	dynamicModel.init();

	self.currentList = ko.computed(function() {
		return MapFunc.initialData();
	})


	//ko.observableArray(MapFunc.initialData());

	self.currentFilter = ko.observable('');

	self.filteredPlaces = ko.computed(function() {
		var filter = self.currentFilter().toLowerCase();
		if(!filter) {
			return self.currentList()
		} else {
			return ko.utils.arrayFilter(self.currentList(), function(place) {
				return place.name.toLowerCase().startsWith(filter);      //returns true when letters match
			})
		}
	})
	self.setCurrentList = function() {

	}

}

/*
	var self = this;

	self.listOfLists = ko.observableArray();
	self.listOfLists.push(MapFunc.initialData())

	console.log(MapFunc.initialData());

	self.currentList = ko.observableArray();
	self.currentList(MapFunc.initialData());


	//self.currentList = ko.computed(function() {
	//	console.log(MapFunc.initialData())
	//	return MapFunc.initialData();//self.listOfLists()[0];
	//})

	MapFunc.init();
	dynamicModel.init();



	self.currentFilter = ko.observable('');

	self.filteredPlaces = ko.computed(function() {
		var filter = self.currentFilter().toLowerCase();
		if(!filter) {
			return self.currentList()
		} else {
			return ko.utils.arrayFilter(self.currentList(), function(place) {
				return place.name.toLowerCase().startsWith(filter);      //returns true when letters match
			})
		}
	})


	self.currentMarkers = ko.computed ( function() {
		self.currentList().forEach(function(place) {
			place.marker.setMap(null);
		})
		self.filteredPlaces().forEach(function(place) {
			place.marker.setMap(MapFunc.map)
		})
	});

	self.catList = ko.observableArray([]);
	console.log("I'm here")

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
	self.setFocus = function() {
		var marker = this.marker;
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){
			marker.setAnimation(null);
		}, 1400);
		MapFunc.setInfoWindow(marker);
	}
	self.setCurrentList = function() {

	}

	self.placeList = ko.observableArray([]);

	topPicks.forEach(function(placeName) {
		//self.textSearch({query:placeName}, function() {
		})


}
//This now is called by google map success callback
//ko.applyBindings(new ViewModel())

//[Math.floor(this.clickCount / 10)

*/