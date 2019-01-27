const express = require('express')
const app = express()
const port = 3000
const path = require("path");
var arDrone = require('ar-drone');
require('ffmpeg')
var client = arDrone.createClient();
var pngStream = client.getPngStream();
var fs = require('fs');

app.use(express.static('public'));

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
    //configure all initialization stuff here

    // pngStream
    //     .on('error', console.log)
    //     .on('data', function (pngBuffer) {
    //         res.write('--daboundary\nContent-Type: image/png\nContent-length: '
    //             + pngBuffer.length + '\n\n');
    //         res.write(pngBuffer);
    //     });


    client.config('general:navdata_demo', 'TRUE');
    client.config('general:navdata_options', 777060865);
    client.on('navdata', function (navdata) {
        try {
            console.log(navdata.gps);
            //console.log(navdata.gps.latitude+", "+navdata.gps.longitude);
        } catch (error) {
            console.log(error.message);
        }
    });
});

app.get('/start', function (req, res) {
    res.send('This is the first page');
});

app.get('/land', function (req, res) {
    client.stop(0)
    client.land();
    console.log("Drone Landing")
});

app.get('/takeoff', function (req, res) {
    console.log("takeoff--> ");
    client.takeoff();
    console.log("Drone taking off.")
});
// This router is sending a command to the drone
// to calibrate. Causes the drone to fully
// rotate and balance
app.get('/calibrate', function (req, res) {
    client.calibrate(0);
    console.log("Drone Calibrating");
});

// This router is sending a command to the drone 
// to cancel all existing commands. Important if
// turning clockwise and you want to stop for
// example
app.get('/hover', function (req, res) {
    client.stop(0);
    console.log("Hover");
});

// Placeholder function that will later capture 
// the photos
app.get('/photos', function (req, res) {
    console.log("Drone Taking Pictures");    
   var pngStream = client.getPngStream();
   var period = 2000; // Save a frame every 2000 ms.
   var lastFrameTime = 0;
   pngStream
     .on('error', console.log)
     .on('data', function(pngBuffer) {
        var now = (new Date()).getTime();
        if (now - lastFrameTime > period) {
           lastFrameTime = now;
           var image_url = '/public/DroneImage'+lastFrameTime+'.png';
           fs.writeFile(__dirname + image_url, pngBuffer, function(err) {
           if (err) {
             console.log("Error saving PNG: " + err);
           } else {
             console.log("Saved Frame");  
          }
      });
     }
  });
});

// This router is sending a command to the drone 
// to turn clockwise
app.get('/clockwise', function (req, res) {
    client.clockwise(0.5);
    console.log("Drone Turning Clockwise");
});
app.listen(port, function () {
    console.log('Example app listening on port ${port}');
});
