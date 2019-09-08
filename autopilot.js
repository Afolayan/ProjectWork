var arDrone = require('ar-drone');
var client = arDrone.createClient();

client.takeoff();
client.on('navdata', console.log);
client
    .after(5000, function () {
        this.clockwise(0.5);
    })
    .after(3000, function () {
        this.animate('flipLeft', 15);
    })
    .after(1000, function () {
        this.stop();
        this.land();
    });