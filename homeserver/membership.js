var sprintf = require ('sprintf').sprintf;
var request = require('request');
var visualizer = require('./visualizer');

var membership = {
    table: {},
    Get: function(id) {
        if (id != undefined && this.Exists(id)) return this.table[id];
        else if (id != undefined) return null;
        return this.table;
    },
    Exists: function(id) {
        return typeof this.table[id] != 'undefined';
    },
    Insert: function(id, port, ip) {
        if (this.Exists(id)) throw sprintf("ID: %s already taken", id);
        this.table[id] = {ip: ip, port: port};
    },
    Print: function() {
        console.log('--- < MEMBERSHIP TABLE > ------------------------------------------------------------');
        console.log(sprintf("%s\t\t|\t%s", "ID", "Address"));
        console.log('-------------------------------------------------------------------------------------');                
        Object.keys(this.table).forEach(function(id) {
            var entry = this.table[id];
            console.log(sprintf("%s\t\t|\t%s:%s", id, entry.ip, entry.port));
        }.bind(this));
        console.log('-------------------------------------------------------------------------------------');        
    },
    Absorb: function(mt) {
        Object.keys(mt).forEach(function(k) {
            if (this.Exists(k)) return;
            this.Insert(k, mt[k].port, mt[k].ip);
        }.bind(this));
    },
    InformAddition: function(HSID, newHSID) {
        // TODO: optimize multiple calls to get method
        Object.keys(this.Get()).forEach(function(id) {
            if (id == HSID || id == newHSID) return;
            var entry = this.Get(id);
            console.log("Updating membership information with", sprintf("http://%s:%s/MU", entry.ip, entry.port));
            request.post(sprintf("http://%s:%s/MU", entry.ip, entry.port), {form: {MT: this.Get()}}, function(err, hr, body) {
                if (err) {
                    console.log("Error updating membership information", err);
                    return;
                }
                visualizer.Connection(HSID, id);
            });
        }.bind(this));
    }
};

module.exports = membership;