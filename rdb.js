var firebase = require( 'firebase/app' );
require( 'firebase/database' );
var util = require('util');

var firebaseConfig = {
    apiKey: "AIzaSyD-1MU1jlQAtUxHzIMSHbRPFFLDZ7uzI8M",
    authDomain: "iot-team10.firebaseapp.com",
    projectId: "iot-team10",
    storageBucket: "iot-team10.appspot.com",
    messagingSenderId: "196021370184",
    appId: "1:196021370184:web:3506364930c0c74fa9477d"
};
firebase.initializeApp(firebaseConfig);
var database = firebase.database();

function updateFirebase(key, value) {
    database.ref(key).set(value);
}

module.exports.firebase = firebase;
module.exports.database = database;
module.exports.updateFirebase = updateFirebase;