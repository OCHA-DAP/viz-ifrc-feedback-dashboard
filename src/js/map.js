let locationsData;
let healthzonesList = [];
let map;

function generateMap() {
  map = L.map('map',
    {
      maxZoom : 10,
      minZoom: 4
    }); 
  map.setView([-0.461, 29.530], 7); //-2.712/23.244 -4.579, 21.887
  L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/traffic-day-v2/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW1hZG91MTciLCJhIjoib3NhRnROQSJ9.lW0PVXVIS-j8dGaULTyupg', { 
    attribution: '<a href="http://mapbox.com">Mapbox</a>'
  }).addTo(map);

  var myFeatureGroup = L.featureGroup().addTo(map).on("click", updateDashoardFromMap);
  var marker, healthZone ;

  var locs = [];
  locationsData.forEach( function(element, index) {
    if (healthzonesList.includes(element.health_zone)) {
      var obj = {
        name : element.health_zone,
        lat  : element.lat,
        lon  : element.lng 
      }
      locs.push(obj);
    }
  });

  locs.forEach( function(element, index) {
    marker = createMarker(element).addTo(myFeatureGroup).bindPopup(element.name);
    healthZone = element.name ;
    marker.healthZone = healthZone ;
  });
}//generateMap

function createMarker(d) {
  return L.marker([d.lat, d.lon], {
      icon: L.icon({
          // className: 'circle',
          iconUrl: '/assets/healthsite-marker-red.png',
          iconSize: [38,50],
          iconAnchor: [20, 60]
      })
  }) 
}//createMarker

function updateDashoardFromMap() {
  // body... 
}//updateDashoardFromMap
