// Run this to receive a png image stream from your drone.

//var arDrone = require('..');
var arDrone = require('ar-drone');
var http    = require('http');

console.log('Connecting png stream ...');

var pngStream = arDrone.createClient().getPngStream();

var lastPng;
pngStream
    .on('error', console.log)
    .on('data', function(pngBuffer) {
        lastPng = pngBuffer;
    });

var server = http.createServer(function(req, res) {
    console.log('Serving ...');
    if (!lastPng) {
        console.log('Serving 1 ...');
        res.writeHead(503);
        res.end('Did not receive any png data yet.');
        return;
    }

    console.log('Serving 2 ...');
    res.writeHead(200, {'Content-Type': 'image/png'});
    
    res.write('--daboundary\nContent-Type: image/png\nContent-length: ' + buffer.length + '\n\n');
    res.write(lastPng);
    res.end(lastPng);
});

server.listen(8080, function() {
    console.log('Serving latest png on port 8080 ...');
});