
const GPlaces = require("google-places-web").default; // instance of GooglePlaces Class;
const fs = require('fs');

const Places = {};
module.exports = Places;

const earthRadius = 6378137;

const MINLAT = -90;
const MAXLAT = 90;
const MINLON = -180;
const MAXLON = 180;

const toRad = (value) => (value * Math.PI) / 180;
const toDeg = (value) => (value * 180) / Math.PI;

Places.computeDestinationPoint = function( {lat, lng}, distance, bearing, radius = earthRadius){

    const delta = distance / radius;
    const theta = toRad(bearing);

    const phi1 = toRad(lat);
    const lambda1 = toRad(lng);

    const phi2 = Math.asin(
            Math.sin(phi1) * Math.cos(delta) +
                Math.cos(phi1) * Math.sin(delta) * Math.cos(theta)
    );

    let lambda2 =
        lambda1 +
        Math.atan2(
            Math.sin(theta) * Math.sin(delta) * Math.cos(phi1),
            Math.cos(delta) - Math.sin(phi1) * Math.sin(phi2)
        );

    let longitude = toDeg(lambda2);
    if (longitude < MINLON || longitude > MAXLON) {
        // normalise to >=-180 and <=180° if value is >MAXLON or <MINLON
        lambda2 = ((lambda2 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
        longitude = toDeg(lambda2);
    }

    return { lat: toDeg(phi2), lng:longitude };
};
      
Places.getPlaceDetails = async function(id){
    let response;
    try {
        response = await GPlaces.details({ placeid: id });
    } catch (error) {
        console.log(error);
    }
    if (response.status != 'OK') return {};
    return response.result;
}

Places.getMapPoints = function(lat,lng,width,height,xStep=5000,yStep=5000){
    const centerPoint={lat:lat,lng:lng};
    let startPoint=Places.computeDestinationPoint(centerPoint,height/2-yStep/2,0);
    startPoint=Places.computeDestinationPoint(startPoint,width/2-xStep/2,-90);
    let points = [];
    
    for(let y=0;y<height;y+=yStep){
        let point=startPoint;
        for(let x=0;x<width;x+=xStep){
            points.push(point);
            point = Places.computeDestinationPoint(point,xStep,90);
        }
        startPoint = Places.computeDestinationPoint(startPoint,yStep,180);
    }
    
    return points

}

 
Places.listPlacesLarge = async function(query, lat, lng, width, height){
    const xStep = 5000;
    const yStep = 5000;
    let radius = Math.sqrt(Math.pow((xStep/2),2)+Math.pow((yStep/2),2))/2;

    const points = Places.getMapPoints(lat, lng, width, height, xStep, yStep);
    console.log("Map points:", points.length, points);

    let places = [];
    let i=1;
    for (let i=0;i<points.length;i++){
        let np = await Places.listPlaces(query,points[i].lat, points[i].lng, radius, 100);
        places = places.concat(np.filter(p1=>places.findIndex(p2=>p2.place_id === p1.place_id)==-1));
        console.log("#"+i,"New places:",np.length,"Total:",places.length);
    }
    
    return places;
  
}

Places.listPlaces = async function( query, lat, long, radius, maxResults=20) {
    let allResults = [];
    while (allResults.length < maxResults) {

        let res;
        try {
            res = await GPlaces.nearbysearch({
              location: lat+','+long, // LatLon delimited by ,
              radius: radius,  // Radius cannot be used if rankBy set to DISTANCE
              type: [], // Undefined type will return all types
              keyword: query,
              pagetoken: res && res.next_page_token ? res.next_page_token : null
            }); 
            
        } catch (error) {
            console.log(error);
        } 

        if (!res) break;
        
        if (res.status != "OK")
            throw new Error("Error reading Google API");

        for(let i=0;i<res.results.length;i++){
            let item=res.results[i];
            let o = await Places.getPlaceDetails(item.place_id);
            allResults.push({
                place_id:item.place_id, 
                name:item.name, 
                vicinity:item.vicinity, 
                phone:o.international_phone_number, 
                location:item.geometry.location.lat+','+item.geometry.location.lng, 
                website:o.website, 
                link:'https://www.google.com/maps/search/?api=1&query=veterinar&query_place_id='+item.place_id
            });
            console.log("   >", item.name, o.international_phone_number);
            if (allResults.length >= maxResults) break;
        }
        
        if (!res.pageToken) break;
    }
    return allResults;
}

Places.writePlaces2File = function (fileName, places) {
    let writeStream = fs.createWriteStream(fileName);

    places.forEach((p=>writeStream.write('"'+p.place_id+'","'+p.name+'","'+p.vicinity+'","'+p.phone+'","'+p.location+'","'+p.website+'","'+p.link+'"\n','UTF-8')))

    writeStream.on('finish', () => {
        console.log('Data written to file '+fileName);
    });
    
    writeStream.end();

}