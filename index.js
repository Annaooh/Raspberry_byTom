/*
  MCP3008 ADC reader

  Reads two channels of an MCP3008 analog-to-digital converter
  and prints them out. 

  created 17 Feb 2019
  by Tom Igoe
*/

var https = require('https');
var temp = -1 ;


const mcpadc = require('mcp-spi-adc');  // include the MCP SPI library
const sampleRate = { speedHz: 20000 };  // ADC sample rate
let device = {};      // object for device characteristics
let channels = [];    // list for ADC channels

// open two ADC channels and push them to the channels list:
let tempSensor = mcpadc.open(0, sampleRate, addNewChannel);
channels.push(tempSensor);
let potentiometer = mcpadc.open(2, sampleRate, addNewChannel);
channels.push(potentiometer);

// callback for open() commands. Doesn't do anything here:
function addNewChannel(error) {
  if (error) throw error;
}

// function to read and convert sensors:
function checkSensors() {
  // callback function for tempSensor.read():
  function getTemperature(error, reading) {
    if (error) throw error;
    // range is 0-1. Convert to Celsius (see TMP36 data sheet for details)
    device.temperature = (reading.value * 3.3 - 0.5) * 100;
    temp = device.temperature;
  }
  
  // callback function for potentiometer.read():
  function getKnob(error, reading) {
    if (error) throw error;
    device.potentiometer = reading.value;
  }

  // make sure there are two ADC channels open to read,
  // then read them and print the result:
  if (channels.length > 1) {
    tempSensor.read(getTemperature);
    potentiometer.read(getKnob);
    console.log(device);
  }
}

////// dweet

// make the POST data a JSON object and stringify it:

// sensor value
var postData =JSON.stringify({
  'sensorValue':temp // get new sensor data 
  // Mac
  // session id


});

/*
 set up the options for the request.
 the full URL in this case is:
 http://example.com:443/login
*/

/// change  to toms server
// var options = {
//   host: 'tigoe.io',
//   port: 443,
//   path: '/data',
// 	method: 'POST',
// 	headers: {
//            'User-Agent': 'nodejs',
//            'Content-Type': 'application/json',
//            'Content-Length': postData.length
//         }
// };

var options = {
  host: 'dweet.io',
  port: 443,
  path: '/dweet/for/scandalous-cheese-hoarder',
	method: 'POST',
	headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
};

/*
	the callback function to be run when the response comes in.
	this callback assumes a chunked response, with several 'data'
	events and one final 'end' response.
*/
function callback(response) {
  var result = '';		// string to hold the response

  // as each chunk comes in, add it to the result string:
  response.on('data', function (data) {
    result += data;
  });

  // when the final chunk comes in, print it out:
  response.on('end', function () {
    console.log(result);
  });
}

// make the actual request:
function sendingTom (){
var request = https.request(options, callback);	// start it
request.write(postData);							// send the data
request.end();												// end it
}



// set an interval once a second to read the sensors:
setInterval(checkSensors, 1000);
// set an interval once a second to send to Tom 
setInterval(sedingTom, 1000);