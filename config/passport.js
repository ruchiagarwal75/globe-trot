

var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var configAuth = require('./auth');


module.exports = function(passport, dbCOnnectionObj){
    //*********** FACEBOOK AUTHENTICATION START HERE */


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


}