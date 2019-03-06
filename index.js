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


// import required modules
const Gpio = require('onoff').Gpio
// set LED as output:
let led = new Gpio(17, 'out');
// the state of the LED;
let ledState = 0;



// start the event listener:
//button.watch(readButton);


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
    ///set LED on for certain value of temp
    if (device.temperature  < 25) {
    
     ledState =1
        
      } else {
          ledState = 0;
      }
      // set the LED with ledState:
      led.writeSync(ledState);
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
// sensor value
var postData =JSON.stringify({
  "macAddress" : "b8:27:eb:93:e8:ee",
  "sessionKey" : "e30f3015-5e91-4fc3-8ae2-60ab787fbde2",
  "data": { "sensorValue":temp}


});


var options = {

  host: 'tigoe.io',
  port: 443,
  path: '/data',
	method: 'POST',
	headers: {
           'User-Agent': 'nodejs',
           'Content-Type': 'application/json',
           'Content-Length': postData.length
        }
};


var request = https.request(options, callback);	// start it
request.write(postData);							// send the data
request.end();												// end it

}



// set an interval once a second to read the sensors:
setInterval(checkSensors, 1000);
// set an interval once a second to send to Tom 
setInterval(sendingTom, 1000);