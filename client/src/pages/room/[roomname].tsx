import axios from "axios";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Categories } from "../../utils/categories";
import useSWR from "swr";
import Head from "next/head";
import io, { caller } from "socket.io-client";
import { useEffect, useRef, useState } from "react";

export default function RoomName() {
  //Local State
  const initialStateTimer = 10;
  const [timer, setTimer] = useState(initialStateTimer);
  //Global State
  //Utils
  const router = useRouter();
  const roomname = router.query.roomname;
  const timerRef = useRef<any>();
  //User
  const socketRef = useRef<any>();
  const userVideo = useRef<any>();
  const userStream = useRef<any>();
  //Peer User
  const peerRef = useRef<any>();
  const otherUser = useRef<any>();
  const partnerVideo = useRef<any>();

  //Gathers audio and video and adds socket listeners as well as emit messages depending on room
  useEffect(() => {
    if (socketRef.current) socketRef.current.disconnect();
    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;
        userStream.current = stream;

        //Server side messaging
        socketRef.current = io.connect("http://localhost:5000", {
          forceNew: true,
        });
        socketRef.current.emit("join room", roomname);

        //Server side listeners
        socketRef.current.on("other user", (userID) => {
          callUser(userID);
          otherUser.current = userID;
        });
        socketRef.current.on("user joined", (userID) => {
          otherUser.current = userID;
        });
        socketRef.current.on("offer", handleRecieveCall);
        socketRef.current.on("answer", handleAnswer);
        socketRef.current.on("ice-candidate", handleNewICECandidateMsg);
        socketRef.current.on("peer-left", handlePeerLeaving);
        // socketRef.current.on("next-user", handleTimerUp)
      });
    //If the time runs out call a new user if there is one

    //Removes sockets on reload
    const removeSocketRefs = async () => {
      await socketRef.current.emit("user-leaving-room", roomname);
      await socketRef.current.disconnect();
    };
    window.addEventListener("beforeunload", removeSocketRefs);
    //Removes sockets on page change
    return () => {
      const onPageChange = async () => {
        await socketRef.current.emit("user-leaving-room", {
          roomname: roomname,
          otherUser: otherUser?.current,
        });
        await socketRef.current.disconnect();
      };
      onPageChange();
    };
  }, []);

  const callUser = (userID: string) => {
    //this create peer is what builds a webrtc object which is stored within the peerRef
    peerRef.current = createPeer(userID);
    //this then uses the ref we used for the userStream and gets the video and audio tracks, addTrack takes two args the track and the overall stream that the track is apart of. We take our stream and attach to peer so we can send our stream to our peer so they have access
    userStream.current
      .getTracks()
      .forEach((track) => peerRef.current.addTrack(track, userStream.current));
  };

  const createPeer = (userID?: string) => {
    //This helps us figure out our path for peer connections to come to and agreement, When we are recieving the call we don't have to pass this anything
    const peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: "stun:stun.stunprotocol.org",
        },
        {
          urls: "turn:numb.viagenie.ca",
          credential: "muazkh",
          username: "webrtc@live.com",
        },
      ],
    });

    peer.onicecandidate = handleICECandidateEvent;
    //This represent whenever we are recieving a remote peer once a connection has been established, so we can get the stream and simply on screen. Then we can grab the stream and attache dto partner ref
    peer.ontrack = handleTrackEvent;
    //This is defined whenever we are starting the negotiating process, when the first person initiate the event, the create the negotiation which is sent the the user then the peer send back and this is happening within this
    peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);

    return peer;
  };

  const handleNegotiationNeededEvent = (userID) => {
    //We are taking this offer and setting a local localDescription
    //For every offer and answer a peer will have the chance to set it as
    // their localDescription and then the other user will set it as their remote description. Vice versa when you recieve them also
    peerRef.current
      .createOffer()
      .then((offer) => {
        return peerRef.current.setLocalDescription(offer);
      })
      .then(() => {
        //Once the descriptions have been sent we then we then create the offer to be sent, the target is the person we want to send the offer to. The caller is there own socket id, and the sdp is the actual offer data
        const payload = {
          target: userID,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        };
        socketRef.current.emit("offer", payload);
      })
      .catch((e) => console.log(e));
  };

  const handleRecieveCall = (incoming) => {
    peerRef.current = createPeer();
    //We get passed the RTC data here where the offer is under sdp
    const desc = new RTCSessionDescription(incoming.sdp);
    // We then set to remote descipriton because we are recieving the offer
    peerRef.current
      .setRemoteDescription(desc)
      .then(() => {
        //this then goes over the userStream add attached the tracks to our peeer, so our peer can attach it and be sent back to the person
        userStream.current
          .getTracks()
          .forEach((track) =>
            peerRef.current.addTrack(track, userStream.current)
          );
      })
      .then(() => {
        return peerRef.current.createAnswer();
        //this then resolves the answer as an object, it's similar to the offer object but an answer and will be sdp data
      })
      .then((answer) => {
        return peerRef.current.setLocalDescription(answer);
      })
      .then(() => {
        //Once we have answered back to the person who is calling us
        const payload = {
          target: incoming.caller,
          caller: socketRef.current.id,
          sdp: peerRef.current.localDescription,
        };
        socketRef.current.emit("answer", payload);
      });
  };

  const handleAnswer = (message) => {
    //we then get the message which is an answer so we create a description object and then pass it to our setRemote on a peer and completes the cycle
    const desc = new RTCSessionDescription(message.sdp);
    peerRef.current.setRemoteDescription(desc).catch((e) => console.log(e));
  };

  const handleICECandidateEvent = (e) => {
    //this creates a ref for candiate, and each person has an other user ref that
    if (e.candidate) {
      const payload = {
        target: otherUser.current,
        candidate: e.candidate,
      };
      socketRef.current.emit("ice-candidate", payload);
    }
  };

  const handleNewICECandidateMsg = async (incoming) => {
    //   //this creates a candiate
    const candidate = new RTCIceCandidate(incoming);
    //then we call create ice candidate on our peer, then the peers will be swapping candiadtes back and fourth till they can agree on a method that will work for them or a proper handsake
    peerRef.current.addIceCandidate(candidate).catch((e) => console.log(e));
  };
  //This recieves an event and reference the first stream from the users audio and then attached to the sources object so then it's display on our video objects
  const handleTrackEvent = (e) => {
    partnerVideo.current.srcObject = e.streams[0];
    // if(timer > 0){
    //  timerRef.current = setInterval(() => setTimer(timer -1), 1000)
    // }
  };
  //Disconnects the user video stream and starts timer again
  const handlePeerLeaving = () => {
    console.log("ran");
    setTimer(initialStateTimer);
    otherUser.current = null;
    peerRef.current = null;
    partnerVideo.current.srcObject = undefined;
  };
  //Handles timer ending
  if (timer === 0) {
    socketRef.current.emit("timer-up", {
      roomname: roomname,
      otherUser: otherUser?.current,
    });
    setTimer(initialStateTimer);
    otherUser.current = null;
    peerRef.current = null;
    partnerVideo.current.srcObject = undefined;
    socketRef.current.emit("join room", roomname);
  }

  // const handleTimerUp= () =>{
  //   setTimer(initialStateTimer);
  //   otherUser.current = null;
  //   peerRef.current = null;
  //   partnerVideo.current.srcObject = undefined;
  // }

  //Handles the timer
  useEffect(() => {
    if (partnerVideo) {
      const timerLogic =
        timer > 0 &&
        timer !== initialStateTimer &&
        setInterval(() => setTimer(timer - 1), 1000);
      return () => {
        clearInterval(timerLogic);
      };
    }

    console.log("called");
  }, [timer]);

  return (
    <div className="flex justify-center">
      <Head>
        <title>{roomname}</title>
      </Head>

      <div className="flex flex-col content-start justify-center pt-14 align-center w-60 ">
        <h1 className="text-3xl">{roomname}</h1>
        <video autoPlay ref={userVideo && userVideo} className="mb-4" />
        <h1 className="text-xl">{timer !== 300 ? timer : "5:00"}</h1>
        <video
          autoPlay
          ref={partnerVideo && partnerVideo}
          onPlay={(e) => {
            setTimer(timer - 1);
          }}
        />
        <button
          onClick={(e) => {
            socketRef.current.emit("reset-rooms");
          }}
          className="w-full py-2 mt-2 mb-4 font-bold text-white uppercase bg-blue-500 border border-blue-500 rounded text-m"
        >
          {" "}
          Reset Server
        </button>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  try {
    const cookie = req.headers.cookie;
    if (!cookie) throw new Error("Missing auth token cookie");

    await axios.get("/auth/me", { headers: { cookie } });
    return { props: {} };
  } catch (err) {
    res.writeHead(307, { Location: "/login" }).end();
    return;
  }
};
