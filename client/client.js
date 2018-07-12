function createSimple(callerURI, displayName, remoteVideo, buttonId) {
    var remoteVideoElement = document.getElementById(remoteVideo);
    console.log(remoteVideoElement)
    var button = document.getElementById(buttonId);
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
            wsServers: ['ws://10.1.1.251:5066'],
            authorizationUser: '1user',
            password: 'user12',
            register: true,
            media: {
                constraints: { audio: true, video: false }
            }
        }
    };
    var simple = new SIP.Web.Simple(configuration);

    // Adjust the style of the demo based on what is happening
    simple.on('ended', function() {
        remoteVideoElement.style.visibility = 'hidden';
        button.firstChild.nodeValue = 'call';
    });

    simple.on('connected', function() {
        remoteVideoElement.style.visibility = 'visible';
        button.firstChild.nodeValue = 'hang up';
    });

    simple.on('ringing', function(e) {
        // console.log("ringing", e)
      simple.answer();
    });

    // simple.on('registered', function(e){
    //     console.log('registered',e)
    // });

    // simple.on('unregistered', function(e){
    //     console.log('unregistered', e)
    // });

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
            var target =  "+91" + document.getElementById("phoneNumber").value + "@10.1.1.251"
            simple.call(target);
        } else {
            simple.hangup();
        }
    });

    return simple;
}

var myUser = createSimple('sip:1user@10.1.1.251:5060', "Tarun Soni", 'rStream', 'myBtn');
