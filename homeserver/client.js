var sprintf = require ('sprintf').sprintf;
var client = {
    list: {},
    Get: function(id) {},
    Exists: function(id) {
        return typeof this.list[id] != 'undefined';
    },
    Insert: function(id, port, ip) {
        if (this.Exists(id)) throw sprintf("ID: %s already taken", id);
        this.list[id] = {ip: ip, port: port};
    }
};
module.exports = client;