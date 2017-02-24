var express = require('express');
var app = express();

app.use('/static', express.static('static'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.listen('8000', 'localhost');
console.log('Server started at 8000');