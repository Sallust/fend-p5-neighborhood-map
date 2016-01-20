var categories = ["food","drinks"]

var topPicks = ["Jefferson Vineyards", "Monticello", "University of Virginia", "Downtown Mall", "Ash Lawn-Highland"];

var Model = {
	resultsLimit: 5,
	topPicksPlaceArray: ko.observableArray(),
	init: function() {
		var parent = this;
		var self = this;

		this.getData('topPicks', topPicks);
		categories.forEach(function(category){
			var categoryArrayName = category + "PlaceArray";

			self[category] = ko.observableArray(); //simple list of place names from foursquare
			self[categoryArrayName] = ko.observableArray(); //future home of place data
			vm.arrayOfArrays.push(parent[categoryArrayName])
			if(self[category]().length == 0) {
				self.getFoursquareList(category, self[categoryArrayName])
			}

		})

		/*
		if (!localStorage.testing1) {
			topPicks.forEach(function(placeName){
				MapFunc.getInitialData(placeName, self.topPicksPlaceArray,'topPicsLocalStorage');
			})
		} else {
			self.populateFromLocalStorage('topPics', 'topPicksPlaceArray');
		}
	*/     /*
		for (var i = 1; i <= categories.length; i++) {
			var category = categories[i-1]
			var categoryArrayName = category + "PlaceArray"
			self[categoryArrayName] = ko.observableArray();
			vm.arrayOfArrays.push(parent[categoryArrayName])
			if (!localStorage.testing1) {  //if no localStorage Exists
				setTimeout(function(category, categoryArrayName) {
					console.log(category)
					self.getFoursquareList(category, self[categoryArrayName])
				},4000 * i, category, categoryArrayName)

			} else {
				self.populateFromLocalStorage(category, categoryArrayName)

			}

		}; */
/*
		categories.forEach(function(category){
			console.log(category);
			var categoryArrayName = category + "PlaceArray"
			self[categoryArrayName] = ko.observableArray();
			vm.arrayOfArrays.push(parent[categoryArrayName])
			if (!localStorage.testing1) {  //if no localStorage Exists
				setTimeout(function() {
					self.getFoursquareList(category, self[categoryArrayName])
				},3000)

			} else {
				self.populateFromLocalStorage(category, categoryArrayName)

			}

		}) */

	},
	getData: function(category, placeNameList) {
		console.log("I'm getting Data.. vroom vroom ")
		console.log(placeNameList)
		var categoryArrayName = category + "PlaceArray";
		var categoryLocalStorage = category + "LocalStorage"
		console.log(categoryArrayName);
		if (!localStorage.categoryLocalStorage) {
			placeNameList.forEach(function(placeName){
				MapFunc.getInitialData(placeName, Model[categoryArrayName], categoryLocalStorage);
			})
		} else {
			Model.populateFromLocalStorage(category, categoryArrayName);
		}
	},
	getFoursquareList: function(category, categoryArrayName) {
		var foursquareAPI = 'https://api.foursquare.com/v2/venues/explore?client_id=EVYYCGOOZ5MFLVODPTDVDSDZEFQXD4TBNDIGOYTWOT0SQZHJ&client_secret=EWZJ2VJM5HRURCEVMSXQ3LEVVPL1PZXND5RHNAFNOYRTH3JS&v=20130815&ll=38.03,-78.49&section=' + category + '&limit=' + Model.resultsLimit;
		var categoryLocalStorage = category + "LocalStorage";
		var category = category;
		$.getJSON(foursquareAPI, function(data) {
			for (var i = 0; i < data.response.groups[0].items.length; i++) {
				console.log(data.response.groups[0].items[i].venue.name + " " +  category)
				var resultName = data.response.groups[0].items[i].venue.name;
				console.log(category);
				Model[category]().push(resultName)
				//MapFunc.getInitialData(resultName, categoryArrayName,categoryLocalStorage)
			};
		})

	},
	populateFromLocalStorage: function(category, categoryArrayName) {
		var self = Model;
		var placeIdArray = self.getPlaceIdArray(category);
			//console.log(placeIdArray);
	 		placeIdArray.forEach(function(placeId){
				//console.log(placeId);
				//console.log(localStorage[placeId]);
				//console.log(JSON.parse(localStorage[placeId]));
				self[categoryArrayName].push( new Place(JSON.parse(localStorage[placeId])))
				//parent.getLocalStorageData(placeId, parent.initialData);
			})

	},
	getPlaceIdArray: function(category) {
		var nameStr = category + "LocalStorage"
		if(!localStorage[nameStr]){
			return []
		} else {
			var str = localStorage[nameStr].slice(0,-1);
			return str.split(',')
		}

	},
	saveInLocalStorage: function(results, category) {
		localStorage.setItem('testing1', 'test')

		var resultsString = (JSON.stringify(results))
		localStorage.setItem(results.place_id, resultsString);
		//console.log(category);
		//console.log(localStorage[category])
		var placeIdList = ( localStorage[category] || '' ) + results.place_id + ','
		localStorage.setItem( category , placeIdList )
		//placeDataArray.push( new Place(results[0]));
	},
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
	getPhoto: function(placeObj, photoData) {
		var place = placeObj
		if(!photoData) {
			return "http://lorempixel.com/65/65/city";
		} else if (!photoData[0].getUrl) {
			var keyName = place.placeID + "photo"
			return localStorage[keyName];
		} else {
			var photoUrl = photoData[0].getUrl({'maxWidth':100, 'maxHeight':100})
			this.savePhotoinLocalStorage(photoUrl,place.placeID)
			return photoUrl;
		}
	},
	savePhotoinLocalStorage: function(photoUrl, placeID) {
		var keyName = placeID + "photo"
		localStorage.setItem( keyName, photoUrl)
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
	}
  }

var Place = function(placeData) {
	//console.log(placeData.types);
	//console.log(placeData);
	this.placeID = placeData.place_id;
	this.name = placeData.name;
	this.address = placeData.formatted_address;
	//this.lat = placeData.geometry.location.lat || placeData.geometry.location.lat();
	//this.lng = placeData.geometry.location.lat || placeData.geometry.location.lng();
	this.location = placeData.geometry.location;

	this.photoUrl = Model.getPhoto(this, placeData.photos);
	//this.photoUrl = placeData.photos ? ( placeData.photos.getUrl ? placeData.photos[0].getUrl({'maxWidth':65, 'maxHeight':65}) : "http://lorempixel.com/65/65/city" ) : "http://lorempixel.com/65/65/city";

	this.typesArray = placeData.types;
	this.marker = new google.maps.Marker({
		position: placeData.geometry.location,
		//map: MapFunc.map,
		animation: google.maps.Animation.DROP
	})
	this.wikiURL = ko.observable('');

	Model.getWikiUrl(this);

	this.reviewsArray = placeData.reviews;
	this.phone = placeData.formatted_phone_number;
	this.website = placeData.website || "No Website Given";

	this.showReviews = ko.observable(false);

	//this.reviewsArray = ko.observableArray([]);

	google.maps.event.addListener(this.marker, 'click', function(e) {
		MapFunc.setInfoWindow( this );
	})
}

	//place.marker.infoWindowContent = "<h2>" + place.name + "</h2>" + "<p>" + place.website + "</p>"; //stored as property of marker for easy referenec at call time


var ViewModel = function() {
	var self = this;
	self.arrayOfArrays = ko.observableArray();
	self.arrayOfArrays.push(Model.topPicksPlaceArray);
	self.currentSelection = ko.observable(0);
	//self.showReviews = ko.observable(false);

	self.buttonArray = ko.observableArray(['Top Pics', "Food", "Drinks"]);


	self.currentList = ko.observableArray([]);

	self.currentTitle = ko.observable('Top Pics');

	self.clone = ko.computed(function(){
		self.currentList(self.arrayOfArrays()[self.currentSelection()]())
	})

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

	self.setCurrentList = function(index, thisArray) {
		self.clearMarkers();
		if(this.length == 0){
			var category = categories[index - 1];
			Model.getData(category, Model[category]());
		}
		self.currentSelection(index);


		//self.currentList ( self.arrayOfArrays()[index]() );
		self.currentTitle (self.buttonArray()[index]);
		console.log(this.length)
	}

	self.clearMarkers = function() {
		self.currentList().forEach(function(place) {
			place.marker.setMap(null);
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
	self.test = function() {
		console.log("I'm working!")
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