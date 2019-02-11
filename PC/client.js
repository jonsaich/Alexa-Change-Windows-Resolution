/*
 * To be ran on the client (PC / Laptop) machine
 * 
 * INFO:
 * We're using this libary here to change the resolution
 * http://tools.taubenkorb.at/change-screen-resolution/
 * 
 * Developed by Jonathan Saich - 19/02/2018
 * e: hello@jonsaich.me
 * www.jonsaich.me 
*/

var awsIot = require('aws-iot-device-sdk');
var exec = require('child_process').exec;
const uuidv4 = require('uuid/v4');
var exec = require('child_process').exec;

// MQTT Certificates 
var device = awsIot.device({
   keyPath: "./certs/05020cbce4-private.pem.key",
  certPath: "./certs/05020cbce4-certificate.pem.crt",
    caPath: "./certs/rootCA.pem",
  clientId: uuidv4(),  // Must be uniuqe
      host: "afwqyfjs325u3.iot.eu-west-1.amazonaws.com"
});


// When the script is first ran, it subscribes to topic_1
// and listens for messages.
device
  .on('connect', function() {
    console.log('connect');
    device.subscribe('topic_1');
    device.publish('topic_2', JSON.stringify({ test_data: 1}));
  });


// Executed when a message is recieved 
device
  .on('message', function(topic, payload) {

    console.log(payload.toString());
    
    var heightWidth = JSON.parse(payload);
    
    var script = exec('ChangeScreenResolution.exe /w=' + heightWidth.width + ' /h='+heightWidth.height +' /d=0', (error, stdout, stderr) => {
      console.log(`${stdout}`);
      console.log(`${stderr}`);
      if (error !== null) {
          console.log(`exec error: ${error}`);
      }
  });

    console.log('message', topic, payload.toString());
  });