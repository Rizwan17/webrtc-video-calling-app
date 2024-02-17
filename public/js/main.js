const createUserBtn = document.getElementById("create-user");
const username = document.getElementById("username");
const allusersHtml = document.getElementById("allusers");
const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");
const endCallBtn = document.getElementById("end-call-btn");
const socket = io();
let localStream;
let caller = [];

// Single Method for peer connection
const PeerConnection = (function(){
    let peerConnection;

    const createPeerConnection = () => {
        const config = {
            iceServers: [
                {
                    urls: 'stun:stun.l.google.com:19302'
                }
            ]
        };
        peerConnection = new RTCPeerConnection(config);

        // add local stream to peer connection
        localStream.getTracks().forEach(track => {
            peerConnection.addTrack(track, localStream);
        })
        // listen to remote stream and add to peer connection
        peerConnection.ontrack = function(event) {
            remoteVideo.srcObject = event.streams[0];
        }
        // listen for ice candidate
        peerConnection.onicecandidate = function(event) {
            if(event.candidate) {
                socket.emit("icecandidate", event.candidate);
            }
        }

        return peerConnection;
    }

    return {
        getInstance: () => {
            if(!peerConnection){
                peerConnection = createPeerConnection();
            }
            return peerConnection;
        }
    }
})();

// handle browser events
createUserBtn.addEventListener("click", (e) => {
    if(username.value !== "") {
        const usernameContainer = document.querySelector(".username-input");
        socket.emit("join-user", username.value);
        usernameContainer.style.display = 'none';
    }
});
endCallBtn.addEventListener("click", (e) => {
    socket.emit("call-ended", caller)
})

// handle socket events
socket.on("joined", allusers => {
    console.log({ allusers });
    const createUsersHtml = () => {
        allusersHtml.innerHTML = "";

        for(const user in allusers) {
            const li = document.createElement("li");
            li.textContent = `${user} ${user === username.value ? "(You)" : ""}`;

            if(user !== username.value) {
                const button = document.createElement("button");
                button.classList.add("call-btn");
                button.addEventListener("click", (e) => {
                    startCall(user);
                });
                const img = document.createElement("img");
                img.setAttribute("src", "/images/phone.png");
                img.setAttribute("width", 20);

                button.appendChild(img);

                li.appendChild(button);
            }

            allusersHtml.appendChild(li);
        }
    }

    createUsersHtml();

})
socket.on("offer", async ({from, to, offer}) => {
    const pc = PeerConnection.getInstance();
    // set remote description
    await pc.setRemoteDescription(offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("answer", {from, to, answer: pc.localDescription});
    caller = [from, to];
});
socket.on("answer", async ({from, to, answer}) => {
    const pc = PeerConnection.getInstance();
    await pc.setRemoteDescription(answer);
    // show end call button
    endCallBtn.style.display = 'block';
    socket.emit("end-call", {from, to});
    caller = [from, to];
});
socket.on("icecandidate", async candidate => {
    console.log({ candidate });
    const pc = PeerConnection.getInstance();
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
});
socket.on("end-call", ({from, to}) => {
    endCallBtn.style.display = "block";
});
socket.on("call-ended", (caller) => {
    endCall();
})


// start call method
const startCall = async (user) => {
    console.log({ user })
    const pc = PeerConnection.getInstance();
    const offer = await pc.createOffer();
    console.log({ offer })
    await pc.setLocalDescription(offer);
    socket.emit("offer", {from: username.value, to: user, offer: pc.localDescription});
}

const endCall = () => {
    const pc = PeerConnection.getInstance();
    if(pc) {
        pc.close();
        endCallBtn.style.display = 'none';
    }
}

// initialize app
const startMyVideo = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        console.log({ stream });
        localStream = stream;
        localVideo.srcObject = stream;
    } catch(error) {}
}

startMyVideo();