// TODO: can we change type of map?
// map with singular shade = singular route color

// TODO: Remove when realtime buses are implemented
let busInfo = new L.circle([46.051318465073795, 14.479674887201202], {radius: 20, color: "black", fillOpacity: 0.8}).addTo(map);
busInfo.bindPopup("<b>registracija:</b> LJ-LPP-439" +
               "<br><b>pot:</b> KOLODVOR" + 
               "<br><b>Kapaciteta:</b> 80" +
               "<br><b>Zasedenost:</b> 32" +
               "<br><b>Hitrost:</b> 53");
               /* if its possible to display this data, then uncomment
               "<br><br><b>Lokacija:</b> ZOO" +
               "<br><b>Naslednja postaja:</b> Večna pot" +
               "<br><b>Prihod do naslednje postaje:</b> 2 minuti");*/


// popup anchor => point from which the popup should open relative to the iconAnchor
var leafIcon = L.Icon.extend({ options: { iconSize: [22,33], popupAnchor: [-3, -76] } }); 
var greenIcon = new leafIcon({ iconUrl: 'Untitled-1.svg' });
var greenIcon2 = new leafIcon({ iconUrl: 'Untitled-2.svg' });

const busIcon = new L.Icon({ iconUrl: 'bus-icon.svg', iconSize: [30, 30] });


function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }


async function markerOnClick(e)
{
    stationID=e.target._tooltip._content.split("_")[0];
    getSchedule();

    while(schedule == "<b>PRIHODI AVTOBUSOV</b><br><br>") 
    {
        console.log("waiting data");
        await sleep(100);
    }

    if(dataMissing)
    {
        alert("Podatki za postajo trenutno manjkajo. Poskustie znova.");
        return;
    }

    e.target.bindPopup(schedule).openPopup();
    e.target.unbindPopup();
    schedule="<b>PRIHODI AVTOBUSOV</b><br><br>";
    dataMissing=true;
}


function updateRealTimeBusLocation()  // call once, infinite loop
{
    fetch("/buses")
        .then(res => res.json())
        .then(data =>
            {
                console.log(data.results);
                layerGroupRealTime.clearLayers();
                for (result in data.results)
                {
                    // TODO: dodaj bus ikonco za busek (can do rotation)
                    // circle over circle, da ikona ostane centrirana?
                    // potrebno narediti 2x circlemarker... optimizacija??

                    // test circleMarker (setLatLng klice event move)
                    // namesto da za vsako izpraznemo layer in ga naredimo na novo??
                    
                    //let busLocation = new L.circle([data.results[result].lat, data.results[result].lng], {radius: 20, color: 'green', fillOpacity: 0.9,});

                    // add marker side popup on hover to display register plate of bus
                    let busLocation = new L.marker([data.results[result].lat, data.results[result].lng], {icon: busIcon});
                    busLocation.addTo(layerGroupRealTime);
                }
            })
        .catch(e => console.log("Error : " + e))
}

async function callRealTimeBus()
{
    while(true)
    {
        updateRealTimeBusLocation();
        await sleep(3000);
    }
}

callRealTimeBus();


// real time bus
/*
callRealTime();

async function callRealTime()
{
    while(true)
    {
        updateBusLocation(); 
        await sleep(1000);
    }
}

function updateBusLocation()
{
    fetch("https://data.lpp.si/api/bus/bus-details")
        .then(response => response.json())
        .then(async data => 
        {
            console.log(data);
        })
        .catch(e => console.log("updateBusLocation: " + e))
}
*/



/* Represents fake buses driving, latitude and longtitude are picked up from *route shape*

busRTExample()

async function busRTExampleDraw(busshape)
{
    while(true)
    {
        for(let i = 1; i < busshape.length; i++)
        {
            let busEx = new L.circle([busshape[i].lat, busshape[i].lng], {radius: 50}).addTo(map);
            await sleep(500);
            map.removeLayer(busEx);
        }
        for(let i = busshape.length-1; i > 0; i--)
        {
            let busEx = new L.circle([busshape[i].lat, busshape[i].lng], {radius: 50}).addTo(map);
            await sleep(500);
            map.removeLayer(busEx);
        }
    }
}

async function busRTExampleFetch(busNo)
{
    // if "let" instead of "var", there is an error..?
    var buspot = await fetch('https://api.ontime.si/api/v1/lpp/route-shapes/?groups=' +  busNo)
                        .then(res => res.json())
                        .then(data => buspot = data)

    busRTExampleDraw(buspot.results[0].trips[0].shape);
}

async function busRTExample()
{
    busRTExampleFetch(18);
    busRTExampleFetch(14);
    busRTExampleFetch(6);
    busRTExampleFetch(27);
    busRTExampleFetch(9);
}
*****************************************************************************************************/

function cur_bus()
{
    bus = document.getElementById('bus').value;
    activeBuses.add(bus);
}

const getDataSingular = () => fetch('/busStops')
    .then(response => response.json())
    .then(data =>
        {
            layerGroup.clearLayers();
            activeBuses.clear();
            activeBuses.add(bus);

            for (result in data.results)
            { 
                if (data.results[result].route_groups.includes(bus))
                {   
                    let marker = new L.marker([data.results[result].lat,data.results[result].lng],{icon: greenIcon2}).on('click', markerOnClick).addTo(layerGroup)
                    marker.bindTooltip(data.results[result].stop_id + "_" + data.results[result].name);
                    markerList.push(marker);
                }
            }
        })
    .catch(e => console.log(e))


const getDataMultiple = () => fetch('/busStops')
    .then(response => response.json())
    .then(data =>
        {
            for (result in data.results)
            { 
                if (data.results[result].route_groups.includes(bus))
                {   
                    let marker = new L.marker([data.results[result].lat,data.results[result].lng],{icon: greenIcon2}).on('click', markerOnClick).addTo(layerGroup)
                    marker.bindTooltip(data.results[result].stop_id + "_" + data.results[result].name);
                    markerList.push(marker);
                }
            }
        })
    .catch(e => console.log(e))


const getShape1 = () => fetch(`/routeShape/${bus}`)
    .then(response => response.json())
    .then(data =>
        {
            let data_len = data.results[0].trips[0].shape.length;
            let latlngs = [];

            for(let i = 0; i < data_len; i++)
                latlngs.push([data.results[0].trips[0].shape[i].lat, data.results[0].trips[0].shape[i].lng]);
            
            var polyline = L.polyline(latlngs, {color: "#" + ((1<<24)*Math.random() | 0).toString(16), opacity: 0.6,weight: 10, smoothFactor: 1}).bindPopup("Linija: "+bus).addTo(layerGroup);
            map.fitBounds(polyline.getBounds());
        } )
    .catch(e => console.log(e))


// shape for the other way
const getShape2 = () => fetch(`/routeShape/${bus}`)
    .then(response => response.json())
    .then(data =>
        {
            let data_len = data.results[0].trips[1].shape.length;
            let latlngs = [];
            
            for(let i = 0; i < data_len; i++)
                latlngs.push([data.results[0].trips[1].shape[i].lat, data.results[0].trips[1].shape[i].lng]);

            var polyline = L.polyline(latlngs, {color: "#" + ((1<<24)*Math.random() | 0).toString(16), opacity: 0.6, weight: 10, smoothFactor: 1}).bindPopup("Linija: "+bus).addTo(layerGroup);   
            map.fitBounds(polyline.getBounds());
        

        } )
    .catch(e => console.log(e))


const getSchedule = () => fetch(`/stopSchedule/${stationID}`)
    .then(response => response.json())
    .then(data =>
        {
            let allArrivalTimes = [];
            let routes = [];
            for (timetable in data.timetable)
            {
                if (activeBuses.has(data.timetable[timetable].group))
                {
                    routes.push(data.timetable[timetable].name);
                    let arrivalTimes = [];

                    for (arrival in data.timetable[timetable].arrivals)
                    {
                        // TODO: HERE (fetch 1 stop before the hour and up to 1 hour ahead) -- add UI with full schedule
                        let hour = data.timetable[timetable].arrivals[arrival].hour;
                        if (hour < 10) { hour = 0 + "" + hour; }

                        let minute = data.timetable[timetable].arrivals[arrival].minute;
                        if (minute < 10) { minute = 0 + "" + minute; }

                        arrivalTimes.push(hour + ":" + minute);
                    }
                    allArrivalTimes.push(arrivalTimes);
                };
            }    
            if (routes.length && allArrivalTimes.length) { dataMissing=false; }

            schedule = "<b>PRIHODI AVTOBUSOV</b><br><br>";
            for (index in routes)
            {
                schedule+="<b>SMER - " + routes[index] + "</b><br>";

                for (i in allArrivalTimes[index])
                    schedule += allArrivalTimes[index][i]+"<br>";

                schedule += "<br>";
            }
        } )
    .catch(e => console.log(e))


const getBikes = () => fetch("/bicikelj")
.then(response => response.json())
.then(data =>
    {
        
        // clear map if not clicked in
        if (!bicikeljRunning)
        {
            bicikeljRunning = true;
            
            for (bikeLoc in data.results)
            {
                //console.log(data.results[bikeLoc].total_stands * 0.8)

                const total_stands = data.results[bikeLoc].total_stands;
                const avail_bikes = data.results[bikeLoc].available_bikes;

                const c = L.circle([data.results[bikeLoc].lat,data.results[bikeLoc].lng],{radius: 20,color: 'black'}).bindPopup(
                    "Število prostih koles: "+ data.results[bikeLoc].available_bikes+"<br>Število prostih mest: "+data.results[bikeLoc].available_stands);
            
                if (avail_bikes >= (0.8 * total_stands))
                    c.options.color = 'green';

                else if (avail_bikes <= (0.2 * total_stands))
                    c.options.color = 'red';

                else
                    c.options.color = 'orange';

                    
                c.addTo(layerGroupBikes);
            }
        } else {
            bicikeljRunning = false;
            layerGroupBikes.clearLayers();
        }
    })
    .catch(e => console.log(e))


// TODO: nearby stations ne vsebujejo schedule
const nearPostaje = async () => fetch(`/nearbyStations/${lat_min},${lat_max},${lng_min},${lng_max}`)
.then(response => response.json())
.then(async data => 
    {   
        for (postaja in data.results)
        {
            for (buskee in data.results[postaja].route_groups)
                activeBuses.add(data.results[postaja].route_groups[buskee])

            L.marker([data.results[postaja].lat,data.results[postaja].lng],{icon: greenIcon}).addTo(layerGroup);
        }

        for (let item of activeBuses.values())
        {
            await sleep(700)
            bus=item;
            getShape1()
            getShape2()
        } 
    })
    .catch(e => console.log(e));


// clear map when not LPP button is not active
function setBusData()
{
    if (!lppRunning) {
        lppRunning = true;
    } else {
        lppRunning = false;
        layerGroup.clearLayers();
        activeBuses.clear();
    }
}


let lat_max;
let lat_min;
let lng_max;
let lng_min;

navigator.geolocation.getCurrentPosition(success,console.log)
function success(pos)
{
    lat_max = pos.coords.latitude + 0.0067
    lat_min = pos.coords.latitude - 0.0067
    lng_max = pos.coords.longitude + 0.0067
    lng_min = pos.coords.longitude - 0.0067
    L.marker([pos.coords.latitude,pos.coords.longitude]).bindPopup("Tvoja Lokacija").openPopup().addTo(map);

    getBtnSosed.addEventListener('click', nearPostaje);
}
    
const getBtnBicikelj = document.getElementById('btnBicikeLJ');
const getBtnLpp = document.getElementById('btnLPP');
//const dropdown = document.getElementsByClassName("dropdown-btn"); // CHECK: ok zbrisat?
const getBtn = document.getElementById('getBtn');
const getBtnAdd = document.getElementById('getBtnAdd');
const getBtnSosed = document.getElementById('getBtnSosed');

let dataMissing=true;
let schedule="<b>PRIHODI AVTOBUSOV</b><br><br>";
let bus;
let activeBuses = new Set();

let stationID = 0; 
let bicikeljRunning = false;
let lppRunning = false;
let markerList = [];

getBtn.addEventListener('click', cur_bus);
getBtn.addEventListener('click', getDataSingular);
getBtn.addEventListener('click', getShape1);
getBtn.addEventListener('click', getShape2);
getBtnAdd.addEventListener('click', cur_bus);
getBtnAdd.addEventListener('click', getDataMultiple);
getBtnAdd.addEventListener('click', getShape1);
getBtnAdd.addEventListener('click', getShape2);

getBtnLpp.addEventListener('click', setBusData);

getBtnBicikelj.addEventListener('click', getBikes);