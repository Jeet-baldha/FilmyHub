console.log("hello world!");
$(".week").click(function (){

    $("week").addClass("selected");
    updateTrend("week");

    $(".today").removeClass("selected");

})

$(".today").click(function (){

    $("today").addClass("selected");
    updateTrend("day");

    $(".week").removeClass("selected");

})

