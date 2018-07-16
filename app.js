console.log('Starting simple switch node app');
var config = {
    hostIP: '192.168.0.106',
    goipIP: '192.168.0.104',
    audioPath: "/home/audiofiles/"
}
var ws = require('./services/Rest');
ws = new ws();
var xmlgen = require('./services/XmlGenerator');
xmlgen = new xmlgen(config);
var oodb = require('./services/Oodb');
oodb = new oodb();
var MediaServer = require('./services/mediaserver');
ms = new MediaServer();
var goip = require('goip-sms');
var sms = new goip({ host: config.goipIP, user: 'admin', password: 'admin' });

function startWebServer(cb) {
    var config = {};
    config.host = '0.0.0.0';
    config.port = '3031';
    config.urls = [
        { url: '/directory', method: 'post', callback: getDirectory },
        { url: '/dialplan', method: 'post', callback: getDialPlan },
        { url: '/recordings', method: 'post', callback: recordings },
        { url: '/listen', method: 'get', callback: listen },
	{ url: '/sms', method: 'post', callback: sendSMS}
    ];

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

function sendSMS(req, res) {
    var line = req.body.from.replace("user", "");
    sms.send({
            number: req.body.number,
            message: req.body.msg,
            line: line
        })
        .then(function(response) {
            console.log('response', response.body);
            res.send({ status: 200 })
        })
}

function recordings(req, res) {
    // these are the only params we'll need
    var dbObj = {
        tableName: 'cdr',
        limit: 50,
        skip: 0,
        query: {},
        // "variables.answer_epoch", "variables.billsec",
        include: ["variables.start_epoch", "app_log"],
        exclude: ["_id"]
    }

    if (req.body.user) {
        dbObj.query["variables.user_name"] = req.body.user;
    }
    if (!isNaN(req.body.limit) && req.body.limit > 0 && req.body.limit <= 100) {
        dbObj.limit = req.body.limit;
    }

    if (!isNaN(req.body.skip) && req.body.skip > 0) {
        dbObj.skip = req.body.skip;
    }
    oodb.query(dbObj, function(response) {
        if (response.status == 200) {
            for (var i = response.data.length - 1; i >= 0; i--) {
                if (response.data[i].app_log && response.data[i].app_log[0].app_data) {
                    response.data[i].recording = response.data[i].app_log[0].app_data;
                    delete response.data[i].app_log;
                    response.data[i].timestamp = response.data[i].variables.start_epoch;
                    delete response.data[i].variables;
                }
            }

            res.send({ status: 200, recordings: response.data })
        } else {
            res.send({ status: 500, msg: "unable to fetch records" })
        }
    });
}

function listen(req, res) {
    var recording = "/home/audiofiles/2018-07-11/f6246114-84f6-11e8-8ccb-05d2dde99bc7.wav";
    try {
        // stat = fs.statSync(recording);
        ms.play(req, res, recording);
    } catch (error) {

    }
}

startWebServer(function() {
    console.log('ws started----');

});
