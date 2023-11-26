import React from "react";

function CastCard() {
    return(
        <div class="movie-card">
            <a href=""><img src="assest/image/movieDefualt.png" alt="" /></a>
            <div class="details">
                <div class="rating" style="font-size: 12px">
                    4.5
                </div>
                <h4 class="movie-name">
                    Jeet Baldha
                </h4>
                <p class="movie-date" style="font-size: 12px">
                    26/12/2003
                </p>
            </div>
        </div>
    )
}


export default CastCard;