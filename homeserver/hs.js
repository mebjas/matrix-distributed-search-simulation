// identity server
var express = require ('express');
var sprintf = require ('sprintf').sprintf;
var request = require('request');
var bodyParser = require('body-parser');
var fs = require('fs');
var fork = require('child_process').fork;
var freeport = require('freeport');
var MT = require('./membership');
var CT = require('./client');

var port = null, HSID = null;
if (process.argv.length >= 3) {
    port = parseInt(process.argv[2]) == NaN ? null : parseInt( process.argv[2]);
}

var app = express();
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

if (port != null) {
    // start the homeserver on port 8080
    port = 8080;
    app.listen(port, function(err) {
        if (err) {
            console.log("Unable to listen on port %s\nException: %s", port, ex);
            return;
        }
        MT.Insert('defaultHS', 8080, '127.0.0.1');
        HSID = 'defaultHS';
        console.log(sprintf("HS listening on port 8080"));
        MT.Print();
    })
}


// api for a client to connect to
app.post('/connect', function(req, res) {
    // unique user ID, 32 charecters long, unique, for simulation
    var id = req.body.id;
    var port = req.body.port;

    // register this client!
    // update the clients table with this entry
    try {
        CT.Insert(id, port, '127.0.0.1');
        console.log("Client %s:%s connected to HSID: %s", '127.0.0.1', port, HSID)
        res.json({error: false, port: port, err: null});
    } catch (ex) {
        res.json({error: true, port: null, err: ex});
    }
    
});
// api for a client to send a chat message
// api for a client to query a chat message