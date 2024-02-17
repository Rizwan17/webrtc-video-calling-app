**Media Stream Negotiation: **
WebRTC involves negotiating media streams between peers. The addTrack() method is used to add audio and video tracks from the local stream to the peer connection. These tracks are then negotiated between peers during the offer/answer exchange to establish a common media format for communication.

**Establishing Bi-Directional Communication: **
By adding local tracks to the peer connection, you enable bi-directional communication between peers. Your local audio and video tracks are sent to the remote peer, allowing them to see and hear you. Similarly, the remote peer's audio and video tracks are received and played back locally.

**Codec Negotiation: **
Adding tracks to the peer connection triggers codec negotiation between peers. WebRTC negotiates codecs based on the capabilities of each peer's device and network conditions to ensure optimal audio and video quality during communication.

**ICE Candidate Exchange: **
The addition of tracks to the peer connection triggers the gathering and exchange of ICE (Interactive Connectivity Establishment) candidates. ICE candidates facilitate NAT traversal and enable peers to establish direct peer-to-peer connections, even when behind firewalls or NAT devices.

**Signaling: **
Once local tracks are added to the peer connection, the peer connection's local description is updated. This local description includes information about the local media streams and ICE candidates, which is then sent to the remote peer through a signaling channel for negotiation.
