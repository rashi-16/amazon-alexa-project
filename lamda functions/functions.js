const https = require("https");

const myfunctions = {
    
   getData: function(options, postData){
        
        return new Promise(function(resolve,reject){
            
            var request = https.request(options, function(response){
                
                if (response.statusCode  < 200 || response.statusCode >=300){
                    return reject(new Error("statusCode=" +response.statusCode));
                }
                
                var body =[];
                response.on("data", function(chunk){
                    body.push(chunk);
                });
                response.on("end", function(){
                    try{
                        body = JSON.parse(Buffer.concat(body).toString());
                    }catch(error){
                        reject(error);
                    }
                    resolve(body);
                });
            });
                
                if(postData){
                    request.write(postData);
                }
                
                request.end();
                
                });
            },


getFlightData : function(options, postData){
        
        return new Promise(function(resolve,reject){
            
            var request = https.request(options, function(response){
                
                if (response.statusCode  < 200 || response.statusCode >=300){
                    return reject(new Error("statusCode=" +response.statusCode));
                }
                
                var body =[];
                response.on("data", function(chunk){
                    body.push(chunk);
                });
                response.on("end", function(){
                    try{
                        body = JSON.parse(Buffer.concat(body).toString());
                    }catch(error){
                        reject(error);
                    }
                    resolve(body);
                });
            });
                
                if(postData){
                    request.write(postData);
                }
                
                request.end();
                
                });
            }

}; 
module.exports = myfunctions;