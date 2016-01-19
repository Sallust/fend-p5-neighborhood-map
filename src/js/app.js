var categories = ["food","drinks"]

var topPicks = ["Jefferson Vineyards", "Monticello", "University of Virginia", "Downtown Mall", "Ash Lawn-Highland"];

var Model = {
	resultsLimit: 3,
	topPicksPlaceArray: ko.observableArray(),
	init: function() {
		var parent = this;
		var self = this;

		if (!localStorage.testing1) {
			topPicks.forEach(function(placeName){
				MapFunc.getInitialData(placeName, self.topPicksPlaceArray,'topPicsLocalStorage');
			})
		} else {
			self.populateFromLocalStorage('topPics', 'topPicksPlaceArray');
		}




		categories.forEach(function(category){
			console.log(category);
			var categoryArrayName = category + "PlaceArray"
			self[categoryArrayName] = ko.observableArray();
			vm.arrayOfArrays.push(parent[categoryArrayName])
			if (!localStorage.testing1) {  //if no localStorage Exists
				self.getFoursquareList(category, self[categoryArrayName])
			} else {
				self.populateFromLocalStorage(category, categoryArrayName)
				//each category...
			}


/*
			var foursquareAPI = 'https://api.foursquare.com/v2/venues/explore?client_id=EVYYCGOOZ5MFLVODPTDVDSDZEFQXD4TBNDIGOYTWOT0SQZHJ&client_secret=EWZJ2VJM5HRURCEVMSXQ3LEVVPL1PZXND5RHNAFNOYRTH3JS&v=20130815&ll=38.03,-78.49&section=' + category + '&limit=' + parent.resultsLimit;
			$.getJSON(foursquareAPI, function(data) {
				for (var i = 0; i < data.response.groups[0].items.length; i++) {
					console.log(data.response.groups[0].items[i].venue.name)
					var resultName = data.response.groups[0].items[i].venue.name;
					MapFunc.getInitialData(resultName,parent[categoryArrayName],categoryArrayName)
				};
				//console.log(data.response.groups[0].items[0].venue.name)
			})

          */
		})

	},
	getFoursquareList: function(category, categoryArrayName) {
		var foursquareAPI = 'https://api.foursquare.com/v2/venues/explore?client_id=EVYYCGOOZ5MFLVODPTDVDSDZEFQXD4TBNDIGOYTWOT0SQZHJ&client_secret=EWZJ2VJM5HRURCEVMSXQ3LEVVPL1PZXND5RHNAFNOYRTH3JS&v=20130815&ll=38.03,-78.49&section=' + category + '&limit=' + Model.resultsLimit;
		var categoryLocalStorage = category + "LocalStorage"
		$.getJSON(foursquareAPI, function(data) {
			for (var i = 0; i < data.response.groups[0].items.length; i++) {
				console.log(data.response.groups[0].items[i].venue.name)
				var resultName = data.response.groups[0].items[i].venue.name;
				MapFunc.getInitialData(resultName, categoryArrayName,categoryLocalStorage)
			};
				//console.log(data.response.groups[0].items[0].venue.name)
		})

	},
	populateFromLocalStorage: function(category, categoryArrayName) {
		var self = Model;
		var placeIdArray = self.getPlaceIdArray(category);
			//console.log(placeIdArray);
	 		placeIdArray.forEach(function(placeId){
				console.log(placeId);
				//console.log(localStorage[placeId]);
				console.log(JSON.parse(localStorage[placeId]));
				self[categoryArrayName].push( new Place(JSON.parse(localStorage[placeId])))
				//parent.getLocalStorageData(placeId, parent.initialData);
			})

	},
	getPlaceIdArray: function(category) {
		var nameStr = category + "LocalStorage"
		var str = localStorage[nameStr].slice(0,-1);
		return str.split(',')
	}


}

var MapFunc = {
	mapOptions: {
		center: {lat: 38.031, lng: -78.486},
    	zoom: 8,
    	disableDefaultUI: true
  	},
	initialData: ko.observableArray(),
	init: function () {
		this.map = new google.maps.Map(document.querySelector('#map'), this.mapOptions);
		this.service = new google.maps.places.PlacesService(this.map);
		this.infoWindow = new google.maps.InfoWindow();

		//this.initialData = ko.observableArray();
		var parent = this;




		if(!localStorage.testing1) {
			localStorage.topPics = ''
			topPicks.forEach(function(placeName){
				parent.getInitialData(placeName, parent.initialData,'topPicsLocalStorage');
			})
		} else {

			//Model.populateFromLocalStorage('topPics', MapFunc.initialData)
			var placeIdArray = parent.getPlaceIdArray();
			//console.log(placeIdArray);
	 		placeIdArray.forEach(function(placeId){
				console.log(placeId);
				//console.log(localStorage[placeId]);
				console.log(JSON.parse(localStorage[placeId]));

				parent.initialData.push( new Place(JSON.parse(localStorage[placeId])))
				//parent.getLocalStorageData(placeId, parent.initialData);
			})

			topPicks.forEach(function(placeName){
				//parent.getInitialData(placeName, parent.initialData);

			})

		}





	},

	getInitialData: function(placeName, placeDataArray, category) {
		function callback (results, status) {
			//console.log("init" + status)
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			localStorage.setItem('testing1', 'test')

			var test = (JSON.stringify(results[0]))
			localStorage.setItem(results[0].place_id, test);
			console.log(category);
			console.log(localStorage[category])
			var placeIdList = ( localStorage[category] || '' ) + results[0].place_id + ','
			localStorage.setItem( category , placeIdList )
			//placeDataArray.push( new Place(results[0]));
			MapFunc.getGoogleDetails(results[0].place_id, placeDataArray);
    		}
    	}

		//var parent = this;
		//namesArray.forEach(function(placeName) {
			this.service.textSearch({query: placeName}, callback)
		//})

	},
	getLocalStorageData: function(placeID, placeDataArray) {


	},
	getPlaceIdArray: function() {
		var str = localStorage.topPicsLocalStorage.slice(0,-1);
		return str.split(',')
	},
	getGoogleDetails: function(placeID, placeDataArray) {
		function detailsCallback (results, status) {
			console.log("detail" + status);
			if (status == google.maps.places.PlacesServiceStatus.OK) {
				placeDataArray.push( new Place(results))
  			}
		}
		MapFunc.service.getDetails({placeId: placeID}, detailsCallback );
	},
	setInfoWindow: function(marker) {
		this.infoWindow.setContent(marker.infoWindowContent);
		this.infoWindow.open(this.map, marker);
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
	//this.lat = placeData.geometry.location.lat || placeData.geometry.location.lat();
	//this.lng = placeData.geometry.location.lat || placeData.geometry.location.lng();
	this.location = placeData.geometry.location;
	this.photoUrl = placeData.photos ? ( placeData.photos.getUrl ? placeData.photos[0].getUrl({'maxWidth':65, 'maxHeight':65}) : "http://lorempixel.com/65/65/city" ) : "http://lorempixel.com/65/65/city";
	this.typesArray = placeData.types;
	this.marker = new google.maps.Marker({
			position: placeData.geometry.location,
			//map: MapFunc.map,
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
	this.reviewsArray = placeData.reviews;
	this.phone = placeData.formatted_phone_number;
	this.website = placeData.website || "No Website Given";

	//this.reviewsArray = ko.observableArray([]);
	//this.phone = ko.observable('');
	//this.website = ko.observable('');


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

var ViewModel = function() {
	var self = this;
	self.arrayOfArrays = ko.observableArray();
	self.arrayOfArrays.push(Model.topPicksPlaceArray);


	self.currentList = ko.observableArray();
	//self.currentList(MapFunc.initialData());

	//self.currentList = ko.computed(function() {
		//return self.arrayOfArrays()[0]();
	//})
	self.clone = ko.computed(function(){
		self.currentList(Model.topPicksPlaceArray())
	})

	//ko.observableArray(MapFunc.initialData());

	self.currentFilter = ko.observable('');

	self.localStorageClone = ko.computed(function(){
		self.arrayOfArrays().forEach(function(list){

			//localStorage[list] = []
			//list().forEach(function(place){
			//	var placeIdList = (localStorage[list()] || '' ) + place.place_id + ',';
			//	localStorage[list()] = placeIdList;
				//localStorage.setItem([list], placeIdList )
				//localStorage[list]

			//})
		})
		//self.currentList().forEach(function(place) {
			//console.log(ko.toJS(place))

		//console.log(ko.JSON(MapFunc.initialData()))
		//localStorage.initialData = JSON.stringify(MapFunc.initialData());
		//console.log(localStorage.initialData);
		//self.arrayOfArrays().forEach(function(list) {
		//	list()
		//})
		//localStorage.initialData = JSON.stringify();

		//localStorage.foodData = JSON.stringify();
		//localStorage.dinksData = JSON.stringify()
	})

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
		self.clearMarkers();
		self.currentList ( this );

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


}

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