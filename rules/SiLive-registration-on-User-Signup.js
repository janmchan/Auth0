
function(user, context, callback) {
  // short-circuit if the user signed up already
  if (context.stats.loginsCount > 1) return callback(null, user, context);

  function guid() {
      function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      }
      return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
  }
  var activityId = guid();
  function log(message)
  {
      console.log(activityId + ' : ' + message);
  }
  function getAccessToken(callback)
  {
      var request = require('request');
      var url =  'https://' + auth0.domain + '/oauth/token';
      var post_data = {
          "client_id": configuration.client_id,
          "client_secret": configuration.client_secret,
          "audience": "https://" + auth0.domain + '/api/v2/',
          "grant_type":"client_credentials"
      };
      var id = guid();
      var post_options ={
          uri: url,
          method: 'POST',
          json : post_data,
          headers: {
              'Content-Type': 'application/json',
          }
      };
      // Set up the request
      log('Getting Access Token');
      request(post_options, function (error, response, body) {
          log('ActivityId...:' + activityId);
          
          if(response) log('Response Code ' + response.statusCode);
          if (error || !response || response.statusCode !== 200 ) {
              log('error: ' + error);
          }
          else {
              callback(body);
          }
          
          });
  }
  function deleteUser(user_id)
  {
      getAccessToken(function(token) {
          var request = require('request');
          var url =  'https://' +auth0.domain + '/api/v2/users/' +user_id;
          var options = {
              uri: url,
              method: 'DELETE',
              headers: {
              'Authorization': token.token_type + ' ' + token.access_token
              }
          };
          log('Requesting User Deletion');
          
          request(options, function (error, response, body) {
              if(response) log('Response Code ' + response.statusCode);
              if (!error &&  response && response.statusCode === 204) {
                  log('User '+ user_id  + ' sucessfully deleted.');
              }
              else {
                  log('error: ' + error);
              }
              if(body) log('body ' + JSON.stringify(body));
          });
      });
  }
  if(!user.email)
  {
    //Automatically delete users without emails
    log('No email found, deleting user '+user.user_id);
    deleteUser(user.user_id);
    callback(null, user, context); 
    return;
  }

  //Create user in SILive
    var request = require('request');
    var url = configuration.silive + "/api/users";
    var post_data = {
      "Email": user.email,
      "EulaVersion" : 5
    };
    
    var post_options ={
        uri: url,
        method: 'POST',
        json : post_data,
        headers: {
          'Content-Type': 'application/json',
          'ApiKey': configuration.apiKey,
          'ActivityId' : activityId,
          'ActivityName' : 'SocialRegistration'
          //,'Accept-Language' : context.requestLanguage
        }
    };
    log('Sending request to create SiLive User');
    // Set up the request
    request(post_options, function (error, response, body) {
      log('Response Code ' + response.statusCode);
        if (error) {
          log('error: ' + error);
          log('Deleting user ' + user.user_id);
          deleteUser(user.user_id);
        }
        if(body)
        {
          log('body ' + JSON.stringify(body));
        }
      });

  // don’t wait for the Slack API call to finish, return right away (the request will continue on the sandbox)'
  callback(null, user, context);
}