module.exports = Express;

function Express() {
    var self = this;

    self.startService = startService;
    self.executeRequest = executeRequest;
    self.executeRawRequest = executeRawRequest;
    self.executeHttpGet = executeHttpGet;
    var express = require('express');
    var https = require('https');
    var http = require('http');
    var async = require('async');
    var bodyParser = require('body-parser');
    var multer = require('multer');
    var fs = require('fs');
    var xmlparser = require('express-xml-bodyparser');

    function executeRequest(data, cb) {
        console.log("Start executing https request");
        https.get(data.url, function(res) {
            console.log("statusCode: ", res.statusCode);
            console.log("headers: ", res.headers);

            res.on('data', function(d) {
                console.log('Data happned in Rest--------------------------');
                cb(d);
            });

        }).on('error', function(e) {
            console.log('Error happned in rest-------------------------');
            console.error(e);
            cb(e);
        });
    }

    function executeHttpGet(data, cb) {
        console.log("Start executing http request");
        http.get(data.url, function(res) {
            console.log("statusCode: ", res.statusCode);
            console.log("headers: ", res.headers);

            res.on('data', function(d) {
                console.log('Data happned in Rest--------------------------');
                cb(d);
            });

        }).on('error', function(e) {
            console.log('Error happned in rest-------------------------');
            console.error(e);
            cb(e);
        });
    }

    function executeRawRequest(data, cb) {
        console.log("Start executing http raw request");
        console.log(data);
        // var body = JSON.stringify({recipient:"+919884202053",message: "This is a test message."});
        var body = data.body;
        delete data.body;
        console.log(data);
        var request = https.request(data, function(res) {
            console.log("statusCode: ", res.statusCode);
            console.log("headers: ", res.headers);

            res.on('data', function(d) {
                console.log('Data happned in raw Rest--------------------------');
                cb(d);
            });

        });
        request.write(body);
        // console.log("request is");
        // console.log(request);
        request.end();
        request.on('error', function(e) {
            console.log('Error happned in rest-------------------------');
            console.error(e);
            cb(e);
        });
    }

    function startService(config, cb) {
        var app = express();
        app.use(bodyParser.urlencoded({ extended: false }));
        var upload = multer({ dest: 'uploads/' });
        app.use(bodyParser.json());
        app.engine('html', require('ejs').renderFile);
        app.use(xmlparser());
        if (config.staticFiles) {
            app.use(express.static(config.staticFiles));
        }

        async.waterfall([
                // renderStaticFiles,
                mapUrls
            ],
            function(error, response) {
                // if(config.https){
                // 	var privateKey = fs.readFileSync('/home/vimo/vimoframework/cert/privatekey.pem', 'utf8');
                // 	var certificate = fs.readFileSync('/home/vimo/vimoframework/cert/certificate.pem', 'utf8');
                // 	var ca = fs.readFileSync('/home/vimo/vimoframework/cert/ca.txt', 'utf8');
                // 	var credentials = {key: privateKey, cert: certificate, ca:[ca]};
                // 	app = https.createServer(credentials, app);
                // }
                app.listen(config.port, config.host, function() {
                    console.log('Express service is started------------------------');
                    cb();
                });
            });


        function mapUrls(callback) {
            async.eachSeries(config.urls, function(url, next) {
                if (url.method == 'get') {
                    app.get(url.url, function(req, res) {
                        url.callback(req, res);
                    });
                } else {
                    if (url.type == "file") {
                        app.post(url.url, upload.single('file'), function(req, res) {
                            url.callback(req, res);
                        });
                    } else {
                        app.post(url.url, function(req, res) {
                            url.callback(req, res);
                        });
                    }
                }
                next();
            }, function done() {
                callback(null);
            });
        }
    }
}