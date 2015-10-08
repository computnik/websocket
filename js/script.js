// TEST CODE


var Connect = {};
$('#connect').click(function(e) {
    $(this).hide();
    $('#disconnect').show();
    $('#input').prop("disabled", false);
    $('#content').css("background-color", "white");
    $('#status').text("Established");
    $('#send').show();
    Connect = new socket();
    Connect.createSocket(config.host, config.websocketPort, function(data) {
        $('#content').append(data + '<br />');
    });
});

$('#disconnect').click(function(e) {
    $(this).hide();
    $('#connect').show();
    $('#send').hide();
    $('#input').prop("disabled", true);
    $('#content').css("background-color", "#ddd");
    $('#status').text("");
});

$('#send').click(function(e) {
    var data = $('#input').val();
    $('#input').val("");
    Connect.sendMessage(data);
});

$(document).ready(function() {
    setTimeout(function() {
        $('#connect').click();
        $('#input').val("CheckVal");
        setTimeout(function() {
            $('#send').click();
        }, 1000);

    }, 1000);
    window.onbeforeunload = function() {
        Connect.closeSocket();
    };
});