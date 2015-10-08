var config = {
    "websocketPort": 8001,
    "getPort": 8002,
    "host": "localhost"
}

var XMLHttpFactories = [

    function() {
        return new XMLHttpRequest()
    },
    function() {
        return new ActiveXObject("Msxml2.XMLHTTP")
    },
    function() {
        return new ActiveXObject("Msxml3.XMLHTTP")
    },
    function() {
        return new ActiveXObject("Microsoft.XMLHTTP")
    }
];

var createXMLHTTPObject = function() {
    var xmlhttp = false;
    for (var i = 0; i < XMLHttpFactories.length; i++) {
        try {
            xmlhttp = XMLHttpFactories[i]();
        } catch (e) {
            continue;
        }
        break;
    }
    return xmlhttp;
}
var sendRequest = function(url, callback, postData) {
    var req = createXMLHTTPObject();
    if (!req) return;
    var method = (postData) ? "POST" : "GET";
    req.open(method, url, true);
    req.setRequestHeader('User-Agent', 'XMLHTTP/1.0');
    if (postData)
        req.setRequestHeader('Access-Control-Allow-Origin', '*');
    req.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    req.onreadystatechange = function() {
        if (req.readyState != 4) return;
        if (req.status != 200 && req.status != 304) {
            //          alert('HTTP error ' + req.status);
            return;
        }
        callback(req);
    }
    if (req.readyState == 4) return;
    req.send(postData);
}

var lastCommunicated = {};

var socket = function() {
    var webSocket;
    var socketWorking = true;
    var createSocket = function(host, port, callback) {
        if (host === undefined) {
            host = config.host;
            port = config.websocketPort;
        }
        if (port === undefined) {
            port = config.websocketPort;
        }
        var addr = "ws://" + host + ":" + port;
        try {
            if (!window.WebSocket) {
                errorHandler("BROWSER NOT SUPPORTED");
            }
            webSocket = new WebSocket(addr);
            webSocket.onopen = function(event) {
                // Call connected callback
                webSocket.onmessage = function(event) {
                    if (event.data === "H") {
                        lastCommunicated = (new Date());
                        if (callback) {
                            callback(event.data);
                        }
                    } else {
                        if (callback) {
                            callback(event.data);
                        } else
                            console.log("WebSocket Data Recieved - " + event.data);

                    }
                }
            };
            webSocket.onerror = function(event) {
                errorHandler("Socket not available"); /*Try handling*/
            }

            webSocket.onclose = function(event) {
                // call disconnected callback;
            }
        } catch (err) {
            errorHandler(err);
        }
    };
    var closeSocket = function() {

        webSocket.close();
    };

    var checkIfAlive = function() {
        if (webSocket.readyState === 1)
            return true;
        else
            return false;
    };

    var closeSocket = function() {
        webSocket.close();
    };

    var errorHandler = function(err) {
        console.log(err);
        if ((window.WebSocket) || (checkIfAlive())) {

        } else {
            socketWorking = false;
        }
    };

    var sendMessage = function(msg) {
        if ((socketWorking) && (webSocket !== undefined) && (webSocket.readyState === 1)) {
            if (lastCommunicated === {}) {
                lastCommunicated = new Date();
            }
            var timeDiff = new Date() - lastCommunicated;
            if (timeDiff > 5000) {
                errorHandler("Socket Not Responding");
                socketWorking = false;

            } else {
                webSocket.send(msg);
            }
        } else {
            makeGetCall(msg);
            errorHandler("Unable to send Socket Message");
        }

    };

    var makeGetCall = function(msg) {
        var url = "http://" + config.host + ":" + config.getPort + "?data=" + msg;
        var callback = function(log) {
            console.log("data sent through get call" + log)
        };
        sendRequest(url, callback, false);

    };
    var me = {
        sendMessage: sendMessage,
        createSocket: createSocket,
        closeSocket: closeSocket,
        checkIfAlive: checkIfAlive,
        errorHandler: errorHandler,
        makeGetCall: makeGetCall,
        webSocket: webSocket
    };

    return me;
}