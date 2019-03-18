const express = require('express')
const app = express()
const port = 3000
const path = require("path");
var arDrone = require('ar-drone');
require('ffmpeg')
var client = arDrone.createClient();
var pngStream = client.getPngStream();
var fs = require('fs');
const mongo = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017';

var db, collection;
app.use(express.static('public'));
app.use(express.static('files'));
app.use(express.static(__dirname + 'public'));

app.get('/', function (req, res) {
    //configure all initialization stuff here

    // pngStream
    //     .on('error', console.log)
    //     .on('data', function (pngBuffer) {
    //         res.write('--daboundary\nContent-Type: image/png\nContent-length: '
    //             + pngBuffer.length + '\n\n');
    //         res.write(pngBuffer);
    //     });


    mongo.connect(url, (err, client) => {
        if (err) {
            db = client.db('drone_data')
            //const collection = db.collection('ar-drone')
            collection = db.createCollection('drone-flight')
          console.error(err)
          return
        }
        //...
      })
    client.config('general:navdata_demo', 'TRUE');
    client.config('general:navdata_options', 777060865);
    client.on('navdata', function (navdata) {
    try {

        var period = 5000; // Save navdata every 5s.
        var lastFrameTime = 0;
        var now = (new Date()).getTime();
        if (now - lastFrameTime > period) {
           lastFrameTime = now;

            console.log(navdata.gps);
            collection.insertOne({name: 'DataAt'+lastFrameTime, 
                    data: navdata, timestamp: lastFrameTime}, (err, result) => {
                        console.log(err);
            })

        }
            //console.log(navdata.gps.latitude+", "+navdata.gps.longitude);
        } catch (error) {
            console.log(error.message);
        }
    });

    res.sendFile(path.join(__dirname + '/index.html'));
});

app.get('/start', function (req, res) {
    res.send('This is the first page');
});

app.get('/land', function (req, res) {
    client.stop(0)
    client.land();
    console.log("Drone Landing")
    return "Drone landing ";
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
           var image_url = '/files/DroneImage'+lastFrameTime+'.png';
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

app.get('/view', function (req, res) {
    //res.send('This is the view page');
    res.sendFile(path.join(__dirname + '/viewPhotos.html'));
    var fs = require('fs');


    if (process.argv.length <= 2) {
        console.log("Usage: " + __filename + " files");
        process.exit(-1);
    }

    //var path = process.argv[2];
    var path = "files";
    var filenames = [];

    fs.readdir(path, function(err, items) {
        console.log(items);

        for (var i=0; i<items.length; i++) {
            console.log(items[i]);
            filenames.add(i)
        }
    });
});


app.listen(port, function () {
    console.log(`Example app listening on port ${port}`);
});

