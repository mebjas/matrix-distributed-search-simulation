var sprintf = require ('sprintf').sprintf;
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
            console.log(sprintf("%s\t|\t%s:%s", id, entry.ip, entry.port));
        }.bind(this));
        console.log('-------------------------------------------------------------------------------------');        
    }
};

module.exports = membership;