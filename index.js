import express from "express";
import axios from "axios";
import React from 'react';
import { renderToString } from 'react-dom/server';
// import Cast from "./Cast";

const app = express();
var port = 3000;
const url = "https://api.themoviedb.org/3/";
const BearerToken = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwNzAzMmU2YjA4NDMzNmRlMWQ1MTVhMmJhMTEyYmFkOCIsInN1YiI6IjY0ZDNlNDcwZGQ5MjZhMDFlOTg3YmQ1NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nf3OISp0W87cprwZXdkN-4hgY0-dHR7k4w6o_TokVbI";
const config = {
    headers: { Authorization: 'Bearer ' + BearerToken },
}



app.set('view engine', 'ejs');
app.use(express.static("public"));

app.get('/', async (req, res) => {
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
        res.status(404).send(error.message);
    }


});

app.get('/movie', async (req, res) => {
    let popularMovieList = await axios.get(url + "movie/popular?page=1", config);
    res.render("movieList", {
        movieList: popularMovieList.data,
        btn: true
    })
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


app.get('/cast', (req,res) =>{
    const reactMarkup = ReactDOMServer.renderToString(React.createElement(Cast));
    res.render("cast", {
        reactMarkup: reactMarkup
    })
});  

app.listen(port, (req, res) => {
    console.log('listening on port ' + port);
});