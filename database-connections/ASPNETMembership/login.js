function login (email, password, callback) {
  function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }

    var request = require('request');
    var url = configuration.domain + "/API/Access/Patient";
    console.log(url);
    var post_data = {
      "Username": email,
      "Password" : password
    };
    var id = guid();
    var post_options = {
        uri: url,
        method: 'POST',
        json : post_data,
        headers: {
          'Content-Type': 'application/json',
          'ApiKey': configuration.apiKey,
          'ActivityId' : id,
          'ActivityName' : 'Auth0Login'
        }
    };
    // Set up the request
    
    request(post_options, function (error, response, body) {
      if(!response || !response.statusCode || response.statusCode === 401)
        {
          console.log("Invalid Credentials (from Login)");
          console.log("ActivityId: " + id);
          
          callback(new Error(email, "Invalid Credentials"));
          
        }  
      else if (!error && response.statusCode === 200) {
          console.log("ActivityId: " + id);
          console.log(response.statusCode);
          console.log(body);
          callback(null, body);
        }
        
        else {
          console.log("ActivityId: " + id);
          console.log(body);
          console.log("error: " + error);
          callback(new Error("Unknown Error Occured (from Login)"));
        }
      });


}
