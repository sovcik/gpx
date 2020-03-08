const Places = require('./src/places');

const GPlaces = require("google-places-web").default; // instance of GooglePlaces Class;
require('dotenv').config();

// Setup
GPlaces.apiKey = process.env.APIKEY;
GPlaces.debug = false; // boolean;

function testDestPont(){
    let o = Places.computeDestinationPoint({lat:50.076544,lng:14.429795},500,90);  
}

function testListPlaces(){
    Places.listPlaces("veterinar", 50.076544, 14.429795, 50000, 25)
    .then(r=>console.log("LIST PLACES>>>",r,"<<<END"));
}

function testListPlacesLarge(){
    Places.listPlacesLarge( "veterinar", 50.076544, 14.429795, 10000, 10000)
    .then(r=>{
        Places.writePlaces2File('places-test.csv',r);
        console.log("Done");
    })
}

function listPlacesLarge(){
    Places.listPlacesLarge( "veterinar", 50.076544, 14.429795, 100000, 100000)
    .then(r=>{
        Places.writePlaces2File('places.csv',r);
        console.log("Done");
    })
}



//result=Places.getMapPoints(50.076544,14.429795,100000, 100000,10000,10000);
//console.log(result);

//testListPlaces();
//testListPlacesLarge();

listPlacesLarge();

