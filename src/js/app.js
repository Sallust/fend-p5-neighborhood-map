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

	},
	getData: function(category, placeNameList) {
		var categoryArrayName = category + "PlaceArray";
		var categoryLocalStorage = category + "LocalStorage"
		console.log(categoryLocalStorage);
		if (!localStorage[categoryLocalStorage]) {
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

	this.photoUrl = Model.getPhoto(this, placeData.photos);

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
	self.currentSelection = ko.observable(0);

	self.buttonArray = ko.observableArray(['Top Pics', "Food", "Drinks"]);


	self.currentList = ko.observableArray([]);

	self.currentTitle = ko.observable('Top Pics');

	self.clone = ko.computed(function(){
		self.currentList(self.arrayOfArrays()[self.currentSelection()]())
	})

	self.currentFilter = ko.observable('');

	self.categoryToShow = ko.observable('')

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

		self.currentSelection(index);
		self.currentTitle (self.buttonArray()[index]);
		if(this.length == 0) {
			var category = categories[index - 1];
			Model.getData(category, Model[category]());
		}

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