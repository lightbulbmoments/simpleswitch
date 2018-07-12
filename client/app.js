var express = require('express');
var path = require('path')
var app = express();
// app.host = "";
app.use('/static', express.static(path.join(__dirname, 'public')))
app.get('/', function (req, res) {
  res.sendFile('./client.html' , { root : __dirname});
});
app.listen(3000, "0.0.0.0", function () {
  console.log('Example app listening on port 3000!');
});
