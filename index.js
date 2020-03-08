const Places = require('./src/places');
const GPlaces = require("google-places-web").default; // instance of GooglePlaces Class;
require('dotenv').config();

// Setup
GPlaces.debug = false; // boolean;

function listPlacesLarge(query, lat, lng, width, height, fileName){
    Places.listPlacesLarge(query, lat, lng, width, height)
    .then(r=>{
        Places.writePlaces2File(fileName, r);
        console.log("Done");
    })
}

GPlaces.apiKey = process.env.APIKEY;  // Google Places API key - get your from https://developers.google.com/places/web-service/get-api-key

const query = "restaurant"; // what to search for
const latitude = 50.076544; // area center point latitude
const longtitude = 14.429795; // area center point longtitude
const area_width = 1000; // area width in meters 
const area_height = 1000; // area height in meters 
const fileName = "places.csv"; // save results to CSV

listPlacesLarge(query, latitude, longtitude, area_width, area_height, fileName);

