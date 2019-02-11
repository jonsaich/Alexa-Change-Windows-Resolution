/*
 * To be deployed on AWS Lambda.
 * 
 * Developed by Jonathan Saich - 19/02/2018
 * e: hello@jonsaich.me
 * www.jonsaich.me 
*/

const Alexa = require('alexa-sdk');
const AWS = require('aws-sdk');

// Configuration
const APP_ID = null;
const HELP_MESSAGE = 'To change the screen resolution you can say, change screen resolution.';
const HELP_REPROMPT = 'Try saying change screen resolution to 800 by 700.';
const STOP_MESSAGE = 'Goodbye!';
const UNHANDLED_MESSAGE = 'Oooooops, I don\'t understand that one.'

const AWS_SECRET_ACCESS_KEY = '';
const AWS_ACCESS_KEY_ID = '';
const AWS_IOT_ENDPOINT = 'afwqyfjs325u3.iot.eu-west-1.amazonaws.com';
const AWS_IOT_REGION = 'eu-west-1';

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);    
    alexa.execute();
};

const handlers = {
    'LaunchRequest': function () {
        this.emit('AMAZON.HelpIntent');        
	},
	'ChangeScreenResolutionIntent': function () {
        // Delegate to Alexa to collect all the required slot values
        var filledSlots = delegateSlotCollection.call(this);  
    },
    'ResetScreenResolutionIntent': function () {
        var speechOutPut = this;
        
        changeScreenResolution(1200, 800, speechOutPut);
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'Unhandled': function () {
        this.response.speak(UNHANDLED_MESSAGE);
        this.emit(':responseReady');
    }
};

/* ----------------------- METHOD ----------------------- */
// Change the clients screen resolution
/* ----------------------- METHOD ----------------------- */
function changeScreenResolution(width, height, speechOutPut) {
    var heightWidth = { "width":width, "height":height }

    AWS.config.update({region: AWS_IOT_REGION});
    AWS.config.credentials = {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
    }
    
    var iotdata = new AWS.IotData({endpoint: AWS_IOT_ENDPOINT});
    var params = {
        topic: 'topic_1', /* required */
        payload: new Buffer(JSON.stringify(heightWidth)) || 'STRING_VALUE' /* Strings will be Base-64 encoded on your behalf */,
        qos: 1
      };

      iotdata.publish(params, function(err, data) {
        if (err) speechOutPut.emit(':tell', 'An error occoured ' + err.stack); // an error occurred
        else speechOutPut.emit(':tell', 'Screen resolution changed to ' + width + ' by ' + height);  // successful response
      });
}


/* ----------------------- METHOD ----------------------- */
// Check if all intent required fileds are complete
/* ----------------------- METHOD ----------------------- */
function delegateSlotCollection(){
      if (this.event.request.dialogState === "STARTED") {
        var updatedIntent=this.event.request.intent;

        //optionally pre-fill slots: update the intent object with slot values for which
        //you have defaults, then return Dialog.Delegate with this updated intent
        // in the updatedIntent property
        this.emit(":delegate", updatedIntent);
      } else if (this.event.request.dialogState !== "COMPLETED") {

        // return a Dialog.Delegate directive with no updatedIntent property.
        this.emit(":delegate");
      } else {
        var slotHeight = parseInt(this.event.request.intent.slots.height.value, 10);
        var slothWidth = parseInt(this.event.request.intent.slots.width.value, 10);

        changeScreenResolution(slothWidth, slotHeight, this);    
      }
  }