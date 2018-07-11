//
console.log('Starting simple switch node app');

var ws = require('./services/Rest');
ws = new ws();
var xmlgen = require('./services/XmlGenerator');
xmlgen = new xmlgen();
var oodb = require('./services/Oodb');
oodb = new oodb();
// var goip = require('goip-sms');

// var sms = new goip({ host: '10.1.1.128', user: 'admin', password: 'admin' });

// sms.send({
//         number: '+919884202053',
//         message: 'Tarun Soni, Welcome to India',
//         line: '1'
//     })
//     .then(function(response) {
//         console.log('response', response.body);
//     })

function startWebServer(cb) {
    var config = {};
    config.host = 'localhost';
    config.port = '3031';
    config.urls = [{ url: '/directory', method: 'post', callback: getDirectory }, { url: '/dialplan', method: 'post', callback: getDialPlan }];

    ws.createServer(config, function(resdata) {
        console.log('startWebServer :: Got response, Web Server created');
        cb(true);
    });
}

function getDirectory(req, res) {
    xmlgen.getUser(req, function(xml) {
        console.log('Directory lookup response is sent');
        res.send(xml);
    });
}

function getDialPlan(req, res) {
    xmlgen.getCallFlow(req, function(xml) {
        console.log('Dialplan response is sent');
        res.send(xml);
    });
}
startWebServer(function() {
    console.log('ws started----');

});