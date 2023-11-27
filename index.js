import 'dotenv/config';
import express from "express";
import axios from "axios";
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import session from "express-session";
import passport  from 'passport';
import passportLocalMongoose from 'passport-local-mongoose';
import GoogleStrategy from 'passport-google-oauth20'
import FacebookStrategy from 'passport-facebook'
import findOrCreate from 'mongoose-findorcreate';


const app = express();
var port = 3000;
app.use(bodyParser.urlencoded({extended:true}));

const url = "https://api.themoviedb.org/3/";
const BearerToken = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwNzAzMmU2YjA4NDMzNmRlMWQ1MTVhMmJhMTEyYmFkOCIsInN1YiI6IjY0ZDNlNDcwZGQ5MjZhMDFlOTg3YmQ1NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nf3OISp0W87cprwZXdkN-4hgY0-dHR7k4w6o_TokVbI";
const config = {
    headers: { Authorization: 'Bearer ' + BearerToken },
}

app.use(session({
    secret:process.env.MONGOOSE_SECRET,
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/filmyHubDB");

const userShecma = new mongoose.Schema({
    // username:String,
    email:String,
    password:String,
    googleId:String,
    facebookId:String,
})

userShecma.plugin(passportLocalMongoose);
userShecma.plugin(findOrCreate);

const User = mongoose.model("user",userShecma);

passport.use(User.createStrategy());
passport.serializeUser((User, done)=> {done(null, User); });
passport.deserializeUser((User, done)=>{done(null, User);});

passport.use(new GoogleStrategy({
    clientID:process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/user",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    
    User.findOrCreate({ googleId: profile.id }, function (err,user) {
        console.log(profile);
        return cb(err, user);
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/user"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ facebookId: profile.id }, function (err, user) {
        return cb(err, user);
    });
  }
));


app.set('view engine', 'ejs');
app.use(express.static("public"));




const retryAxios = async (error, maxRetries = 3) => {
    for (let retryCount = 0; retryCount < maxRetries; retryCount++) {
        console.log(`Request failed, retrying (${retryCount + 1}/${maxRetries})`);
        try {
            return await axios(error.config);
        } catch (e) {
            if (retryCount === maxRetries - 1) {
                throw e; // Throw the error if max retries reached
            }
        }
    }
};

// Add an Axios interceptor to handle request errors
axios.interceptors.response.use(null, async (error) => {
    // Retry the request if it fails
    if (error.config && error.response && error.response.status >= 500) {
        return retryAxios(error);
    }
    throw error;
});

app.get('/', async (req, res) => {
    console.log(req.user);
    try {
        let trendingMovieListDay = await axios.get(url + "trending/movie/day", config);
        let trendingMovieListWeek = await axios.get(url + "trending/movie/week", config);
        let popularMovieList = await axios.get(url + "movie/popular", config);
        // let resplonse = await axios.get('https://api.themoviedb.org/3/discover/movie?release_date.desc', config);
        // let latestMovieList =[];

        // for(let i = 0;i<20;i++){
        //     let movie = resplonse.data.results[i];
        //     movie = await axios.get(`https://api.themoviedb.org/3/movie/${movie.id}/videos?language=en-US`,config);
        //     movie = movie.data.results;
        //     if(movie.length > 0){
                
        //         for(let j = 0;j < movie.length;j++) {
        //             if(movie[j].type === 'Trailer'){
        //                 latestMovieList.push(movie[j]); break
        //             }
        //         };

        //     }
        // }

        res.render('index', {
            trendingMovieListDay: trendingMovieListDay.data,
            trendingMovieListWeek: trendingMovieListWeek.data,
            popularMovieList: popularMovieList.data,
            // latestMovieList:latestMovieList  
        });
    } catch (error) {
        console.log(error);
        res.status(404).send(error.message);
    }


});



app.get('/movie', async (req, res) => {
   try {
     let popularMovieList = await axios.get(url + "movie/popular?page=1", config);
     res.render("movieList", {
         movieList: popularMovieList.data,
         btn: true
     })
   } catch (error) {
    console.log(error.message);
    res.status(404).send(error.message);
   }
});


app.get('/tv-show', async (req, res) => {
   try {
     let popularMovieList = await axios.get(url + "tv/popular?page=1", config);
     res.render("tv-showList", {
         movieList: popularMovieList.data,
         btn: true
     })
   } catch (error) {
    console.log(error.message);
    res.status(404).send(error.message);
   }
});

app.get('/search', async (req, res) => {

        const query = req.query.query;
        if (!query) {
            res.send('No search query provided.');
            return;
        }

        const newQuery = query.replace(/ /g, '%20');

        let movies = await axios.get(url + `/search/movie?query=${newQuery}&include_adult=false`, config);
        res.render("movieList", {
            movieList: movies.data,
            btn: false
        })

    })


app.get('/movie/:id', async (req, res) => {

    try {
        let movieDetails = await axios.get(`${url}movie/${req.params.id}`, config);
        let castDetails = await axios.get(`${url}movie/${req.params.id}/credits?language=en-US`, config);
        res.render("movie", {
            movie: movieDetails.data,
            casts: castDetails.data
        })
    } catch (error) {
        res.status(404).send(error.message);
    }

});




app.get('/signup', (req, res) => {

    res.render("signup");

});


app.post('/signup', (req, res) =>{
    User.register({username:req.body['email']},req.body['password'], function(err,nUser){
        if(err){
            console.log(err);
            res.redirect('/signup');
        }
        else{
            User.authenticate('local') (req,res,() =>{
                console.log(nUser);
                res.redirect('/');
            })
        }
    })
})

app.get('/auth/facebook',
  passport.authenticate('facebook')
);

app.get('/auth/facebook/user',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

app.get('/auth/google/user', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.    
    res.redirect('/');
  });


app.get('/login', (req, res) => {

    res.render('login');

});

app.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login'
    
}));


app.listen(port, (req, res) => {
    console.log('listening on port ' + port);
});