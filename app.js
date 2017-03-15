var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var sessions= require('client-sessions');
var bcrypt=require('bcryptjs');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var configAuth = require('./config/auth');
app.use(passport.initialize());
app.use(passport.session());

var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var dbCOnnectionObj;

// Connect to the db test
// test commit TEST
var port = process.env.PORT || 8080
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

//setting view engine
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));

//session management
app.use(sessions({
    cookieName:'session',
    secret:'hjgwdjhnasbch2r4rcu7867hbgujgqyu287863vxqv'
}));

app.get('/', function (req, res) {
     if(req.session){
        req.session.reset();
    }
    res.sendFile(__dirname + '/index.html');
});
app.get('/login', function (req, res) {
     if(req.session){
        req.session.reset();
    }
    res.sendFile(__dirname + '/index.html');
});

app.post('/login', function (req, res) {
    var collection = dbCOnnectionObj.collection('users');
    collection.findOne({email: req.body.email}, function(err, item) {
        if (item) {
            req.session.user = item;
            res.redirect('/dashboard');
        }
        else {
            console.log('Wrong Credentials');
            res.redirect('/login');
        }
    });
});
app.post('/addtrip', function (req, res) {
    var collection = dbCOnnectionObj.collection('TravelDetails');
    //console.log(JSON.stringify(req.body));
    var email = (req.session.user && req.session.user.email) || req.session.passport.user.email;
    collection.insertOne({user: email,StartPoint:req.body.origincity,EndPoint:req.body.destinationcity,StartDate:req.body.startdate}, function(err, item) {
        if (item) {
            res.redirect('/mytrips');
        }
        else {
            console.log('Bad req');
        }
   });
});
app.get('/dashboard', function (req, res) {
    var session = req.session;
     if(! (Object.keys(session).length === 0 && session.constructor === Object)){
        var user = (session.passport && session.passport.user) || session.user; 
        res.render('dashboard', {user: user});  
     }
      else{
        console.log(' dashboard session doesnot exist');
        session.reset();
        res.redirect('/login');
    }

});
app.get('/addtrip', function (req, res) {
     res.sendFile(__dirname + '/addtrip.html');
});
app.get('/mytrips', function (req, res) {
    var userTrips = [];
    var collection = dbCOnnectionObj.collection('TravelDetails');
    var email = (req.session.user && req.session.user.email) ||(req.session.passport && req.session.passport.user.email) || 'nouser';
    collection.find({user: email}, function(err, trips) {
        trips.each(function(err, item){
         if(item)
            userTrips.push(item);
        });
    });
    setTimeout(function(){
        res.render('mytrips', {trips: userTrips});  
        res.end(); 
    },1000);
});

//*********** FACEBOOK AUTHENTICATION START HERE */
app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
      console.log(JSON.stringify(req.url));
      
    //  alert('hereee');
    // Successful authentication, redirect home.
    res.redirect('/dashboard');
  });

  passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});
 passport.use(new FacebookStrategy({
	    clientID: configAuth.facebookAuth.clientID,
	    clientSecret: configAuth.facebookAuth.clientSecret,
	    callbackURL: configAuth.facebookAuth.callbackURL,
        profileFields: ['id', 'photos', 'emails','name']

	  },
	  function(accessToken, refreshToken, profile, done) {
	    	process.nextTick(function(){
                 var collection = dbCOnnectionObj.collection('users');
	    		collection.findOne({'id': profile.id}, function(err, user){
	    			if(err)
	    				return done(err);
	    			if(user)
	    				return done(null, user);
	    			else {
                        
	    				var newUser = {
                            facebook: {}
                        };
	    				newUser.facebook.id = profile.id;
	    				newUser.facebook.token = accessToken;
	    				newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
	    				newUser.facebook.email = profile.emails[0].value;
                        newUser.facebook.photo = profile.photos[0].value;
                       
	    				 collection.insertOne(newUser.facebook, function(err){
	    					if(err)
	    						throw err;
	    				 	return done(null, newUser.facebook);
	    				})
	    			}
	    		});
	    	});
	    }

	));
//****************FACEBOOK AUTH ENDS HERE */

//***** GOOGLE AUTH START HERE */
app.get('/auth/google', passport.authenticate('google', {scope: ['profile','email']}));

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
      console.log(JSON.stringify(req.url));
      
    //  alert('hereee');
    // Successful authentication, redirect home.
    res.redirect('/dashboard');
  });

 passport.use(new GoogleStrategy({
	    clientID: configAuth.googleAuth.clientID,
	    clientSecret: configAuth.googleAuth.clientSecret,
	    callbackURL: configAuth.googleAuth.callbackURL,
        profileFields: ['id', 'photos', 'emails','name']

	  },
	  function(accessToken, refreshToken, profile, done) {
	    	process.nextTick(function(){
                 var collection = dbCOnnectionObj.collection('users');
	    		collection.findOne({'id': profile.id}, function(err, user){
	    			if(err)
	    				return done(err);
	    			if(user)
	    				return done(null, user);
	    			else {
                        
	    				var newUser = {
                            google: {}
                        };
	    				newUser.google.id = profile.id;
	    				newUser.google.token = accessToken;
	    				newUser.google.name = profile.displayName;
	    				newUser.google.email = profile.emails[0].value;
                        newUser.google.photo = profile.photos[0].value;
                       
	    				 collection.insertOne(newUser.google, function(err){
	    					if(err)
	    						throw err;
	    				 	return done(null, google);
	    				})
	    			}
	    		});
	    	});
	    }

	));
  //*********GOOGLE AUTH END HERE */





// app.listen('8001', 'localhost');
// console.log('Server started at 8001');


app.listen(port, function() {
    console.log("App is running on port " + port);
});

