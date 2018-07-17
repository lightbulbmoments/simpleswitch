function createSimple(callerURI, displayName, remoteVideo, buttonId) {
    var remoteVideoElement = document.getElementById(remoteVideo);
    console.log(remoteVideoElement)
    var button = document.getElementById(buttonId);
    var answer = document.getElementById('answer');
    var register = document.getElementById('register');
    var unregister = document.getElementById('unregister');
    
    var incomingCallAudio = new window.Audio('https://code.bandwidth.com/media/incoming_alert.mp3');
    incomingCallAudio.loop = true;
    
    var configuration = {
        media: {
            remote: {
                // video: remoteVideoElement,
                // Need audio to be not null to do audio & video instead of just video
                audio: remoteVideoElement
            }
        },
        ua: {
            traceSip: true,
            uri: callerURI,
            displayName: displayName,
            wsServers: ['ws://'+serverIP+':5066'],
            authorizationUser: user,
            password: password,
            register: false,
            media: {
                constraints: { audio: true, video: false }
            }
        }
    };
    var simple = new SIP.Web.Simple(configuration);
    simple.ua.unregister();

    // Adjust the style of the demo based on what is happening
    simple.on('ended', function() {
        remoteVideoElement.style.visibility = 'hidden';
        document.getElementById("answer").style.visibility = "hidden"
        button.firstChild.nodeValue = 'call';
    });

    simple.on('connected', function() {
        incomingCallAudio.pause();
        remoteVideoElement.style.visibility = 'visible';
        button.firstChild.nodeValue = 'hang up';
    });

    simple.on('ringing', function() {
      console.log("ring ring");
      incomingCallAudio.play();
      document.getElementById("answer").style.visibility = "block"
    });

    answer.addEventListener('click', function() {
        simple.answer()
    });
    
    register.addEventListener('click', function() {
        simple.ua.register()
    });
    
    unregister.addEventListener('click', function() {
        simple.ua.unregister()
    });

    simple.on('registered', function(e){
        console.log('registered',e)
    });

    simple.on('unregistered', function(e){
        console.log('unregistered', e)
    });

    // simple.on('hold', function(e){
    //     console.log('hold', e)
    // });

    // simple.on('unhold', function(e){
    //     console.log('unhold', e)
    // });

    // simple.on('connecting', function(e){
    //     console.log('connecting', e)
    // });



    button.addEventListener('click', function() {
        // No current call up
        if (simple.state === SIP.Web.Simple.C.STATUS_NULL ||
            simple.state === SIP.Web.Simple.C.STATUS_COMPLETED) {
            var target =  "+91" + document.getElementById("phoneNumber").value + "@" + serverIP
            simple.call(target);
        } else {
            simple.hangup();
        }
    });

    return simple;
}

function sendSMS(){
    var xhr = new XMLHttpRequest();
    var url = "/sms";
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            console.log(json.email + ", " + json.password);
        }
    };
    var data = JSON.stringify({number: document.getElementById("phoneNumber").value, "msg": document.getElementById("msg").value, "user": "2user"});
    xhr.send(data);
}

var serverIP = "192.168.0.106";
var user = "2user";
var userName = "Agent 2"
var password = "user22"
var myUser = createSimple('sip:'+user+'@'+serverIP+':5060', userName, 'rStream', 'myBtn');
