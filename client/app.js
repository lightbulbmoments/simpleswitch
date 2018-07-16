var express = require('express');
var request = require('request');
var serverIP = "192.168.0.106:3031"
var path = require('path')
var app = express();
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
// app.host = "";
app.use('/static', express.static(path.join(__dirname, 'public')))
app.get('/', function (req, res) {
  res.sendFile('./client.html' , { root : __dirname});
});

app.post('/sms', function(req, res){
  console.log("http://"+serverIP+"/sms")
  request({
      url: "http://"+serverIP+"/sms",
      method: "POST",
      json: {
        number: req.body.number,
        msg: req.body.msg.trim(),
        from: req.body.user
      }
  }, function(err, res, body){
    console.log(body)
    console.log(err)
  })
});
app.listen(3000, "0.0.0.0", function () {
  console.log('Example app listening on port 3000!');
});
