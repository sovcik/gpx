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

var args = process.argv.slice(2);

let showUsage = args.length==0;

let query, latitude, longtitude, area_height, area_width, fileName

for(let i=0;i<args.length;i++){
    let o = args[i].split(':');
    if (o.length == 2){
        switch (o[0]) {
            case '-q':
                query = o[1];
                break;
            case '-lat':
                latitude = parseFloat(o[1]);
                break;
            case '-lng':
                longtitude = parseFloat(o[1]);
                break;
            case '-w':
                area_width = parseInt(o[1]);
                break;
            case '-h':
                area_height = parseInt(o[1]);
                break;
            case '-o':
                fileName = o[1];
                break;
            case '-k':
                GPlaces.apiKey = o[1];
                break;
    
            default:
                console.log("Error: unknown option '"+o[0]+"'");
                showHelp=true;
        }
    } else {
        showUsage=true;
    }
    if (showUsage) break;
}

showUsage = showUsage 
    || typeof(query) !== "string" 
    || typeof(latitude) != "number" 
    || typeof(longtitude) != "number" 
    || typeof(area_width) != "number" 
    || typeof(area_height) != "number" 
    || typeof(fileName) != "string";

if (showUsage){
    console.log("Usage: node index.js [arguments]");
    console.log("Arguments:");
    console.log(" -q   - query");
    console.log(" -lat - area center point latitude");
    console.log(" -lng - area center point longtitude");
    console.log(" -w   - area width (in meters)");
    console.log(" -h   - area height (in meters)");
    console.log(" -o   - output tab-delimited CSV file name");
    console.log(" -k   - Google Places API key - can be also set via APIKEY env variable");
    console.log();
    console.log("Example for listing restaurants from area 1000m x 1000min Prague city center:\n node index.js -q:restaurant -lat:50.076544 -lng:14.429795 -w:1000 -h:1000 -o:restaurants.csv");
} else {
    listPlacesLarge(query, latitude, longtitude, area_width, area_height, fileName);
}

