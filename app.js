var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var dbCOnnectionObj;
// Connect to the db
MongoClient.connect("mongodb://admin:password@ds145359.mlab.com:45359/globe_trot", function(err, db) {
  if(!err) {
    console.log("Database connection made!");
    dbCOnnectionObj = db;
  }
  else {
      console.log('Error in connecting to database');
  }
});
//adding static files
app.use('/static', express.static('static'));
//adding body parser to fetch post requests
var bodyParser=require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/login', function (req, res) {
    var collection = dbCOnnectionObj.collection('users');
    collection.findOne({Email: req.body.email}, function(err, item) {
        if (item) {
            res.sendFile(__dirname + '/dashboard.html');
        }
        else {
            console.log('Bad req');
        }
    });
});
app.post('/addtrip', function (req, res) {
    var collection = dbCOnnectionObj.collection('TravelDetails');
    collection.insertOne({StartPoint:req.body.origincity,EndPoint:req.body.destinationcity,StartDate:req.body.startdate}, function(err, item) {
        if (item) {
            res.sendFile(__dirname + '/mytrips.html');
        }
        else {
            console.log('Bad req');
        }
    });
});
app.get('/dashboard', function (req, res) {
    res.sendFile(__dirname + '/dashboard.html');
});
app.get('/addtrip', function (req, res) {
     res.sendFile(__dirname + '/addtrip.html');
});
app.listen('8000', 'localhost');
console.log('Server started at 8000');