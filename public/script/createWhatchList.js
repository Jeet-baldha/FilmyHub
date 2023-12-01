
async function addMovie(id){

    console.log(parseInt(id));
    let response = await fetch('/movie/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify({id:id})
    });

    let results = await response.json();

    if(results.error === "Unauthorized"){
        alert("Please Loign first")
    }
    else{
        alert(results.message);
    }

    
}