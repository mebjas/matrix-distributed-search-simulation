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
var visualizer = require('./visualizer');

var fixedHSConnectUrl = 'http://127.0.0.1:8081/HSConnect';

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
    port = 8081;
    app.listen(port, function(err) {
        if (err) {
            console.log("Unable to listen on port %s\nException: %s", port, ex);
            return;
        }
        HSID = 'defaultHS';
        MT.Insert(HSID, port, '127.0.0.1');
        console.log(sprintf("HS listening on port %s", port));
        MT.Print();
        visualizer.Created(HSID, port, MT);
    })
} else {
    freeport(function (err, port) {
        HSID = sprintf("HS%s", port);
        MT.Insert(HSID, port, '127.0.0.1');
        console.log(sprintf("%s listening on port %s", HSID, port));
        MT.Print();
        request.post(fixedHSConnectUrl, {form: {id: HSID, port: port, addr: '127.0.0.1'}}, function(err, httpResponse, body) {
            if (err) {
                console.log('error registering hs', err);
                return;
            }
            var _MT = JSON.parse(body);
            app.listen(port, function(err) {
                if (err) {
                    console.log("Unable to listen on port %s\nException: %s", port, ex);
                    return;
                } 
                MT.Absorb(_MT);
                MT.Print();
                visualizer.Created(HSID, port, MT);            
            });
        });   
    });
}

// api for HS to connect to
app.post('/HSConnect', function(req, res) {
    var _id = req.body.id;
    var _port = req.body.port;
    var _addr = req.body.addr;
    MT.Insert(_id, _port, _addr);
    res.json(MT.Get());

    // tell this to all other members that this ndoe joined
    MT.InformAddition(HSID, _id)
    visualizer.Created(HSID, port, MT);
    visualizer.Connection(HSID, _id);
});

// api to update membership
app.post('/MU', function(req, res) {
    var _mt = req.body.MT;
    console.log("membership information update", _mt);
    res.json({error: false});

    MT.Absorb(_mt);
    MT.Print();
    visualizer.Created(HSID, port, MT);
})

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