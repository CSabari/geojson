//Requires node.js and mqtt library installed.
var mqtt = require('mqtt');

const thingsboardHost = "demo.thingsboard.io";
// Reads the access token from arguments
const accessToken = process.argv[2];
const AudiMinSpeed = 0, AudiMaxSpeed = 180, FerrariMinSpeed = 10, FerrariMaxSpeed = 220, BmwMinSpeed = 10, BmwMaxSpeed = 180, BugattiMinSpeed = 30, BugattiMaxSpeed = 280, JaguarMinSpeed = 30, JaguarMaxSpeed = 320;

// Initialization of carspeed data with random values
var data = {
    	Audi: AudiMinSpeed + (AudiMaxSpeed - AudiMinSpeed) * Math.random(),
	Ferrari: FerrariMinSpeed + (FerrariMaxSpeed - FerrariMinSpeed) * Math.random(),
	BMW: BmwMinSpeed + (BmwMaxSpeed - BmwMinSpeed) * Math.random(),
	Bugatti: BugattiMinSpeed + (BugattiMaxSpeed - BugattiMinSpeed) * Math.random(),
	Jaguar: JaguarMinSpeed + (JaguarMaxSpeed - JaguarMinSpeed) * Math.random()
};

// Initialization of mqtt client using Thingsboard host and device access token
console.log('Connecting to: %s using access token: %s', thingsboardHost, accessToken);
var client  = mqtt.connect('mqtt://'+ thingsboardHost, { username: accessToken });

// Triggers when client is successfully connected to the Thingsboard server
client.on('connect', function () {
    console.log('Client connected!');
    // Uploads firmware version and serial number as device attributes using 'v1/devices/me/attributes' MQTT topic
    client.publish('v1/devices/me/attributes', JSON.stringify({"firmware_version":"1.0.1", "serial_number":"SN-001"}));
    // Schedules telemetry data upload once per second
    console.log('Uploading Audi data once per second...');
    setInterval(publishTelemetry, 1000);
});

// Uploads telemetry data using 'v1/devices/me/telemetry' MQTT topic
function publishTelemetry() {
    data.Audi = genNextValue(data.Audi, AudiMinSpeed, AudiMaxSpeed);
	data.Ferrari = genNextValue(data.Ferrari, FerrariMinSpeed, FerrariMaxSpeed);
	data.BMW = genNextValue(data.BMW, BmwMinSpeed, BmwMaxSpeed);
	data.Bugatti = genNextValue(data.Bugatti, BugattiMinSpeed, BugattiMaxSpeed);
	data.Jaguar = genNextValue(data.Jaguar, JaguarMinSpeed, JaguarMaxSpeed);

	
    client.publish('v1/devices/me/telemetry', JSON.stringify(data));
}

// Generates new random value that is within 3% range from previous value
function genNextValue(prevValue, min, max) {
    var value = prevValue + ((max - min) * (Math.random() - 0.5)) * 0.03;
    value = Math.max(min, Math.min(max, value));
    return Math.round(value * 10) / 10;
}

//Catches ctrl+c event
process.on('SIGINT', function () {
    console.log();
    console.log('Disconnecting...');
    client.end();
    console.log('Exited!');
    process.exit(2);
});

//Catches uncaught exceptions
process.on('uncaughtException', function(e) {
    console.log('Uncaught Exception...');
    console.log(e.stack);
    process.exit(99);
});