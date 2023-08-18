import express  from "express";
import axios from "axios";

const app = express();
var port = 3000;
const url = "https://api.themoviedb.org/3/";
const BearerToken = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwNzAzMmU2YjA4NDMzNmRlMWQ1MTVhMmJhMTEyYmFkOCIsInN1YiI6IjY0ZDNlNDcwZGQ5MjZhMDFlOTg3YmQ1NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.nf3OISp0W87cprwZXdkN-4hgY0-dHR7k4w6o_TokVbI";
const config = {
    headers:{ Authorization: 'Bearer '+ BearerToken},
  }



app.set('view engine', 'ejs');
app.use(express.static("public"));


app.get('/', async (req, res) =>{
    try {
        let trendingMovieList = await axios.get(url +"trending/movie/day",config);
        let popularMovieList = await axios.get(url +"movie/popular",config);
        let latestMovieList = await axios.get(url +"discover/movie?sort_by=relase_date.asec",config);
        res.render('index',{
            trendingMovieList:trendingMovieList.data,
            popularMovieList:popularMovieList.data,
            latestMovieList:latestMovieList.data.results    
        }); 
    } catch (error) {
        res.status(404).send(error.message);
    }


});

app.get('/week', async (req, res) =>{

    try {
        let trendingMovieList = await axios.get(url +"trending/movie/week",config);
        let popularMovieList = await axios.get(url +"/movie/popular",config);
        res.render('index',{
            trendingMovieList:trendingMovieList.data,
            popularMovieList:popularMovieList.data
        });
    } catch (error) {
        res.status(404).send(error.message);
    }

});

app.listen(port, (req, res) =>{
    console.log('listening on port '+port);
});