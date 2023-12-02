import passport from 'passport';
import User from './databse.js';
import { Strategy as LocalStrategy } from 'passport-local';
import GoogleStrategy from 'passport-google-oauth20'
import FacebookStrategy from 'passport-facebook'





// --------------------------------  Strategy ----------------------------------------------------

passport.use(new LocalStrategy((usernameOrEmail, password, done) => {
    User.findOne({ $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }] })
      .then(user => {
        if (!user) {
          return done(null, false, { message: 'Incorrect username or email.' });
        }
  
        // Use the authenticate method provided by passport-local-mongoose
        user.authenticate(password, (err, authenticatedUser) => {
          if (err) {
            return done(err);
          }
  
          if (!authenticatedUser) {
            return done(null, false, { message: 'Incorrect password.' });
          }
  
          // If authentication is successful, return the user
          return done(null, authenticatedUser);
        });
      })
      .catch(err => {
        return done(err);
      });
}));


passport.use(new FacebookStrategy({
    clientID:process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://filmyhub-6i1t.onrender.com/auth/facebook/user",
    profileFields: ['id', 'displayName', 'photos', 'email']
    },
    async function(accessToken, refreshToken, profile, cb) {
     try {
      let nuser = await User.findOne({facebookId:profile.id});
     
      if(!nuser){
       nuser = new User({
         facebookId: profile.id,
         username: profile.displayName,
       })
       await nuser.save();
  
       return cb(null, nuser);
      }
     } catch (error) {
      return cb(error,null);
     }
    }
  ));


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://filmyhub-6i1t.onrender.com/auth/google/user",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  async function(accessToken, refreshToken, profile, cb) {
    // Use the findOrCreate method provided by the plugin
    try {
      let user = await User.findOne({ googleId: profile.id });
      const username = profile.displayName.replace(' ', '');
    
      if(!user){
        user = new User({
          googleId: profile.id,
          username: username
        });
      }
    
      await user.save();
    
      return cb(null, user);
    } catch (error) {
      return cb(error, null);
    }
  }
  ));



// ---------------------------------------------------------------- Request handeling ----------------------------------------------------------------
export const signup = (req, res) => {

    User.register({username:req.body['username'],email:req.body.email},req.body['password'],function(err,nuser){
        if(err){
            console.log(err.message);
            res.redirect('/signup');
        }
        else{
            passport.authenticate('local') (req, res, () =>{
                res.redirect('/');
            });
        }
    })

}

export const login = (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true, // Enable flash messages if needed
    })(req, res, next);
};


export const logout = (req, res) => {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
})};

export const googleAuth = (req, res) => {
    passport.authenticate('google', { failureRedirect: '/login' })(req, res, () => {
        res.redirect('/');
    })
}

export const facebookAuth = (req, res) => {
    passport.authenticate('facebook', { failureRedirect: '/login' }) (req, res, () => {
        res.redirect('/');
    })
}