#Neighborhood Map Project

* Navigate to dist folder and open index.html to see my project 5 neighborhood Map Project.

* All dependencies are areadly included.

* To run gulp build process fist run `npm install` in root folder (assuming npm is already installed globaly)

* Then run gulp by running gulp `gulp` from cmd line in root folder

* The non-minified version with comments and documentation is in the src folder.

* One list of top picks was initialy provided.

* Remaining place names are from the foursquare API.

* Click category buttons at the top to navagate through these categories.

* Place data is provided by google maps & a call to the wiki API provides the wiki link when available.

* Brief disabled period on buttons is to prevent an error from google due to exceeding 10 query/second.

* Other fallbacks incorporated, notifying user if google fails to provide info.

* An additional search filter by categories is available.

* It is created from the array of place type provided with each place.

* I used gulp to minifify and lint the src code. The production code is in the dist file.

* App stores place data in local storage.

* On open, checks to get localStorage data when available (by individual category)

* Markers vary by individual category.

* Jquery autocomplete allows for autocomplete function

* Used bootstrap for styling and collapsing nav.

* Application components render responsive to size of viewport.

* Application loads from 3 arrays; category names, top Picks, and marker icon locations.

* App is hopefully easily extendable then.
