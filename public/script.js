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

    

});


