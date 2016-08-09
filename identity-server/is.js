// identity server
var express = require ('express');
var sprintf = require ('sprintf').sprintf;
var request = require('request');
var bodyParser = require('body-parser');
var fs = require('fs');
var fork = require('child_process').fork;
var freeport = require('freeport');

var app = express();
app.use( bodyParser.json() );        // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({      // to support URL-encoded bodies
  extended: true
}));

// HS Class
// mandatory info -> data.ID, data.addr
var homeservers = {};
var HS = function(data) {
	if (typeof homeservers[data.ID] != 'undefined') {
		throw 'homeserver with this ID already defined.';
		return;
	}
	this.ID = data.ID;
	this._addr = data.addr;
	this._core = data;

	console.log(this);
	homeservers[this.ID] = this;
}

/*
 * API to get a free port for this request.
 * TODO: although this port can get used up by other process
 * rerequesting for port needed.
 */
HS.prototype.getPortAssigned = function(res) {
	freeport(function (err, port) {
		if (err) {
			res.json({error: true, message: err, data: homeservers});
			return;
		}
		this.port = port;
		this.addr = [this._addr, port].join(':') +'/'; 
		res.json({error: false, message: 'reg successful', data: homeservers, port: port});

		// Now inform all other HS about this.
		Object.keys(homeservers).forEach(function(id) {
			if (id == this.ID) return;
			request.post(homeservers[id].addr +'new', {form: {data: homeservers[this.ID]}}, function() {
				if (err) {
					console.error(sprintf('[fail] Unable to inform %s about %s', id, this.ID));
					return;
            	}
            	console.log(sprintf('informed %s about %s', id, this.ID))
			}.bind(this));
		}.bind(this));
	}.bind(this));
};

/*
 * API to get all homeservers
 */
app.get('/all', function(req, res) {
	res.json(homeservers);
});

app.post('/register', function(req, res) {
	console.log("[request] [POST - register] ", sprintf("ID: %s, ADDR: %s", req.body.ID, req.body.addr));
	try {
		new HS({ID: req.body.ID, addr: req.body.addr}).getPortAssigned(res);
	} catch (ex) {
		res.json({error: true, message: ex, data: homeservers});
	}
});

app.listen(8080, function(err) {
	console.log(sprintf("Identity server started at port %s", 8080));
})