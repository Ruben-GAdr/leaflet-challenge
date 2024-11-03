// Define the urls for the GeoJSON data
var earthquakeUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Create the map
var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 4
});

// Define tile layers for the map
var lightMap = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
});

lightMap.addTo(myMap);

// Create layer for earthquakes
var earthquakesLayer = L.layerGroup();

// Retrieve and add the earthquake data to the map
d3.json(earthquakeUrl).then(function (data) {
    function mapStyle(feature) {
        return {
            opacity: 1,
            fillOpacity: 1,
            fillColor: mapColor(feature.geometry.coordinates[2]),
            color: "black",
            radius: mapRadius(feature.properties.mag),
            stroke: true,
            weight: 0.5
        };
    }

    function mapColor(depth) {
        switch (true) {
            case depth > 90:
                return "firebrick";
            case depth > 70:
                return "orangered";
            case depth > 50:
                return "orange";
            case depth > 30:
                return "gold";
            case depth > 10:
                return "greenyellow";
            default:
                return "paleturquoise";
        }
    }

    function mapRadius(mag) {
        if (mag === 0) {
            return 1;
        }
        return mag * 4;
    }

    // Add earthquake data to the earthquakes layer
    L.geoJson(data, {
        pointToLayer: function (feature, latlng) {
            return L.circleMarker(latlng);
        },
        style: mapStyle,
        onEachFeature: function (feature, layer) {
            layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place + "<br>Depth: " + feature.geometry.coordinates[2]);
        }
    }).addTo(earthquakesLayer);

    // Add the earthquakes layer to the map
    earthquakesLayer.addTo(myMap);

    // Add the legend with colors to correlate with depth
    var legend = L.control({ position: "bottomright" });
    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend"),
            depth = [-10, 10, 30, 50, 70, 90];

        for (var i = 0; i < depth.length; i++) {
            div.innerHTML +=
                '<i style="background:' + mapColor(depth[i] + 1) + '"></i> ' + depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);
});


