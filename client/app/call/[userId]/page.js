"use client";
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/hooks/useSocket';
import { Mic, MicOff, Video, VideoOff, PhoneOff, User } from 'lucide-react';
import Peer from 'simple-peer';

export default function CallPage() {
    const { userId } = useParams();
    const { user } = useAuth();
    const socket = useSocket(user?._id);
    const router = useRouter();
    const searchParams = useSearchParams();
    const isVideoCall = searchParams.get('type') === 'video';

    const [stream, setStream] = useState();
    const [receivingCall, setReceivingCall] = useState(false);
    const [caller, setCaller] = useState("");
    const [callerSignal, setCallerSignal] = useState();
    const [callAccepted, setCallAccepted] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [name, setName] = useState("");
    const [micActive, setMicActive] = useState(true);
    const [videoActive, setVideoActive] = useState(isVideoCall);

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ video: isVideoCall, audio: true }).then((stream) => {
            setStream(stream);
            if (myVideo.current) myVideo.current.srcObject = stream;
        });

        if (socket) {
            socket.on("call user", (data) => {
                setReceivingCall(true);
                setCaller(data.from);
                setName(data.name);
                setCallerSignal(data.signal);
            });
        }
    }, [socket, isVideoCall]);

    const callUser = (id) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream: stream,
        });

        peer.on("signal", (data) => {
            socket.emit("call user", {
                userToCall: id,
                signalData: data,
                from: user?._id,
                name: user?.name,
            });
        });

        peer.on("stream", (stream) => {
            if (userVideo.current) userVideo.current.srcObject = stream;
        });

        socket.on("call accepted", (signal) => {
            setCallAccepted(true);
            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const answerCall = () => {
        setCallAccepted(true);
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream: stream,
        });

        peer.on("signal", (data) => {
            socket.emit("answer call", { signal: data, to: caller });
        });

        peer.on("stream", (stream) => {
            if (userVideo.current) userVideo.current.srcObject = stream;
        });

        peer.signal(callerSignal);
        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        if (connectionRef.current) connectionRef.current.destroy();
        socket.emit("end call", { to: userId });
        router.back();
    };

    const toggleMic = () => {
        stream.getAudioTracks()[0].enabled = !micActive;
        setMicActive(!micActive);
    };

    const toggleVideo = () => {
        stream.getVideoTracks()[0].enabled = !videoActive;
        setVideoActive(!videoActive);
    };

    return (
        <div className="flex flex-col h-screen bg-neutral-900 text-white relative overflow-hidden">
            {/* Remote Video (Full Screen) */}
            <div className="flex-1 bg-black relative">
                {callAccepted && !callEnded ? (
                    <video playsInline ref={userVideo} autoPlay className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                        <div className="w-32 h-32 rounded-full bg-pink-500 flex items-center justify-center animate-pulse">
                            <User size={64} />
                        </div>
                        <p className="mt-6 text-xl font-bold">{receivingCall ? `Call from ${name}` : 'Ringing...'}</p>
                    </div>
                )}

                {/* Local Video (Small Overlay) */}
                {stream && (
                    <div className="absolute top-6 right-6 w-32 h-44 rounded-2xl overflow-hidden border-2 border-white border-opacity-20 shadow-2xl bg-black">
                        <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-12 left-0 right-0 flex justify-center items-center gap-6 z-50">
                <button
                    onClick={toggleMic}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${micActive ? 'bg-white bg-opacity-10' : 'bg-red-500'}`}
                >
                    {micActive ? <Mic /> : <MicOff />}
                </button>

                {receivingCall && !callAccepted ? (
                    <button
                        onClick={answerCall}
                        className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-green-500/50"
                    >
                        <PhoneOff className="rotate-135" />
                    </button>
                ) : (
                    <button
                        onClick={leaveCall}
                        className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50 hover:scale-110 active:scale-95 transition-all"
                    >
                        <PhoneOff />
                    </button>
                )}

                <button
                    onClick={toggleVideo}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${videoActive ? 'bg-white bg-opacity-10' : 'bg-red-500'}`}
                >
                    {videoActive ? <Video /> : <VideoOff />}
                </button>
            </div>

            {/* Initial Call Action */}
            {!receivingCall && !callAccepted && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm z-40">
                    <button
                        onClick={() => callUser(userId)}
                        className="btn-primary"
                    >
                        Start {isVideoCall ? 'Video' : 'Audio'} Call
                    </button>
                </div>
            )}
        </div>
    );
}
