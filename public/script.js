var southWest = L.latLng(46.2554,14.0295),
    northEast = L.latLng(45.8350,15.1076),
    bounds = L.latLngBounds(northEast,southWest);

var map = L.map('map',{
    maxZoom: 18,
    minZoom: 12,
}).setView([46.04980, 14.49764], 13);

/*
var osm = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery Â© <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiYWRkZXJhbGxhZG1pcmFsIiwiYSI6ImNrdm1hbDA5aTdhMm8ybnF3cHo2aGJtdGwifQ.FLHtXjT17mLykRffakbr-g'
}).addTo(map);
map.setMaxBounds(bounds);
*/


var Jawg_Dark = L.tileLayer('https://{s}.tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token={accessToken}', {
	attribution: '<a href="http://jawg.io" title="Tiles Courtesy of Jawg Maps" target="_blank">&copy; <b>Jawg</b>Maps</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	minZoom: 0,
	maxZoom: 22,
	subdomains: 'abcd',
	accessToken: 'f3K6cegku1FTkIKD2mXNBTjXaCWHWzVX7jtdhfJeWYH1S6TNi3wnO8GbIJkV76jf'
}).addTo(map);
map.setMaxBounds(bounds);


var layerGroup = L.layerGroup().addTo(map);
var layerGroupBikes = L.layerGroup().addTo(map);
var layerGroupRealTime = L.layerGroup().addTo(map);

/**
 * Side navigation
 */
/* Loop through all dropdown buttons to toggle between hiding and showing its dropdown content - This allows the user to have multiple dropdowns without any conflict */
var dropdown = document.getElementsByClassName("dropdown-btn");
var i;

for (i = 0; i < dropdown.length; i++) {

  dropdown[i].addEventListener("click", function() {
  this.classList.toggle("active");
  var dropdownContent = this.nextElementSibling;
  try {
    if (dropdownContent.style.display === "block") { 
        dropdownContent.style.display = "none";
    } else {
      dropdownContent.style.display = "block";
    }
  } catch (e) {
      console.log(e);
  }});
}