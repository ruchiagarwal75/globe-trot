$(document).ready(function() {

    $('#origin, #destination, #ddate, #airline, #location, #phone, #email, #msg').bind('keyup', function() {
        if(allFilled()) $('#register').removeAttr('disabled');
    });

    function allFilled() {
        var filled = true;
        $('body input').each(function() {
            if($(this).val() == '') filled = false;
        });
        return filled;
    }

    $('#phone').keypress(function(e) {
        var k = e.which;
        if (k <= 48 || k >= 58) {e.preventDefault()};
    });

    function dateValidate() {
    var end_date = $('#ddate').val();
    console.log("date",end_date);
    if(new Date() > new Date(end_date))  alert('Trip Date should not be less then current date');
    }

});
