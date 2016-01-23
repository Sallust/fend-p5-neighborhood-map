var categories = ["food","drinks", "coffee", "arts"]

var topPicks = ["Jefferson Vineyards", "Monticello", "University of Virginia", "Downtown Mall", "Ash Lawn-Highland"];

var markerIconArray = ['img/top_picks.png', 'img/restaurant.png', 'img/drinks.png', 'img/coffee.png', 'img/arts.png']

/**
* @description Organizes data required for project encapsulates
*/
var Model = {
	resultsLimit: 5, // results limit of Foursquare return
	topPicksPlaceArray: ko.observableArray(), //set as property so variable is available to ViewModel on initial run
	/**
	* @description Called on successful map load, sets up data structured e names
	*/
	init: function() {
		var self = this;

		categories.forEach(function(category){
			var categoryArrayName = category + "PlaceArray";
			self[category] = ko.observableArray(); // will hold array of place names from foursquare API call
			self[categoryArrayName] = ko.observableArray(); //will hold array of place objects
			vm.arrayOfArrays.push(self[categoryArrayName]) //pushes array to ViewModel 'mother array' so vm can easily access data
			if(self[category]().length == 0) {  //only make Foursquare call when array holding foursquare results is empty
				self.getFoursquareList(category)
			}

		})

		this.getData('topPicks', topPicks); //makes call to get Data for Top Picks for initial page load


	},
	/**
	* @description Makes call to get data from localStorage if available, otherwise makes call to get Google data
	* @param {string} category - Name of the category
	* @param {array} placeNameList - Simple array of place names
	*/
	getData: function(category, placeNameList) {
		var categoryArrayName = category + "PlaceArray";
		var categoryLocalStorage = category + "LocalStorage"
		if (!localStorage[categoryLocalStorage]) { // checks only this category to see if exists in Local Storage 
			placeNameList.forEach(function(placeName){
				MapFunc.getInitialData(placeName, Model[categoryArrayName], categoryLocalStorage);
			})
		} else {
			Model.populateFromLocalStorage(category, categoryArrayName); 
		}
	},
	/**
	* @description Makes call to foursquare API, on fail supplies results from an earlier load
	* @param {string} category - Name of the category
	*/
	getFoursquareList: function(category) {
		var foursquareAPI = 'https://api.foursquare.com/v2/venues/explore?client_id=EVYYCGOOZ5MFLVODPTDVDSDZEFQXD4TBNDIGOYTWOT0SQZHJ&client_secret=EWZJ2VJM5HRURCEVMSXQ3LEVVPL1PZXND5RHNAFNOYRTH3JS&v=20150826&ll=38.03,-78.49&section=' + category + '&limit=' + Model.resultsLimit;
		var category = category;
		$.getJSON(foursquareAPI, function(data) {
			for (var i = 0; i < data.response.groups[0].items.length; i++) {
				var resultName = data.response.groups[0].items[i].venue.name;
				Model[category]().push(resultName)
			};
		}).fail(function() {
			Model[category](["Public Fish & Oyster", "Continental Divide", "Albemarle Baking Company", "The Whiskey Jar", "Revolutionary Soup"]);
			alert("Foursquare Issue... Oh No! Showing you the results from 1/22/2016. Try reloading in a minute");
		})
	},
	/**
	* @description Uses name of category to look in LocalStorage and convert string to a useable array
	* @param {string} category - Name of the category
	* @returns {array} category - Array containing placeIDs of one category's places
	*/
	getPlaceIdArray: function(category) {
		var nameStr = category + "LocalStorage"
		if(!localStorage[nameStr]){ //if an error prevented string of placeIDs being saved, possible in rare instances after a Google over query limit issue 
			return []
		} else {
			var str = localStorage[nameStr].slice(0,-1); //remove trailing comma 
			return str.split(',') //generates array from long string of place ID's
		}
	},
	/**
	* @description Called by get Data, uses category's placeID array to access saved PlaceData from google
	* @param {string} category - Name of the category
	* @param {string} categoryArrayName - Array to hold names of foursquare results
	*/
	populateFromLocalStorage: function(category, categoryArrayName) {
		var placeIdArray = Model.getPlaceIdArray(category);
	 		placeIdArray.forEach(function(placeId){
				Model[categoryArrayName].push( new Place(JSON.parse(localStorage[placeId]))) // data is parsed from string to object similar to initial google placeData object 
			})

	},
	/**
	* @description Called on callback of placeData from google, creates placeID: placeData string within local storage, also creates a list of placeIDs for each category
	* @param {object} results - placeData object returned from Google
	* @param {string} category - Name of the category
	*/
	saveInLocalStorage: function(results, category) {
		var resultsString = (JSON.stringify(results))
		localStorage.setItem(results.place_id, resultsString); // stringified placeData set to key
		var placeIdList = ( localStorage[category] || '' ) + results.place_id + ','
		localStorage.setItem( category , placeIdList )
	},
	/**
	* @description Called by place contructor, gets wiki url replacing an empty string if successful
	* @param {object} placeObj - Place Object
	*/
	getWikiUrl: function(placeObj) {
		var place = placeObj;
		var wikiAPI = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + place.name +'&format=json'

		$.ajax({
			url: wikiAPI,
			dataType: "jsonp",
			success: function(data) {
				place.wikiURL(data[3][0]);
			}
		})
	},
	/**
	* @description Called by constructor, gets photoUrl from placeData object or from  LocalStorage
	* @param {}  - 
	* @param {}  - 
	*/
	getPhotoUrl: function(placeObj, photoData) {
		var place = placeObj
		if(!photoData) {
			return "http://lorempixel.com/65/65/nightlife/" + Math.floor(Math.random()*10) ;
		} else if (!photoData[0].getUrl) {
			var keyName = place.placeID + "photo"
			return localStorage[keyName];
		} else {
			var photoUrl = photoData[0].getUrl({'maxWidth':100, 'maxHeight':100})
			this.savePhotoinLocalStorage(photoUrl,place.placeID)
			return photoUrl;
		}
	},
	/**
	* @description 
	* @param {}  - 
	* @param {}  - 
	*/
	savePhotoinLocalStorage: function(photoUrl, placeID) {
		var keyName = placeID + "photo"
		localStorage.setItem( keyName, photoUrl)
	},
	/**
	* @description 
	* @param {}  - 
	* @param {}  - 
	*/
	makeButtonList: function(categoriesArray) {
		var array = ['Top Picks'];
		for (var i = 0; i < categoriesArray.length; i++) {
			var capitalizedCategory = categoriesArray[i][0].toUpperCase() + categoriesArray[i].slice(1);
			array.push(capitalizedCategory);
		};
		return array;
	}
}

var MapFunc = {
	mapOptions: {
		center: {lat: 38.031, lng: -78.486},
    	zoom: 12,
    	disableDefaultUI: true
  	},
	init: function () {
		this.coordinates = new google.maps.LatLng(38.031,-78.486)
		this.map = new google.maps.Map(document.querySelector('#map'), this.mapOptions);
		this.service = new google.maps.places.PlacesService(this.map);
		this.infoWindow = new google.maps.InfoWindow();

	},

	getInitialData: function(placeName, placeDataArray, category) {
		function callback (results, status) {
			//console.log("init" + status)
			if (status == google.maps.places.PlacesServiceStatus.OK) {

				MapFunc.getGoogleDetails(results[0].place_id, placeDataArray, category);
	    	}
    	}
    	var request = {
    		location: this.coordinates,
    		radius: 1000,
    		query: placeName
    	}
		this.service.textSearch(request, callback)
	},
	getGoogleDetails: function(placeID, placeDataArray, category) {
		function detailsCallback (results, status) {
			console.log("detail" + status);
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				placeDataArray.push( new Place(results));
				Model.saveInLocalStorage(results, category)
  			}
		}
		MapFunc.service.getDetails({placeId: placeID}, detailsCallback );
	},
	setInfoWindow: function(marker) {
		this.infoWindow.setContent(marker.infoWindowContent);
		this.infoWindow.open(this.map, marker);
	},
	setInfoWindowContent: function(place) {
		place.marker.infoWindowContent = " <img src='" + place.photoUrl + "' class='infowindow-image' alt='place photo'>" +  "<h4>" + place.name + "</h4>" + "<p>" + place.phone + "</p>" + "<span class='rating'>" + place.rating() + "</span>"  +    "<a href='" + place.website + "'> " + place.website + "</a>" ; //stored as property of marker for easy referenec at call time
	}
  }

var Place = function(placeData) {

	console.log(placeData);
	this.placeID = placeData.place_id;
	this.name = placeData.name;
	this.address = placeData.formatted_address;
	//this.lat = placeData.geometry.location.lat || placeData.geometry.location.lat();
	//this.lng = placeData.geometry.location.lat || placeData.geometry.location.lng();
	this.location = placeData.geometry.location;
	this.rating = ko.observable(placeData.rating || 2.5);

	this.photoUrl = Model.getPhotoUrl(this, placeData.photos);

	this.typesArray = placeData.types;
	this.marker = new google.maps.Marker({
		position: placeData.geometry.location,
		//map: MapFunc.map,
		animation: google.maps.Animation.DROP,
		icon: 'img/top_picks.png'
	})
	this.wikiURL = ko.observable('');

	Model.getWikiUrl(this);

	this.reviewsArray = placeData.reviews;
	this.phone = placeData.formatted_phone_number;
	this.website = placeData.website || "No Website Given";

	this.showReviews = ko.observable(false);

	MapFunc.setInfoWindowContent(this);

	google.maps.event.addListener(this.marker, 'click', function(e) {
		MapFunc.setInfoWindow( this );
	})


}

	//this.marker.infoWindowContent =


var ViewModel = function() {
	var self = this;
	self.arrayOfArrays = ko.observableArray();
	self.arrayOfArrays.push(Model.topPicksPlaceArray);
	self.currentIndex = ko.observable(0);

	self.buttonArray = ko.observableArray(Model.makeButtonList(categories));


	self.currentList = ko.observableArray([]);

	self.currentTitle = ko.observable('Top Picks');

	self.clone = ko.computed(function(){
		self.currentList(self.arrayOfArrays()[self.currentIndex()]())
	})



	self.currentFilter = ko.observable('');

	self.categoryToShow = ko.observable('');


	self.markerIcon = ko.computed(function() {
		return markerIconArray[self.currentIndex()]
	})

	self.filteredPlaces = ko.computed(function() {
		var filter = self.currentFilter().toLowerCase();
		if(!filter && !self.categoryToShow()) {  //if there is nothing being typed in the filter AND no selcted category
			return self.currentList()
		} else if (filter) {
			return ko.utils.arrayFilter(self.currentList(), function(place) {
				return place.name.toLowerCase().startsWith(filter);      //returns true when letters match
			})
		} else {
			return ko.utils.arrayFilter(self.currentList(), function(place) {
				return place.typesArray.indexOf(self.categoryToShow()) != -1  //returns true when search category exists within types array
			})
		}
	})



	self.setCurrentList = function(index, thisArray) {
		self.categoryToShow('');
		self.clearMarkers();

		self.currentIndex(index);

		self.currentTitle (self.buttonArray()[index]);
		if(this.length == 0) {
			var category = categories[index - 1];
			Model.getData(category, Model[category]());
		}
		self.setMarkerIcon();
	}

	self.clearMarkers = function() {
		self.currentList().forEach(function(place) {
			place.marker.setMap(null);
		})
	}
	self.setMarkerIcon = function() {
			console.log(self.markerIcon())
			console.log(self.currentList())
		self.currentList().forEach(function(place) {
			place.marker.setIcon(self.markerIcon());
			console.log(self.markerIcon())
		})
	}
	self.currentMarkers = ko.computed ( function() {
		self.clearMarkers();
		self.filteredPlaces().forEach(function(place) {
			place.marker.setMap(MapFunc.map)
		})
	});

	self.setFocus = function() {
		var marker = this.marker;
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function(){
			marker.setAnimation(null);
		}, 1400);
		MapFunc.setInfoWindow(marker);
	}
	self.uniqueCategories = ko.computed(function(){
		var array = []
		self.currentList().forEach(function(place){
			array = array.concat(place.typesArray);
		})
		return ko.utils.arrayGetDistinctValues(array)
	})

	self.showFilter = ko.observable(false);

	self.slideAway = function(element, index, data) {
		$(element).filter('li').slideUp(function() {
			$(element).remove();
		})
	},
	self.fade = function(element, index, data) {
		$(element).hide().fadeIn();
	}

}

ko.bindingHandlers.fadeIn = {
    init: function(element, valueAccessor) {
        // Initially set the element to be instantly visible/hidden depending on the value
        var value = valueAccessor();
        $(element).toggle(ko.unwrap(value)); // Use "unwrapObservable" so we can handle values that may or may not be observable
    },
    update: function(element, valueAccessor) {
        // Whenever the value subsequently changes, slowly fade the element in or out
        var value = valueAccessor();
        ko.unwrap(value) ? $(element).slideDown("slow") : $(element).slideUp();
    }
};

var vm = new ViewModel();
ko.applyBindings(vm);



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