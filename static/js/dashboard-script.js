
$(function() {
    $( '.autocomplete' ).each(function () {
        var apca = new apc('autocomplete', {
            key : '1e113691bf',
            secret : '469ee71afc5abde', // Your API Secret Key: use this if you are not connecting from a web server
            limit : 7
        });

        var dataObj = {
            source: function( request, response ) {
                apca.request( request.term );
                itemObj = function (airport, isChild) {
                    var label;
                    if (isChild) { // format children labels
                        label = '&rdsh;' + airport.iata + ' - ' + airport.name;
                    } else {
                        label = airport.city;
                    }
                    return {
                        label: label,
                        value: airport.iata + ' - ' + airport.city,
                        code: airport.iata
                    };
                };
                apca.onSuccess = function (data) {
                    var listAry = [],
                        thisAirport;
                    if (data.status) { // success
                        for (var i = 0, len = data.airports.length; i < len; i++) {
                            thisAirport = data.airports[i];
                            listAry.push(itemObj(thisAirport));
                            if (thisAirport.children) {
                                for (var j = 0, jLen = thisAirport.children.length; j < jLen; j++) {
                                    listAry.push(itemObj(thisAirport.children[j], true));
                                }
                            }
                        }
                        response(listAry);
                    } else { // no results
                        response();
                    }
                };
                apca.onError = function (data) {
                    response();
                    console.log(data.message);
                };
            },
            select: function( event, ui ) {
                console.log(ui.item.code);
            }
        };
        $(this).autocomplete(dataObj).data("ui-autocomplete")._renderItem = function( ul, item) {
            return $('<li></li>').data('item.autocomplete', item ).html( item.label ).appendTo( ul );
        };
    });
});