'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSpring, animated } from '@react-spring/web';
import {  FaTrash } from 'react-icons/fa';
import { VectorIcon, ThreeCirclesIcon } from '@/components/Icons'; // You'll need to create these components
import BabbleLogo from '@/components/BableLogo';

import useSound from 'use-sound';
interface ContainerProps {
  children: React.ReactNode;
  showBorder?: boolean;
}

const Container: React.FC<ContainerProps> = ({ children, showBorder = true }) => {
  const borderClass = showBorder ? 'border border-white border-opacity-100' : '';
  const borderStyle = showBorder ? { border: '0.5px solid rgba(255, 255, 255, 0.5)' } : {};

  return (
    <div
      className={`w-[90%] h-[79vh] rounded-3xl flex items-center justify-center ${borderClass}`}
      style={borderStyle}
    >
      {children}
    </div>
  );
};
const WaveAnimation = () => {
  const [waveHeight, setWaveHeight] = useState(20);
  const [waveFrequency, setWaveFrequency] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaveHeight(Math.random() * 20 + 20); // Random height between 20 and 40
      setWaveFrequency(Math.random() * 2 + 1); // Random frequency between 1 and 3
    }, 1000); // Change every second

    return () => clearInterval(interval);
  }, []);
  return (
    <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="none">
      <path
        d={`M0 100 Q 100 ${100 - waveHeight * waveFrequency} 200 100 T 400 100 T 600 100 T 800 100 L 800 200 L 0 200 Z`}
        fill="#FFB684"
        opacity={0.8}
      />
      <path
        d={`M0 100 Q 100 ${100 - waveHeight * waveFrequency / 1.5} 200 100 T 400 100 T 600 100 T 800 100 L 800 200 L 0 200 Z`}
        fill="#FFBD8E"
        opacity={0.6}
      />
      <path
        d={`M0 100 Q 100 ${100 - waveHeight * waveFrequency / 2} 200 100 T 400 100 T 600 100 T 800 100 L 800 200 L 0 200 Z`}
        fill="#FFC59A"
        opacity={0.4}
      />
    </svg>
  );
};
type RecordingStatus = 'idle' | 'countdown' | 'recording' | 'stopped';
const AudioRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [bgColor, setBgColor] = useState('#2F4858'); // Default background color
  const [showShades, setShowShades] = useState(false); // New state for the shades
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [waveformAnimation, setWaveformAnimation] = useState(false);
  const [playBeep] = useSound('/beep.mp3');
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const buttonAnimation = useSpring({
    scale: isRecording ? 1.2 : 1,
    config: { tension: 300, friction: 10 },
  });

  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);
  
  const ScatteredDots = () => {
    const dots = Array.from({ length: 1000 }, (_, i) => (
      <div
      key={i}
      className="absolute rounded-full bg-white w-[1px] h-[1px] sm:w-[2px] sm:h-[2px] md:w-[3px] md:h-[3px] lg:w-[4px] lg:h-[4px] opacity-10"
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    ></div>
    ));
    return <>{dots}</>;
  }; 

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
        setShowControls(true);
        setStatus('stopped');
        setIsRecording(false);
 setWaveformAnimation(false); // Stop waveform animation when recording stops

      };
      // Countdown logic
      setBgColor('#2F4858'); // Change background to default
      setShowShades(true); // Show shades during countdown
      setCountdown(3);
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev && prev > 1) {
            playBeep();
            return prev - 1;
          } else {
            clearInterval(countdownInterval);
            setCountdown(null);
            setShowShades(false); // Hide shades after countdown
        setStatus('stopped');

            setBgColor('#2F4858'); // Reset background color at the end of countdown
            setIsRecording(true);
            setWaveformAnimation(true); // Start waveform animation when recording starts
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'recording') {
              mediaRecorderRef.current.start();
            }
            return null;
          }
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    setWaveformAnimation(false); // Stop waveform animation when recording stops   
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      mediaRecorderRef.current = null;
    }
    setIsRecording(false);
  };
  const resumeRecording = useCallback(() => {
    setIsRecording(true);
    setWaveformAnimation(true); 
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      mediaRecorderRef.current.start();
      setStatus('recording');
    }
  }, []);
  
  const deleteRecording = () => {
    setAudioUrl(null);
    setStatus('idle');
    setShowControls(false);
    audioChunksRef.current = [];
  };
 // Animation for the shades
 const shadeAnimation = useSpring({
  from: { transform: 'translateY(100%)' },
  to: { transform: 'translateY(0%)' },
  config: { duration: 3000 }, // Duration set to 3 seconds
  reset: showShades,
});
  return (
    <>
      
      {countdown===null && (<><ScatteredDots /></>)}
      {status === 'idle' && !isRecording && !showControls && countdown===null && (<><div className="mt-4 mb-8">
        <BabbleLogo size={60} />
      </div></>)}
      <Container showBorder={!isRecording && !showControls && countdown===null && status === 'idle'}>
    {/* <div className="w-[90%] h-[79vh] border border-white border-opacity-100 rounded-3xl flex items-center justify-center" style={{border:'0.5px solid rgba(255, 255, 255, 0.5)'}}> */}
    {status === 'idle' && !isRecording && !showControls && countdown===null && (<><div className="group absolute bottom-[9%] left-[54.5%] w-16 h-16 bg-[#2F4858] rounded-full transform -translate-x-[10rem] translate-y-1/2 border border-black border-opacity-50 transition-colors duration-300 hover:bg-[#FFB684] hover:border-black">
      <div style={{position: 'relative',
    right: '-7px',
    top: "12px"}}
    onClick={startRecording}>
      <ThreeCirclesIcon className="w-12 h-8 text-[#FFB684] group-hover:text-black-ml-1 group-hover:text-black transition-colors duration-300" />
      </div></div>
<div className="group absolute bottom-[9%] right-[54.5%] w-16 h-16 bg-[#2F4858] rounded-full transform translate-x-[10rem] translate-y-1/2 border border-black border-opacity-50 transition-colors duration-300 hover:bg-[#FFB684] hover:border-black">
<div style={{position: "relative",
    right: "-13px",
    top: "13px"}} 
    onClick={startRecording} >
<VectorIcon className="w-8 h-8 text-[#FFB684] group-hover:text-black-ml-1 group-hover:text-black transition-colors duration-300" />
</div></div></>)}
{waveformAnimation && (
          <div className="absolute inset-0">
            <WaveAnimation />
          </div>
        )}
{showShades && (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <animated.div
                  style={{
                    ...shadeAnimation,
                    width: '100%',
                    height: '11.11%',
                    backgroundColor: '#FFB684',
                    position: 'absolute',
                    bottom: 0,
                    zIndex: 3,
                  }}
                />
                <animated.div
                  style={{
                    ...shadeAnimation,
                    width: '100%',
                    height: '22.22%',
                    backgroundColor: '#FFBD8E',
                    position: 'absolute',
                    bottom: '11.11%',
                    zIndex: 2,
                  }}
                />
                <animated.div
                  style={{
                    ...shadeAnimation,
                    width: '100%',
                    height: '33.33%',
                    backgroundColor: '#FFC59A',
                    position: 'absolute',
                    bottom: '22.22%',
                    zIndex: 1,
                  }}
                />
              </div>
            )}
<div className="w-[90%] h-[90%] flex items-center justify-center">
  <>
      {status === 'idle' && !isRecording && !showControls && (
    <div className="w-96 h-96 flex flex-col items-center justify-center relative overflow-hidden" style={{ backgroundColor: bgColor }}>
        <animated.button
          style={{
            ...buttonAnimation,
            backgroundColor: countdown !== null ? 'white' : '#2F4858',
            color: countdown !== null ? '#2F4858' : '#FFB684',
            border: countdown === null ? '2px #FFB684 solid' : '1px black solid',
            boxShadow: '0 0 10px 5px rgba(255, 255, 255, 0.3)',
          }}
          className="w-64 h-64 rounded-full text-xl focus:outline-none transition-all duration-300 flex items-center justify-center z-10 border-2 border-[#FFB684] relative overflow-hidden group"
          onClick={startRecording}
        >
          <span className="relative z-10">
            {countdown !== null ? countdown : 'Babble'}
          </span>
          {countdown === null && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-52 h-52 rounded-full border-2 border-[#FFB684] absolute transition-all duration-300 group-hover:scale-95 opacity-0 group-hover:opacity-100"></div>
              <div className="w-60 h-60 rounded-full border-2 border-[#FFB684] absolute transition-all duration-300 group-hover:scale-95 opacity-0 group-hover:opacity-100"></div>
            </div>
          )}
        </animated.button>
        </div>
      )}
    {isRecording && (
  <div className="relative w-64 h-64">
    <div className="w-64 h-64 rounded-full flex flex-col items-center justify-center relative overflow-hidden" style={{ backgroundColor: bgColor }}>
      <animated.button
        style={{
          ...buttonAnimation,
          backgroundColor: 'white',
          color: 'black',
          border: '1px black solid',
        }}
        className="w-64 h-64 rounded-full text-xl focus:outline-none transition-all duration-300 flex items-center justify-center z-10 border-2 border-[#FFB684] relative overflow-hidden group"
        onClick={stopRecording}
      >
        <span className="relative z-10 transition-colors duration-300 group-hover:text-[#FFB684]">
          Stop
        </span>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-52 h-52 rounded-full border-2 border-[#FFB684] absolute transition-all duration-300 group-hover:scale-75 opacity-0 group-hover:opacity-100"></div>
        </div>
      </animated.button>
    </div>
    <button
      className="absolute bottom-[-100%] right-[40%] w-16 h-16 rounded-full bg-white text-[#FFB684] flex items-center justify-center shadow-md transition-all duration-300"
      onClick={deleteRecording}
    >
      <FaTrash />
    </button>
  </div>
)}

      {!isRecording && showControls && (
        <div className="relative w-64 h-64">
        <div className="w-64 h-64 rounded-full flex flex-col items-center justify-center relative overflow-hidden" style={{ backgroundColor: bgColor }}>
          <animated.button
            style={{
              ...buttonAnimation,
              backgroundColor: 'white',
              color: 'black',
              border: '1px black solid',
            }}
            className="w-64 h-64 rounded-full text-xl focus:outline-none transition-all duration-300 flex items-center justify-center z-10 border-2 border-[#FFB684] relative overflow-hidden group"
            onClick={() => audioUrl && new Audio(audioUrl).play()}
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-[#FFB684]">
              Done
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-52 h-52 rounded-full border-2 border-[#FFB684] absolute transition-all duration-300 group-hover:scale-90 opacity-0 group-hover:opacity-100"></div>
            </div>
          </animated.button>
        </div>
        <div className="w-48 h-48 relative bottom-[80%] left-[110%] rounded-full flex flex-col items-center justify-center relative overflow-hidden" style={{ backgroundColor: bgColor }}>
          <animated.button
            style={{
              ...buttonAnimation,
              backgroundColor: '#FFB684',
              color: 'black',
              border: '1px black solid',
            }}
            className=" w-52 h-52 rounded-full text-xl focus:outline-none transition-all duration-300 flex items-center justify-center z-10 border-2 border-[#FFB684] relative overflow-hidden group"
            onClick={resumeRecording}
          >
            <span className="relative z-10 transition-colors duration-300 group-hover:text-[#2F4858]">
              Resume
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-36 h-36 rounded-full border-2 border-[#2F4858] absolute transition-all duration-300 group-hover:scale-90 opacity-0 group-hover:opacity-100"></div>
            </div>
          </animated.button>
        </div>
        
        <button
          className="absolute bottom-[-100%] right-[40%] w-16 h-16 rounded-full bg-white text-[#FFB684] flex items-center justify-center shadow-md transition-all duration-300"
          onClick={deleteRecording}
        >
          <FaTrash />
        </button>
      </div>
      )}
    </>
    </div>
    </Container>
    </>

  );
};

export default AudioRecorder;
