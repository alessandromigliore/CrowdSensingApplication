
//Virtual Sensors


var mqtt = require('mqtt');

// Device access token
const thingsboardHost = "demo.thingsboard.io";
const accessToken = "BBHYzoMyv2SmlCjo5uPw";
//range of our const
const minTemperature = -20, maxTemperature = 50, minHumidity = 0, maxHumidity = 100, minWindDirection = 0, maxWindDirection = 360, minWindIntensity = 0, maxWindIntensity = 100, minRainHeight = 0, maxRainHeight = 50;

// Initialization of data with random values
var data = {
    temperature: minTemperature + (maxTemperature - minTemperature) * Math.random() ,
    humidity: minHumidity + (maxHumidity - minHumidity) * Math.random(),
    windDirection: minWindDirection + (maxWindDirection - minWindDirection) * Math.random(),
    windIntensity: minWindIntensity + (maxWindIntensity - minWindIntensity) * Math.random(),
    rainHeight: minRainHeight + (minRainHeight - minRainHeight) * Math.random(),
    device: 1     //identify device
};

// Initialization of mqtt client using Thingsboard host and device access token
console.log('Connecting to: %s using access token: %s', thingsboardHost, accessToken);
var client  = mqtt.connect('mqtt://'+ thingsboardHost, { username: accessToken });

// Triggers when client is successfully connected to the Thingsboard server
client.on('connect', function () {
    console.log('Client connected!');
    // Uploads firmware version and serial number as device attributes using 'v1/devices/me/attributes' MQTT topic
    client.publish('v1/devices/me/attributes', JSON.stringify({"firmware_version":"1.0.1", "serial_number":"SN-001"}));
    // Schedule telemetry data upload every ten seconds
    console.log('Uploading data every ten seconds...');
    setInterval(publishTelemetry, 10000);
});

// Uploads telemetry data using 'v1/devices/me/telemetry' MQTT topic
function publishTelemetry() {
    data.temperature = genNextValue(data.temperature, minTemperature, maxTemperature);
    data.humidity = genNextValue(data.humidity, minHumidity, maxHumidity);
    data.windDirection = genNextValue(data.windDirection, minWindDirection, maxWindDirection);
    data.windIntensity = genNextValue(data.windIntensity, minWindIntensity, maxWindIntensity);
    data.rainHeight = genNextValue(data.rainHeight, minRainHeight, maxRainHeight);
    data.device = 1;
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
