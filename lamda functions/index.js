// Include the Alexa SDK v2
const Alexa = require("ask-sdk");
const actions= require("./functions");

const Bookmarks = {
    "my home":"28.186041,76.620768",
    "my office":"28.411304,77.51647",
    "airport":"28.556102,77.099854"
};

var user_origin="28.411304,77.51647";
var user_destination="xxxxxx";

var google_api_key="****insert api key*******";
var google_api_traffic_model="best_guess";
var google_api_departure_time="now";

var google_api_host="maps.googleapis.com";
var google_api_path="/maps/api/directions/json?origin=" +user_origin +"&destination="+
user_destination +"&traffic_model="+google_api_traffic_model+"&departure_time="+google_api_departure_time
+"&key="+google_api_key;


var aviation_key="*****insert api key*********";
var departure_code="xxx";
var arrival_code="xxx";

var aviation_host="aviation-edge.com";
var aviation_path="/v2/public/flights?key="+aviation_key+"&limit=3000&depIata="+departure_code+"&arrIata="+arrival_code;

// The "LaunchRequest" intent handler - called when the skill is launched
const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    const speechText = "Hello, I am Rashi's Assistant! I am glad to meet you.";
    let repromptText = "Sorry, I did not receive any input. Do you need help?";
    console.log("Launch handler executed");
    // Speak out the speechText via Alexa
    
    handlerInput.attributesManager.setSessionAttributes({ type: "help"});
    return handlerInput.responseBuilder
    .speak(speechText)
    .reprompt(repromptText)
    .getResponse();
  }
};



const WelcomeIntentHandler ={

    canHandle(handlerInput) {
        const requestEnvelope = handlerInput.requestEnvelope;
            return requestEnvelope.request.type === "IntentRequest"
            && requestEnvelope.request.intent.name === "Welcome";
    },


    handle(handlerInput) {
        const speechText = "Hi, how can I help you? I am assisting Ms. Rashi";
         console.log("Welcome intent executed");
        return handlerInput.responseBuilder.speak(speechText).getResponse();
    }
};


const GetBookmarks = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "GetBookmarks"
      );
  },
  handle(handlerInput) {
    console.log("GetBookmarks Intent Handler Called");
    
    let keys = Object.keys(Bookmarks);
    let destinations = "";
    
    for (let i=0; i<keys.length; i++) {
      if (i==keys.length-1) {
        destinations += " and ";
      }
      
      destinations += keys[i] + ", ";
    }
    
    let speechText = "Your bookmarked places are " + destinations;
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  }
};

const GetRoute = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "GetRoute"
      );
  },
  async handle(handlerInput) {
    console.log("GetRoute Intent Handler called");
    
    let slotdata = handlerInput.requestEnvelope.request.intent.slots;
    console.log("Slot Values --> " + JSON.stringify(slotdata));
    
    let speechText = "";
    
    let destination = "";
    
    let speakdestination = "";
    
   let slot = "";
   
   // Get the "destination" from the "slot value"
   if (slotdata.destination.value) {
    slot = slotdata.destination.value.toLowerCase();
    console.log("Destination Slot was detected. The value is " + slot);
   }
   
   // First try to get the value from bookmarks
   if (Bookmarks[slot]) {
     destination = Bookmarks[slot];
     speakdestination = slot.replace("my ", "your ");
   } else {
     destination = slot;
     speakdestination = destination;
   }
   
   // If there is no destination available, ask for the destination
   if (destination === "") {
     console.log("Destination is blank");
     
     let speechText = "Where would you like to go today?";
     let repromptText = "Sorry, I did not receive any input. Do you want me to read out your bookmarked destinations?";
     
     handlerInput.attributesManager.setSessionAttributes({
       type: "bookmarks"
     });
     
     return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
   }
   
   console.log("Destination is not blank");
   
   let final_api_path = google_api_path.replace(user_destination, encodeURIComponent(destination));
   
   // https "options"
   let options = {
     host: google_api_host,
     path: final_api_path,
     method: "GET"
   };
   
   console.log("Google API Path --> https://" + google_api_host + final_api_path);
   
   try {
     let jsondata = await actions.getData(options);
     console.log(jsondata);
     
     let status = jsondata.status;
     
     if (status == "OK") {
       
        
        let duration = jsondata.routes[0].legs[0].duration_in_traffic.text;
        
        let seconds = jsondata.routes[0].legs[0].duration_in_traffic.value;
        
        let nd = new Date();
        let ld = new Date(nd.getTime() + (seconds + 300 )* 1000);
        let timeinhhmm = ld.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit"
        });
        
        
        
        speechText = "It will take you " + duration + " to reach " + speakdestination + ". You will reach around " +
                     "<say-as interpret-as='time'>" + timeinhhmm + "</say-as> if you leave within 5 minutes";
       
     } else {
       speechText = "Sorry, I was not able to get traffic information for your destination " + speakdestination + ". Please try a different destination";
     }
     
   } catch (error) {
     speechText = "Sorry, an error occurred getting data from Google. Please try again.";
     console.log(error);
   }
   
   return handlerInput.responseBuilder
    .speak(speechText)
    .getResponse();
   
  }
};

const HelpIntent = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
      );
  },
  handle(handlerInput) {
    console.log("HelpIntent Handler Called");
    
    
    let attributes = {
      type: "bookmarks"
    };
    handlerInput.attributesManager.setSessionAttributes(attributes);
    
    let speechText = "I have the ability to read out quotes and get route information. To read out quotes, you can try saying, ask Eva for a random quote, or ask Eva for a quote from Einstein. To get route information you can try saying, ask Eva, how much time will it take you to reach office? I also have a few places bookmarked for easy access. Do you want me to read them out to you?";
    
    let repromptText = "Sorry, I did not receive any input. Do you want me to read out your bookmarked destinations?";
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(repromptText)
      .getResponse();
  }
};

const YesIntent = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.YesIntent"
      );
  },
  handle(handlerInput) {
    console.log("AMAZON.YesIntent intent handler called");
    
    let attributes = handlerInput.attributesManager.getSessionAttributes();
    let speechText = "";
    
    if (attributes.type) {
      switch (attributes.type) {
        case "bookmarks":
          return GetBookmarks.handle(handlerInput);
        case "help":
          return HelpIntent.handle(handlerInput);
          
        default:
          speechText = "Sorry, I do not understand how to process that.";
      }
      
    } else {
      speechText = "Sorry, I am not sure what you are saying Yes for.";
    }
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  }
};


const NoIntent = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.NoIntent"
      );
  },
  handle(handlerInput) {
    console.log("NoIntent intent handler called");
    return handlerInput.responseBuilder
      .getResponse();
  }
};


  const GetFlight = {
  
	canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "GetFlight"
      );
  },
  async handle(handlerInput) {
    console.log("GetFlight Intent Handler called");
    
    let slotdata = handlerInput.requestEnvelope.request.intent.slots;
    console.log("Slot Values --> " + JSON.stringify(slotdata));
    
    let speechText = "";
    
    
   let slotdep = "";
   let slotarr="";
   
   if (slotdata.depairport.value) {
    slotdep = slotdata.depairport.value.toUpperCase();
    console.log("Departure Slot was detected. The value is " + slotdep);
   }
   
   if (slotdata.arrairport.value) {
    slotarr = slotdata.arrairport.value.toUpperCase();
    console.log("Arrival Slot was detected. The value is " + slotarr);
   }
   
   
	let final_api_path = aviation_path.replace(departure_code, encodeURIComponent(slotdep));
	let final_api_path2 = final_api_path.replace(arrival_code, encodeURIComponent(slotarr));
	
	let options = {
     host: aviation_host,
     path: final_api_path2,
     method: "GET"
   };
   
   console.log("Aviation API Path --> https://" + aviation_host + final_api_path);
   
   
   
   try {
     let jsondata = await actions.getFlightData(options);
     console.log(jsondata);
     var count = jsondata.length;
     
     
	 let status = jsondata[0].status;
     if(status == "en-route") 
       var  flightnum = jsondata[0].flight.icaoNumber;
       speechText = "The number of flights between " + slotdep + " to " + slotarr + " is " + count+". The flight number is "+flightnum; 
   
  }
   catch (error) {
     speechText = "Sorry, an error occurred getting data from Google. Please try again.";
     console.log(error);
   }
   
   return handlerInput.responseBuilder
    .speak(speechText)
    .getResponse();
   
  }
};



const Fallback = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.FallbackIntent"
      );
  },
  handle(handlerInput) {
    console.log("FallbackIntent Handler called");
    
    let speechText = "Sorry, I wasn't able to understand what you said. Thank you and good bye.";
    
    return handlerInput.responseBuilder
      .speak(speechText)
      .getResponse();
  }
};


const UnhandledHandler = {
  canHandle() {
      return true;
  },
  handle(handlerInput, error) {
      console.log(`Error Handler : ${error.message}`);
      
      return handlerInput.responseBuilder
        .speak('Sorry, I am unable to understand. Ask Rashi directly!')
        .getResponse();
  }
};

// Register the handlers and make them ready for use in Lambda
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(LaunchRequestHandler, WelcomeIntentHandler, Fallback, NoIntent, YesIntent, GetBookmarks, GetRoute, GetFlight )
  .addErrorHandlers(UnhandledHandler)
  .lambda();
