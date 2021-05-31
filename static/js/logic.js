// Define url
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var url2 = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Function to determine circle size based on magnitude
function markerSize(magnitude) {
  return magnitude * 5;
}

// Function to determine circle color based on magnitude
function circleColor(magnitude) {
  if ( magnitude < 1) {
    return "#b7f34d";
  }

  else if (magnitude >= 1 && magnitude < 2) {
    return "#e1f34d";
  }

  else if (magnitude >= 2 && magnitude < 3) {
    return "#f3db4d";
  }

  else if (magnitude >= 3 && magnitude < 4) {
    return "#f3ba4d";
  }

  else if (magnitude >= 4 && magnitude < 5) {
    return "#f0a76b";
  }

  else {
    return "#f06b6b";
  }
}

// ===================================================================================================================================
// Perform a GET request to the url (earthquakedata)
d3.json(url, function (data) {
  console.log(data);
  createFeatures(data.features);

});

// Define the function to give each feature a pop up describing the place & time
function createFeatures(earthquakeData) {

  // Create the onEachFeature function to bind a pop-up to each layer
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place + "</h3><hr>" + "<p>Magnitude: " + feature.properties.mag + "</p>");
  }

  // Create the geoJson layer to run the onEachFeature function for every piece of data in the earthquakeData object
  // Also to add circleMakrers to the map
  var earthquakes = L.geoJson(earthquakeData, {

    // Add circleMarkers
    pointToLayer: function(feature, latlng) {
      return L.circleMarker([feature.geometry.coordinates[1],feature.geometry.coordinates[0]], {
        radius: markerSize(feature.properties.mag),
        fillColor: circleColor(feature.properties.mag),
        color: "#000",
        weight: 0.5,
        opacity: 1,
        fillOpacity: 1
      })
    },
    onEachFeature: onEachFeature
  });

  createMap(earthquakes);
}

// ===================================================================================================================================
// Define the createMap function
function createMap(earthquakes) {

  // Creating the different title layers
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
  });

  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/streets-v11",
  accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "dark-v10",
  accessToken: API_KEY
  });

  // Define the base maps
  var baseMaps = {
    "Street Map": streetmap,
    "Grayscale Map": lightmap,
    "Dark Map": darkmap,
    "Satellite Map": satellitemap
  }

  // Create the a new layer for the additional data
  var plates = new L.LayerGroup();

  // Perform a GET reques to the url2 (plates) & add the geoJson to new layer
  d3.json(url2, function (platesData) {
    console.log(platesData);
    L.geoJson(platesData, {
          color: "#ee9c00",
          fillOpacity: 0,
    }).addTo(plates);
  });

  // Define the overlayMaps
  var overlayMaps = {
    "Fault Lines": plates,
    "Earthquakes": earthquakes
  };

  // Creating map object
  var myMap = L.map("map", {
    center: [38.8026, -116.4194],
    zoom: 5,
    layers: [satellitemap, earthquakes, plates]
  });

  // Set up control layer
  L.control.layers(baseMaps, overlayMaps, {
    collapsed:false
  }).addTo(myMap);

  // Set up the legend
  var legend = L.control({position: "bottomright"});

  legend.onAdd = function (myMap) {

      var div = L.DomUtil.create("div", "info legend"),
          magnitude = [0, 1, 2, 3, 4, 5],
          labels = [];

      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < magnitude.length; i++) {
          div.innerHTML +=
              '<i style="background:' + circleColor(magnitude[i]) + '"></i> ' +
              magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
      }

      return div;
  };

  legend.addTo(myMap);
}
