/*
* 	Uses oauth package: npm install oauth
*/

var OAuth = require('oauth'); // this require needs to be in app.js as its a node package
const twitter_application_consumer_key = '5LZg3MVU4y8AFAv0JPEwDWA3R';
const twitter_application_secret = 'BgQgzOsIjEMSkvEKPnRVKlB5ZPUSJYw2xzMBvYZ78a0ztSE5rQ';
const twitter_user_access_token = '1375194195086950403-8KSqjFsxnZfGGuGgYd0QNNoZBCwAhC';
const twitter_user_secret = 'zveHec0vXOgvSJSHs9ZyyzJxcSRoQ1MiO68vio12edFGD';


var oauth = new OAuth.OAuth(
	'https://api.twitter.com/oauth/request_token',
	'https://api.twitter.com/oauth/access_token',
	twitter_application_consumer_key,
	twitter_application_secret,
	'1.0A',
	null,
	'HMAC-SHA1'
);

var status = 'I am updates_pi';  // Tweet
var postBody = { 'status': status };

oauth.post('https://api.twitter.com/1.1/statuses/update.json',
	twitter_user_access_token,
    twitter_user_secret,
    postBody,
    '',
	function(err, data, res) {
		if (err) { console.log(err); }
        else { //console.log(data);
        }
	});