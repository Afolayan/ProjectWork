const express = require('express')
const app = express()
const port = 3000
const path = require("path");
var arDrone = require('ar-drone');
var client = arDrone.createClient();
var pngStream = client.getPngStream();


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname+'/index.html'));
    //configure all initialization stuff here

    pngStream
    .on('error', console.log)
    .on('data', function(pngBuffer) {
        res.write('--daboundary\nContent-Type: image/png\nContent-length: ' 
        + pngBuffer.length + '\n\n');
        res.write(pngBuffer);
    });

    client.config('general:navdata_demo', 'FALSE');
    client.config('general:navdata_options', 777060865);
    client.on('navdata', function(navdata){
        try {
            console.log(navdata.gps);
            console.log(navdata.gps.latitude+", "+navdata.gps.longitude);
        } catch (error) {
            console.log(error.message);
        }
    });
});

app.get('/start', function(req, res) {
    res.send('This is the first page');
});

app.get("/url", function(req, res, next) {
    res.json(["Tony","Lisa","Michael","Ginger","Food"]);
    console.log('Request type: ', req.method);
});
   
app.get('/land', function(req, res) {
    client.land();
});
   
app.get('/takeoff', function(req, res) {
    console.log("takeoff--> ");
   client.takeoff();
});

app.listen(port, function(){
    console.log('Example app listening on port ${port}');
});

