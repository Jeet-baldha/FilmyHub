import 'dotenv/config';
import express from "express";
import axios from "axios";
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import session from "express-session";
import passport from 'passport';
import passportLocalMongoose from 'passport-local-mongoose';
import FacebookStrategy from 'passport-facebook'
import { Strategy as LocalStrategy } from 'passport-local';
import findOrCreate from 'mongoose-findorcreate';
import flash from 'connect-flash'
import * as auth from './authentication.js'
import User from './databse.js'

const app = express();
var port = 3000;
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

const url = "https://api.themoviedb.org/3/";
const BearerToken = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwNzAzMmU2YjA4NDMzNmRlMWQ1MTVhMmJhMTEyYmFkOCIsInN1YiI6IjY0ZDNlNDcwZGQ5MjZhMDFlOTg3YmQ1NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nf3OISp0W87cprwZXdkN-4hgY0-dHR7k4w6o_TokVbI";
const config = {
    headers: { Authorization: 'Bearer ' + BearerToken },
}


app.use(session({
    secret:process.env.MONGOOSE_SECRET,
    resave:false,
    saveUninitialized:false,
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 day (in milliseconds)
        // Other cookie options if needed...
    },
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session()); 

mongoose.connect("mongodb://localhost:27017/filmyHubDB");

passport.use(User.createStrategy());
passport.serializeUser((User, done)=> {done(null, User); });
passport.deserializeUser((User, done)=>{done(null, User);});

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

var isAuth = false;
var username = "";
app.get('/', async (req, res) => {

     isAuth  = req.isAuthenticated();
     username = "";
    if(isAuth){
      console.log(req.user);
      username = req.user.username;
    }
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
            isAuthenticated:isAuth,
            username:username
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
         btn: true,
         isAuthenticated:isAuth,
         username:username
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
         btn: true,
         isAuthenticated:isAuth,
         username:username
     })
   } catch (error) {
    console.log(error.message);
    res.status(404).send(error.message);
   }
});

app.get('/search', async (req, res) => {

      try {
          const query = req.query.query;
          if (!query) {
              res.send(404);
          }
  
          const newQuery = query.replace(/ /g, '%20');
  
          let movies = await axios.get(url + `/search/movie?query=${newQuery}&include_adult=false`, config);
          res.render("movieList", {
              movieList: movies.data,
              btn: false,
              isAuthenticated:isAuth,
              username:username
          })
      } catch (error) {
        console.log(error.message);
        res.redirect('/');
      }

    })


app.get('/movie/:id', async (req, res) => {

    try {
        let movieDetails = await axios.get(`${url}movie/${req.params.id}`, config);
        let castDetails = await axios.get(`${url}movie/${req.params.id}/credits?language=en-US`, config);
        res.render("movie", {
            movie: movieDetails.data,
            casts: castDetails.data,
            isAuthenticated:isAuth,
            username:username,
            id:req.params.id
        })
    } catch (error) {
        res.status(404).send(error.message);
    }

});
app.post('/movie/add', async (req, res) => {
  const id = req.body.id;

  // Check if the user is authenticated
  if (req.isAuthenticated()) {
    const userID = req.user._id;

    try {
      const user = await User.findOne({ _id: userID });

      if (user.watchList.includes(id)) {
        res.status(200).json({ message: 'Movie is already in watchList' });
      } else {
        const result = await User.updateOne(
          { _id: userID },
          { $push: { watchList: id } }
        );
        res.status(201).json({ message: 'Movie added to watchList successfully' });
      }
    } catch (error) {
      console.error('Error updating watchList:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});


app.get('/watchlist', async (req, res) => {
  try {
    if (isAuth) {
      const userID = req.user._id;
      const user = await User.findById(userID);

      let movieList = {
        results: []
      };

      if (user.watchList.length > 0) {
        // Map movie IDs to an array of axios promises
        const axiosPromises = user.watchList.map(async (id) => {
          const movieDetails = await axios.get(`${url}movie/${id}`, config);
          return movieDetails.data;
        });

        // Wait for all axios promises to resolve
        const movieDetailsArray = await Promise.all(axiosPromises);

        // Populate movieList with resolved movieDetails
        movieList.results = movieDetailsArray;

        res.render('movieList', {
          movieList: movieList,
          btn: false,
          isAuthenticated: isAuth,
          username: username
        });
      } else {
        res.render('movieList',{
          message:"Please add Movie in movieList",
          btn: false,
          isAuthenticated: isAuth,
          username: username
        });
      }
    } else {
      res.status(401).json({ error: 'Unauthorized' });
     
    }
  } catch (error) {
    console.error('Error fetching watchlist:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});







app.get('/signup', (req, res) => {
    res.render("signup");
});


app.post('/signup', auth.signup);

app.get('/auth/facebook',
  passport.authenticate('facebook')
);
app.get('/auth/facebook/user',auth.facebookAuth);

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

app.get('/auth/google/user', auth.googleAuth);

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/logout', auth.logout)

app.post('/login',auth.login );



app.listen(port, (req, res) => {
    console.log('listening on port ' + port);
});