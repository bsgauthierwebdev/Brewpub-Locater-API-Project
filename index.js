'use strict';

const searchUrl = "https://api.openbrewerydb.org/breweries";

var brewpubList = null;

function formatQueryParams(params) {
    const queryItems = Object.keys(params)
    .map(key => `${key}=${params[key]}`)
    return queryItems.join("&");
}

//Displays the results of the distance function in the console.
function displayResultsPath(e) {
  let index = $(e.target).data('index');
  console.log('clicked');
  for (let i = 0; i < brewpubList.length; i++) {
    if (!brewpubList[i].latitude) {
        continue;
      }
    console.log(i);
    brewpubList[i].distance = getDistanceFromLatLonInKm(brewpubList[index].latitude, brewpubList[index].longitude, brewpubList[i].latitude, brewpubList[i].longitude);
  };
  brewpubList.sort((a,b) => a.distance - b.distance);
  displaySortedList(brewpubList);
}

//Displays the sorted list on the page
function displaySortedList(brewpubList) {
  $('#results-list').empty();
  for (let i = 0; i < brewpubList.length; i++) {
    //Skips objects with no latitude value
      if (!brewpubList[i].latitude) {
        continue;
      }
    $("#results-list").append(
            `<li><h3><a href="${brewpubList[i].website_url}" target="_blank">${brewpubList[i].name}</a></h3>
            <p>Brewery type: ${brewpubList[i].brewery_type}</p>
            <p>${brewpubList[i].street}</p>
            <p>${brewpubList[i].city}, ${brewpubList[i].state} ${brewpubList[i].postal_code}</p>
            <p>Distance from start: ${brewpubList[i].distance} kilometers</p>
            <input type="submit" value="Start here instead!" data-index="${i}">
            </li>`
     )};
}

//This function was found through research and used to replace the requirement of an API key from Google and their geolocater. (Suggestion came from project evaluator.) Function calculates the distance, in km, of each additional location from the "Let's start here" location
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

//Clears any existing results on the page and displays the results of the search as line items in an unorganized list.
function displayResults(responseJson) {
    $("#results").removeClass("hidden");
    $("#results-list").empty();
    for (let i = 0; i < responseJson.length; i++) {
      //Skips objects with no latitude value
      if (!responseJson[i].latitude) {
        continue;
      }
      responseJson[i].distance = null;
        $("#results-list").append(
            `<li><h3><a href="${responseJson[i].website_url}" target="_blank">${responseJson[i].name}</a></h3>
            <p>Brewery type: ${responseJson[i].brewery_type}</p>
            <p>${responseJson[i].street}</p>
            <p>${responseJson[i].city}, ${responseJson[i].state} ${responseJson[i].postal_code}</p>
            <input type="submit" value="Let's start here!" data-index="${i}">
            </li>`
        )};
      //console.log(responseJson);
      //Quick & Dirty way to house the results so we can call in a separate function.
      brewpubList = responseJson;
    $('#results-list').click('input[type="submit"]', function(e) { displayResultsPath(e); });
      //displayResultsPath(4);
};

//Takes the search parameters, input by the user, and calls the function to display the results on the page.
function getBrewpubList(city, state) {
    const params = {
        by_city: city,
        by_state: state
        };

    const queryString = formatQueryParams(params)
    const url = searchUrl + "?" + queryString;

    console.log(url);

    fetch(url)
    .then(response => response.json())
    .then(responseJson => displayResults(responseJson))
    .catch(err => {
            $("#js-error-message").text(`Something isn't right: ${err.message}`);
        });
}


//Watch Form function, enters the search criteria and calls the Get Brewpub List function
function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    const by_city = $("#js-search-city").val();
    const by_state = $("#js-search-state").val();
    getBrewpubList(by_city, by_state);
  });
}

//Function to make sure the page is loaded.
$(function() {
  console.log('App loaded! Waiting for submit!');
  watchForm();
});