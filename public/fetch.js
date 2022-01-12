// TODO: implement bus reporting

// popup anchor => point from which the popup should open relative to the iconAnchor
let iconSetting = L.Icon.extend({ options: { iconSize: [22,33], popupAnchor: [0, 0] } }); 
//let nearStationIcon = L.Icon.extend({ options: { iconUrl: 'Untitled-1.svg', iconSize: [22, 33], popupAnchor: [-3, 76] } });
let nearStationIcon = new iconSetting({ iconUrl: 'imgs/blackMarker.svg' });
let stationIcon = new iconSetting({ iconUrl: 'imgs/greenMarker.svg' });

const busIcon = new L.Icon({ iconUrl: 'imgs/bus-icon.svg', iconSize: [20, 20] });
// TODO: change url to wanted icon
const busRotationIcon = new L.Icon({ iconUrl: 'imgs/bus-icon.svg', iconSize: [30, 30], opacity: 0.6 });
let running = false;

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }


async function markerOnClick(e)
{
    stationID=e.target._tooltip._content.split("_")[0];
    getSchedule();
    let counter = 0;

    while(schedule == "<b>PRIHODI AVTOBUSOV</b><br><br>") 
    {
        await sleep(100);
        console.log("waiting data");

        if (counter++ > 50) // 5 sekund
            break;
    }

    if(dataMissing)
    {
        alert("Podatki za postajo trenutno manjkajo. Prosim poskusite znova.");
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
                //console.log(data.results);
                layerGroupRealTime.clearLayers();
                for (result in data.results)
                {
                    const resultLat = data.results[result].lat;
                    const resultLng = data.results[result].lng;
                    const resultRotation = parseInt(data.results[result].rotation);

                  //  console.log(resultRotation);

                    // add register plate on hover?
                    // npm install leaflet-rotatedmarker ne deluje (bottom)
                    // https://github.com/bbecquet/Leaflet.RotatedMarker#api
                    //let busRotationLocation = new L.marker([resultLat, resultLng], {icon: busRotationIcon});
                    let busLocation = new L.marker([resultLat, resultLng], {icon: busIcon});

                    //busRotationLocation.addTo(layerGroupRealTime);
                    busLocation.addTo(layerGroupRealTime);
                }
            })
        .catch(e => console.log("Error : " + e))
}


async function callRealTimeBus()
{
    // layerGroupRealTime ima cudno razporejen layer zato je tezko narediti optimalno??
    //setBusLocations(); 
    while(this.running)
    {
        updateRealTimeBusLocation();
        await sleep(3000);  
    }
    layerGroupRealTime.clearLayers();
}

callRealTimeBus();


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
                    let marker = new L.marker([data.results[result].lat,data.results[result].lng],{icon: stationIcon}).on('click', markerOnClick).addTo(layerGroup)
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
                    let marker = new L.marker([data.results[result].lat,data.results[result].lng],{icon: stationIcon}).on('click', markerOnClick).addTo(layerGroup)
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
           console.log(data.timetable);

            let allArrivalTimes = [];
            let routes = [];
            for (timetable in data.timetable)
            {
                if (activeBuses.has(data.timetable[timetable].group))
                {
                    routes.push(data.timetable[timetable].name);

                    const date = new Date();
                    const dateHours = date.getHours();
                    const dateMinutes = date.getMinutes();
                    console.log(dateHours + ' : ' + dateMinutes);
                    
                    const dataArrival = data.timetable[timetable].arrivals;
                    const arrivalLen = dataArrival.length;
                    let arrivalIndex; // if null, no routes

                    // find arrival index, where first bus arrives after our current time
                    for (arrival in dataArrival)
                    {
                        const dataH = dataArrival[arrival].hour;
                        const dataM = dataArrival[arrival].minute;

                        if (dataH > dateHours || dataH == dateHours && dataM > dateMinutes)
                        { arrivalIndex = parseInt(arrival); break; }  // arrivalIndex = index za naslednji avtobus
                    }

                    // get up to 5 upcoming bus arrival times
                    let arrivalTimes = [];

                    for (let i = 0; i < 5; i++)
                    {
                        if (arrivalIndex+i < arrivalLen)
                        {
                            let hour = dataArrival[arrivalIndex+i].hour;
                            let minute = dataArrival[arrivalIndex+i].minute;

                            if (hour < 10) { hour = 0 + "" + hour; }
                            if (minute < 10) { minute = 0 + "" + minute; }
    
                            arrivalTimes.push(hour + ":" + minute);
                        }
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

            L.marker([data.results[postaja].lat,data.results[postaja].lng],{icon: nearStationIcon}).addTo(layerGroup);
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

function runningSwap()
{
    this.running = !this.running;
}
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
const liveBtn = document.getElementById('liveBtn');

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
liveBtn.addEventListener('click', runningSwap);
liveBtn.addEventListener('click', callRealTimeBus);



getBtnLpp.addEventListener('click', setBusData);

getBtnBicikelj.addEventListener('click', getBikes);