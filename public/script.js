$().ready(function() {

    $('.today').click(function() {
        $('.today').addClass('selected');
        $('.week').removeClass('selected');
        $('.dayList').css('display', 'flex');
        $('.weekList').css('display', 'none');

    });

    $('.week').click(function() {
        $('.week').addClass('selected');
        $('.today').removeClass('selected');
        $('.weekList').css('display', 'flex');
        $('.dayList').css('display', 'none');

    });

    $('.search-btn').hover(
        function() {
            // Your code for mouseenter
           

        },
        function() {
            // Your code for mouseleave
        }
    );

    
    
    
    
    

    var page = 2;
    const apiKey = "73b27bfeb96b523c9a9f0eeabaa2b90f";
    $('#load-more').click(function(){

        var url = `https://api.themoviedb.org/3/movie/popular?page=${page}&api_key=${apiKey}`;
        let html = "";  
        $.get(url,function(data){
            data.results.forEach(movie => {
                html += `<div class="movie-card">
                <a href="/movie/${movie.id}"><img src="https://image.tmdb.org/t/p/w500/${ movie.poster_path}"
                        alt="${movie.title} Poster" /></a>
                        <div class="details">
                    <div class="rating" style="font-size: 12px">
                        ${movie.vote_average.toFixed(2)}
                    </div>
                    <h4 class="movie-name">
                        ${movie.title}
                    </h4>
                    <p class="movie-date" style="font-size: 12px">
                        ${movie.release_date}
                    </p>
                </div>
            </div>`
            });
            $(".movie-content").append(html);
            page++;
        });


    });
    

});


