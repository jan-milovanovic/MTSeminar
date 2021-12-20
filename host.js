const express = require('express');
const fetch = require('node-fetch');  // version: 2.6.1
const app = express();

app.listen(3000, () => console.log('listening at 3000'));
app.use(express.static('public'));  // all of this is accessible to public
app.use(express.json({ limit: '1mb' }));  // json file max size 1mb (enough?)


app.get('/bicikelj', async (request, response) => {
    const url = 'https://api.ontime.si/api/v1/bicikelj/';
    const fetch_url = await fetch(url);
    const json = await fetch_url.json();
    response.json(json);
});

app.get('/busStops', async (request, response) => {
    const url = 'https://api.ontime.si/api/v1/lpp/stops';// /?page_size=1367';
    const fetch_url = await fetch(url);
    const json = await fetch_url.json();
    response.json(json);
})

app.get('/routeShape/:busNo', async (request, response) => {
  const busNo = request.params.busNo;
  const url = `https://api.ontime.si/api/v1/lpp/route-shapes/?groups=${busNo}`;
  const fetch_url = await fetch(url);
  const json = await fetch_url.json();
  response.json(json);
})

app.get('/stopSchedule/:stationID', async (request, response) => {
  const stationID = request.params.stationID;
  const url = `https://api.ontime.si/api/v1/lpp/stops/${stationID}`;
  const fetch_url = await fetch(url);
  const json = await fetch_url.json();
  response.json(json);
})

app.get('/nearbyStations/:lats', async (request, response) => {
  console.log(request.params);
  const lats = request.params.lats.split(",");
  console.log(lats);
  const url = `https://api.ontime.si/api/v1/lpp/stops/?lat_min=${lats[0]}&lat_max=${lats[1]}&lng_min=${lats[2]}&lng_max=${lats[3]}`;
  const fetch_url = await fetch(url);
  const json = await fetch_url.json();
  response.json(json);
})


app.get('/buses', async (request, response) => {
  const url = `https://api.ontime.si/api/v1/lpp/buses/`;
  const fetch_url = await fetch(url, {
    method: 'GET',
    withCredentials: true,
    credentials: 'include',
    headers: {
      'Authorization': 'Api-Key gDabi1WJ.0w79dBzytzW3yCaSrKpoQqT9Y9MJBUSY',
      'Content-Type': 'application/json',
    }
  });
  const json = await fetch_url.json();
  response.json(json);
})