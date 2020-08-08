//importing the socket
const socket = io('/')
var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3030'
}); 

//video element
const myVideo = document.createElement('video');
myVideo.autoplay = true;
myVideo.muted = true;

let myVideoStream;

//loading all the data for the specific stream and playing it
const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    //playing the video
    video.addEventListener('loadmetadeta', () => {
        video.play()
    })
    //inject into our room.ejs
    document.getElementById('video-grid').append(video);
}

//video and audio output from chrome
navigator.mediaDevices.getUserMedia({ 
    video: true,
    audio: true
})
//we gave access to em
.then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream) //adds our video initially

    peer.on('call', call => {
        //*when other user calls us, we gotta answer to give access
        //they call us here and we answer
        //on answer... we get their video and add it here
        call.answer(stream)
        const video = document.createElement('video')
        video.autoplay = true;
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    //*When someone else opens up our link this runs, once the user gets connected
    socket.on('user-connected', (userId) => {
        connectToNewUser(userId, stream);
    })
}, err => console.log(err))
.catch(err => console.log(err))


const connectToNewUser = (userId, stream) => {
//*when new user is connected, send them our video stream
//*this new user is then added into the document
    //call the incoming user, and send them our stream
    const call = peer.call(userId, stream)
    const video = document.createElement('video')
    video.autoplay = true;
    //when we receive their stream add their stream to the display
    call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream)
    })
}

//*upon opening a peer connection (a user visits the link), a unique id is generated
//*this id is used to identify a particular user
peer.on('open', id => {
    //other users joining, join the room id we created
    socket.emit('join-room', ROOM_ID, id)
})



//*Message section
let text  = $('input')

//listen for keydown on the entire document
$('html').keydown(e => {
    //enter key ascii is 13
    if (e.which == 13 && text.val().length !== 0) {
        //socket.on -> receiver, socket.emit -> send
        socket.emit('message', text.val());
        text.val('')
    }
});

//server has the message here, so we can append it onto the list
socket.on('createMessage', message => {
    $('ul').append(`<li class="message"><b>user</b><br/>${message}</li>`);
    //scrollable texts
    scrollToBottom();
})

const scrollToBottom = () => {
    let d = $('.main__chat_window');
    d.scrollTop(d.prop("scrollHeight"));
}


//mute n unmute sound
const muteUnmute = () => {
    //get audio of our stream and then get the audio of our track
    //if enabled, disable it, if not enable it
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
}

const setMuteButton = () => {
    const html = `
        <i class="fas fa-microphone"></i>
        <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}
const setUnmuteButton = () => {
    const html = `
        <i class="unmute fas fa-microphone-slash"></i>
        <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
}


//stop/play video, effectively the same thing, instead we manipulate the videoTrack instead of the audioTrack
const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo()
    } else {
        setStopVideo()
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
}

const setStopVideo = () => {
    const html = `
        <i class="fas fa-video"></i>
        <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
        <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
}


//leave meeting
const leaveMeeting = () => {
    window.location.href = 'https://google.com'
}


//open/close chat
const openCloseChat = () => {
    if(document.querySelector('.main__right').classList.contains('hideChat')) {
        document.querySelector('.main__right').classList.remove('hideChat');
        setTimeout(() => {
            document.querySelector('.main__right').classList.remove('visuallyHidden');
        }, 2);
        document.querySelector('.main__left').classList.add('leftManipulate');
    } else {
        document.querySelector('.main__right').classList.add('visuallyHidden');    
        document.querySelector('.main__right').addEventListener('transitionend', e => {
            document.querySelector('.main__right').classList.add('hideChat');
        }, {
            capture: false,
            once: true,
            passive: false
        });
        document.querySelector('.main__left').classList.remove('leftManipulate');
    }
}