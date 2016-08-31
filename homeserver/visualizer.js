var request = require('request');
var visualizer = {
    es: 'http://127.0.0.1:8080/data',
    Request: function(d) {
        try {
            request.post(this.es, {form: {data: d}});
        } catch (ex) {
            console.log("Unable to send request", ex);
        }
    },
    Created: function(HSID, port, MT) {
        this.Request({category: 'new', data: {id: HSID, port: port, mt: MT.Get()}});
    }, 
    Connection: function(HSID1, HSID2) {
        this.Request({category: 'connection', data: {from: HSID1, to: HSID2}});
    }
};
module.exports = visualizer;