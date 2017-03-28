var express = require('express');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var cookie = require('cookie');

var sessions= require('client-sessions');
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var bcrypt=require('bcryptjs');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;
var configAuth = require('./config/auth');

app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());
var connections = [];
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var dbCOnnectionObj;

// Connect to the db test
// test commit TEST
var port = process.env.PORT || 8080;
MongoClient.connect("mongodb://admin:password@ds145359.mlab.com:45359/globe_trot", function (err, db) {
    if (!err) {
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
var bodyParser = require('body-parser');

//setting view engine
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

//session management
app.use(sessions(
    {
        cookieName: 'session',
        secret: 'hjgwdjhnasbch2r4rcu7867hbgujgqyu287863vxqv'
    })
);

app.get('/', function (req, res) {
    if (req.session) {
         req.session.reset();
    }
    res.sendFile(__dirname + '/index.html');
});
app.get('/login', function (req, res) {

    if (req.session) {
        req.session.reset();
    }
    res.sendFile(__dirname + '/index.html');
});

app.post('/login', function (req, res) {
    
    var collection = dbCOnnectionObj.collection('users');
    collection.findOne({email: req.body.email}, function (err, item) {
        if (item) {
            req.session.passport = {};
            req.session.passport.user = item;
            res.redirect('/dashboard');
        }
        else {
            console.log('Wrong Credentials');
            res.redirect('/login');
        }
    });
});

app.post('/register', function (req,res){
    var userDetails = req.body;
    var newUser = {
        email: userDetails.email,
        name: userDetails.first_name +" "+ userDetails.last_name,
        password: userDetails.password 
    };
     var collection = dbCOnnectionObj.collection('users');
     collection.insertOne(newUser, function(err, item) {
        if (err) {
            return err;
        }
        res.redirect('/');
   });
});

app.get('/profile', function (req, res) {   
    var udata = {};
    var collection = dbCOnnectionObj.collection('users');
   // var emailAdress = (req.session.user && req.session.user.email) || req.session.passport.user.email;
   var userId = "58afab46e634ce31a98bb014";
   var ObjectID=require('mongodb').ObjectID;
   var o_id = new ObjectID(userId);
        collection.findOne({_id:o_id}, function (err, item) {
		    if (item) {     
            udata.fname	=item.FName;
            udata.lname	=item.LName	;
            udata.email=item.email;
            udata.phone=item.phone;
            udata.address=item.address;
            udata.interest=item.interest;
            udata.references=item.references;
            udata.rating=item.rating;
            udata.age=item.age;
        }
        else {
            console.log('User Not found');
        }
		});
    setTimeout(function () {
        res.render('profile',{userDetail: udata});
        res.end();
    }, 1000);
});

app.post('/profile', function (req, res) {    
    var collection = dbCOnnectionObj.collection('users');
      var ObjectID=require('mongodb').ObjectID;
var userData = {};
    if( req.body.first_name !=null)
userData["FName"]= req.body.first_name;
    if( req.body.last_name !=null)
userData["LName"]= req.body.last_name;
    if( req.body.phone !=null)
userData["phone"]= req.body.phone;
    if( req.body.age !=null)
userData["age"]= req.body.age;
    if( req.body.address !=null)
userData["address"]= req.body.address;
    if( req.body.interest !=null)
userData["interest"]= req.body.interest;
    if( req.body.references !=null)
userData["references"]= req.body.references;
    if( req.body.rating !=null)
userData["rating"]= req.body.rating;       
    var userId = "58afab46e634ce31a98bb014";
    var o_id = new ObjectID(userId);
    var obj
    collection.update(
                {'_id':o_id},
                {$set: userData}
                ,function (err, item)
                {
                        if (err) {
                            console.log('Bad req');
                        }
                        else {
                            res.redirect('/dashboard');
                        }
                }
    );
});

app.post('/addtrip', function (req, res) {
    console.log(req.body.photo);
    var collection = dbCOnnectionObj.collection('trips');
    var userUniqueID = req.session.passport.user._id;
    var name = req.session.passport.user.UserName;
    var photo = req.session.user.photo;
    collection.insertOne({
            userID: userUniqueID, UserName: name, avtar:photo,
            email: req.body.email, origin: req.body.origin,
            destination: req.body.destination, ddate: req.body.ddate, airline: req.body.airline,
            ticketbooked: req.body.ticketbooked, phone: req.body.phone, msg: req.body.msg,reward: req.body.reward
        },
        function (err, item) {
            if (item) {
                res.redirect('/mytrips');
            }
            else {
                console.log('Bad req');
            }
        });
});


app.get('/addtrip', function (req, res) {
    res.sendFile(__dirname + '/addtrip.html');
});



app.get('/dashboard', function (req, res) {
    var session = req.session;

     if(! (Object.keys(session).length === 0 && session.constructor === Object)){ //checking if session exists
        var user = (session.passport && session.passport.user) || session.user;
        res.render('dashboard', {user: user});

     }
      else{
        console.log(' dashboard session doesnot exist');
        session.reset();
        res.redirect('/login');
    }

});

app.post('/trips', function (req, res) {
    var searchBy = req.body;
    var dataTrips = [];
    var collection = dbCOnnectionObj.collection('trips');
    collection.find({origin: searchBy.term[0], destination: searchBy.term[1]}, function (err, trips) {
        trips.each(function (err, item) {
            if (item)
                dataTrips.push(item);
        });
    });
    setTimeout(function () {
        res.render('trips', {tripsData: dataTrips});
        res.end();
    }, 500);
});

app.get('/fire', function (req, res) {
    res.render('firebaseauth');
});
app.get('/mytrips', function (req, res) {
    var userTrips = [];
    var collection = dbCOnnectionObj.collection('trips');
    var email = (req.session.user && req.session.user.email) || (req.session.passport && req.session.passport.user.email) || 'nouser';
    collection.find({user: email}, function (err, trips) {
        trips.each(function (err, item) {
            if (item)
                userTrips.push(item);
        });
    });
    setTimeout(function () {
        res.render('mytrips', {trips: userTrips});
        res.end();
    }, 1000);
});

app.get('/groups', function (req, res){
    res.render('groups');
});
app.post('/createGroup', function(req,res){
    var group = req.body;
    group.user = req.session.passport.user.email;
    var collection = dbCOnnectionObj.collection('groups');
    collection.insertOne(group, function(err){
        if(err) {
            res.send(err);
        }
        else {
            res.send('success');
        }
    });

});

 app.get('/messages', function(req, res){
        if(!req.session.passport) {
            console.log("session doesnt exist");
            res.end();
            return;
        }
        var user = req.session.passport.user.email;
       var collection = dbCOnnectionObj.collection('messages');
       console.log(user);
       var chats = [];
       var senders= [];
       collection.find( {$or : [{senderEmail:user}, {receiverEmail:user}]},function (err, responseData) {
            responseData.each(function(err, item){
                if(item) {
                    chats.push(item);
                }
            });
       });
       
        setTimeout(function(){
        for(var i =0; i<chats.length; i++){
            var chat = chats[i];
            if(chat.senderEmail == user){
                senders.push({name: chat.receiverName, email: chat.receiverEmail});
            }
            else {
                senders.push({name: chat.senderName, email: chat.senderEmail});
            }
        }
        res.render('messages', {chats: senders});  
      //  res.end(); 
    },1000);
     
 });
 var chatroom;
  io.sockets.on('connection', function(socket) {
    connections.push(socket);  
    socket.join(chatroom); 
    console.log('connected %s sockets', connections.length);
    
    socket.on('disconnect', function(){
        connections.splice(connections.indexOf(socket), 1);
        console.log('Disconnected %s sockets connected', connections.length);
    });
    
    socket.on('send message', function(data) {
        var msg = [];
        var collection = dbCOnnectionObj.collection('messages');
        var trips = data.trips;
        var chatid = data.chatid;
        var senderName = data.senderName;
        msg.push(senderName+" : "+data.msg);
        var message = {
          chatid: chatid,  
          message: msg,
          senderName: senderName,
          senderEmail: data.senderEmail,
          receiverName: data.receiverName,
          receiverEmail: data.receiverEmail
        }

        io.sockets.to(chatid).emit('new message', {msg:data.msg, user:data.senderName});
        
            
             if(!trips) {
                 console.log("Value of message is ="+JSON.stringify(message));
                collection.insertOne(message, function(err){
                  
                });
                trips=true;
             }
             else if(trips){
                  var chat = senderName+" : "+data.msg;
                  collection.update({chatid:chatid},{$addToSet:{message: chat}}, function(err){
                   if(!err) {
                       console.log('saved new message');
                   }
                   else {
                       console.log(err);
                   }
                });
             }
    });
  });
  
app.get('/contact', function(req,res){
    console.log("contact");
    var msg = {};
     msg.receiverName = req.query.receiverName;
     msg.receiverEmail = req.query.receiverEmail;
     msg.senderName = req.session.passport.user.name;
     msg.senderEmail = req.session.passport.user.email;
    var collection = dbCOnnectionObj.collection('messages');
    var chats;
    
    var chatid = getChatId(msg.senderName, msg.receiverName);
    chatroom = chatid;
    console.log(chatid+"***");
     collection.findOne({chatid: chatid},function (err, responseData) {
         if(responseData){
             console.log(">>>"+responseData);
              msg.trips = responseData;
              chats = responseData.message;
         }
         else {
             chats = [];
         }
         console.log(chats);
       res.render('contact', {messages: chats, chatid: chatid, msg:msg});
     });
   // res.sendFile(__dirname + '/contact.html');

});
 

function getChatId(str1, str2) {
var str = str1+str2;
return str.toLowerCase().split('').sort(function (strA, strB) {
    return strA.toLowerCase().localeCompare(strB.toLowerCase());
}
).join('')
}




app.get('/socket', function(req, res){
    console.log("req mase successfully");
    console.log(sessions[req.query.chatid]);
    res.send(sessions[req.query.chatid]);
});




//*********** FACEBOOK AUTHENTICATION START HERE */
app.get('/auth/facebook', passport.authenticate('facebook', {scope: ['email']}));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
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
	    				 	return done(null, newUser.google);
	    				})
	    			}
	    		});
	    	});
	    }

	));
  //*********GOOGLE AUTH END HERE */





// app.listen('8001', 'localhost');
// console.log('Server started at 8001');


server.listen(port, function() {
    console.log("App is running on port " + port);
});