"use client";
// Import necessary dependencies
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useSpring, animated } from "@react-spring/web";
import { FaTrash } from "react-icons/fa";
import { VectorIcon, ThreeCirclesIcon } from "@/components/Icons";
import BabbleLogo from "@/components/BableLogo";
import useSound from "use-sound";
interface ContainerProps {
  children: React.ReactNode;
  showBorder?: boolean;
}
// Helper Components

// Container component for consistent styling
const Container = React.memo<ContainerProps>(
  ({ children, showBorder = true }) => {
    const borderClass = showBorder
      ? "border border-white border-opacity-100"
      : "";
    const borderStyle = showBorder
      ? { border: "0.5px solid rgba(255, 255, 255, 0.5)" }
      : {};

    return (
      <div
        className={`w-[90%] h-[79vh] rounded-3xl flex items-center justify-center ${borderClass}`}
        style={borderStyle}
      >
        {children}
      </div>
    );
  }
);
// WaveAnimation component for visual feedback during recording
const WaveAnimation = React.memo(() => {
  const [waveParams, setWaveParams] = useState({ height: 20, frequency: 1 });

  useEffect(() => {
    const interval = setInterval(() => {
      setWaveParams({
        height: Math.random() * 20 + 10,
        frequency: Math.random() * 2 + 1
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const paths = useMemo(
    () => [
      {
        d: `M0 100 Q 100 ${
          100 - waveParams.height * waveParams.frequency
        } 200 100 T 400 100 T 600 100 T 800 100 L 800 200 L 0 200 Z`,
        fill: "#FFB684",
        opacity: 0.8,
      },
      {
        d: `M0 100 Q 100 ${
          100 - (waveParams.height * waveParams.frequency) / 1.5
        } 200 100 T 400 100 T 600 100 T 800 100 L 800 200 L 0 200 Z`,
        fill: "#FFBD8E",
        opacity: 0.6,
      },
      {
        d: `M0 100 Q 100 ${
          100 - (waveParams.height * waveParams.frequency) / 2
        } 200 100 T 400 100 T 600 100 T 800 100 L 800 200 L 0 200 Z`,
        fill: "#FFC59A",
        opacity: 0.4,
      },
    ],
    [waveParams]
  );

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 800 200"
      preserveAspectRatio="none"
    >
      {paths.map((path, index) => (
        <path key={index} d={path.d} fill={path.fill} opacity={path.opacity} />
      ))}
    </svg>
  );
});
// Type definitions and interfaces
type RecordingStatus = "idle" | "countdown" | "recording" | "stopped";
// Main AudioRecorder component
const AudioRecorder = () => {
  // State declarations
  const [state, setState] = useState({
    isRecording: false,
    showControls: false,
    audioUrl: null as string | null,
    bgColor: "#2F4858",
    showShades: false,
    waveformAnimation: false,
    status: "idle" as RecordingStatus,
  });
  const [countdown, setCountdown] = useState<number | null>(null);

  // Refs for managing MediaRecorder and audio chunks
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  // Animations using react-spring
  const memoizedState = useMemo(() => state, [state]);

  const buttonAnimation = useSpring({
    scale: memoizedState.isRecording ? 1.2 : 1,
    config: { tension: 300, friction: 10 },
  });

  const updateState = useCallback((updates: Partial<typeof state>) => {
    setState((prevState) => ({ ...prevState, ...updates }));
  }, []);

  // Cleanup effect for stopping recording when component unmounts
  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);
  
  // useEffect(() => {
  //   let timer: NodeJS.Timeout;
  //   if (countdown !== null && countdown > 0) {
  //     timer = setTimeout(() => setCountdown(countdown - 1), 1000);
  //   } else if (countdown === 0) {
  //     setTimeout(() => {
  //       if (mediaRecorderRef.current) {
  //         mediaRecorderRef?.current?.start();
  //         updateState({
  //           status: "recording",
  //           isRecording: true,
  //           waveformAnimation: true,
  //           showShades:false
  //         });
  //       }
  //     }, 3000)
  //   }
  //   return () => {
  //     if (timer) clearTimeout(timer);
  //   };
  // }, [countdown, updateState]);
  // ScatteredDots component for background visual effect
  const ScatteredDots = React.memo(() => {
    const dots = useMemo(
      () =>
        Array.from({ length: 1000 }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white w-[1px] h-[1px] sm:w-[2px] sm:h-[2px] md:w-[3px] md:h-[3px] lg:w-[4px] lg:h-[4px] opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          ></div>
        )),
      []
    );
    return <>{dots}</>;
  });
  // Helper functions

  // Function to start the recording process
  const startRecording = useCallback(async () => {
    setCountdown(3);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        updateState({
          audioUrl,
          status: 'stopped',
          showControls: true,
          isRecording: false,
          waveformAnimation: false, // Stop waveform animation when recording stops
        })
      };
      // Countdown logic
      updateState({
        bgColor: '#2F4858', // Change background to dark
        showShades: true,
      });
      setCountdown(3);
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev && prev > 1) {
            return prev - 1;
          } else {
            clearInterval(countdownInterval);
            setCountdown(null);
            updateState({
              showShades: false,
              status: 'recording',
              isRecording: true,
              waveformAnimation: true, // Start waveform animation when recording starts
            })
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
  }, [countdown,updateState]);
  
  
  
  
  
  // Function to stop the recording
  const stopRecording = useCallback(() => {
    setCountdown(null);
    updateState({
      bgColor: "#2F4858",
      showControls: true,
    });
    updateState({
      isRecording: false,
      waveformAnimation: false,
    });
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      mediaRecorderRef.current = null;
    }
  }, [updateState]);
  // Function to resume recording
  const resumeRecording = useCallback(() => {
    updateState({
      isRecording: true,
      waveformAnimation: true,
      status: "recording",
    });
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "inactive"
    ) {
      mediaRecorderRef.current.start();
    }
  }, [updateState]);
  // Function to delete the recorded audio
  const deleteRecording = useCallback(() => {
    updateState({
      audioUrl: null,
      status: "idle",
      showControls: false,
    });
    audioChunksRef.current = [];
  }, [updateState]);
  // Animation for the shades
  const shadeAnimation = useSpring({
    transform: memoizedState.showShades ? "translateY(0%)" : "translateY(100%)",
    config: { duration: 3000 }, // Duration set to 3 seconds
  });
  {
    /* Background dots */
  }
  const renderScatteredDots = useMemo(
    () => countdown === null && <ScatteredDots />,
    [countdown]
  );
  const renderLogo = useMemo(
    () =>
      memoizedState.status === "idle" &&
      !memoizedState.isRecording &&
      !memoizedState.showControls &&
      countdown === null && (
        <div className="mt-4 mb-8">
          <BabbleLogo size={60} />
        </div>
      ),
    [memoizedState.status, memoizedState.isRecording, memoizedState.showControls, countdown]
  );
  // Main render function
  return (
    <>
      {renderScatteredDots}
      {renderLogo}
      {/* Main container */}
      <Container
        showBorder={
          !memoizedState.isRecording &&
          !memoizedState.showControls &&
          countdown === null &&
          memoizedState.status === "idle"
        }
      >
        {/* <div className="w-[90%] h-[79vh] border border-white border-opacity-100 rounded-3xl flex items-center justify-center" style={{border:'0.5px solid rgba(255, 255, 255, 0.5)'}}> */}
        {memoizedState.status === "idle" &&
          !memoizedState.isRecording &&
          !memoizedState.showControls &&
          countdown === null && (
            <>
              <div className="group absolute bottom-[9%] left-[54.5%] w-16 h-16 bg-[#2F4858] rounded-full transform -translate-x-[10rem] translate-y-1/2 border border-black border-opacity-50 transition-colors duration-300 hover:bg-[#FFB684] hover:border-black">
                <div
                  style={{
                    position: "relative",
                    right: "-7px",
                    top: "12px",
                  }}
                  onClick={startRecording}
                >
                  {/* Three Circles Icon button */}
                  <ThreeCirclesIcon className="w-12 h-8 text-[#FFB684] group-hover:text-black-ml-1 group-hover:text-black transition-colors duration-300" />
                </div>
              </div>
              <div className="group absolute bottom-[9%] right-[54.5%] w-16 h-16 bg-[#2F4858] rounded-full transform translate-x-[10rem] translate-y-1/2 border border-black border-opacity-50 transition-colors duration-300 hover:bg-[#FFB684] hover:border-black">
                <div
                  style={{
                    position: "relative",
                    right: "-13px",
                    top: "13px",
                  }}
                  onClick={startRecording}
                >
                  {/* Vector Icon button */}
                  <VectorIcon className="w-8 h-8 text-[#FFB684] group-hover:text-black-ml-1 group-hover:text-black transition-colors duration-300" />
                </div>
              </div>
            </>
          )}
        {/* Waveform animation during recording */}
        {memoizedState.waveformAnimation && (
          <div className="absolute inset-0">
            <WaveAnimation />
          </div>
        )}
        {/* Animated shades for countdown */}
        {memoizedState.showShades && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <animated.div
              style={{
                ...shadeAnimation,
                width: "100%",
                height: "7.11%",
                backgroundColor: "#FFB684",
                position: "absolute",
                bottom: 0,
                zIndex: 3,
              }}
            />
            <animated.div
              style={{
                ...shadeAnimation,
                width: "100%",
                height: "14.22%",
                backgroundColor: "#FFBD8E",
                position: "absolute",
                bottom: "7.11%",
                zIndex: 2,
              }}
            />
            <animated.div
              style={{
                ...shadeAnimation,
                width: "100%",
                height: "21.33%",
                backgroundColor: "#FFC59A",
                position: "absolute",
                bottom: "14.22%",
                zIndex: 1,
              }}
            />
          </div>
        )}
        <div className="w-[90%] h-[90%] flex items-center justify-center">
          <>
            {memoizedState.status === "idle" &&
              !memoizedState.isRecording &&
              !memoizedState.showControls && (
                <div
                  className="w-96 h-96 flex flex-col items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: memoizedState.bgColor }}
                >
                  <animated.button
                    style={{
                      ...buttonAnimation,
                      backgroundColor:
                        countdown !== null ? "white" : "#2F4858",
                      color: countdown !== null ? "#2F4858" : "#FFB684",
                      border:
                        countdown === null
                          ? "2px #FFB684 solid"
                          : "1px black solid",
                      boxShadow: "0 0 10px 5px rgba(255, 255, 255, 0.3)",
                    }}
                    className="w-64 h-64 rounded-full text-xl focus:outline-none transition-all duration-300 flex items-center justify-center z-10 border-2 border-[#FFB684] relative overflow-hidden group"
                    onClick={startRecording}
                  >
                    <span className="relative z-10">
                      {countdown === null && "Babble"}
                      {countdown !== null && countdown}
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
            {memoizedState.isRecording && (
              <div className="relative w-64 h-64">
                <div
                  className="w-64 h-64 rounded-full flex flex-col items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: memoizedState.bgColor }}
                >
                  <animated.button
                    style={{
                      ...buttonAnimation,
                      backgroundColor: "white",
                      color: "black",
                      border: "1px black solid",
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

            {!memoizedState.isRecording && memoizedState.showControls && (
              <div className="relative w-64 h-64">
                <div
                  className="w-64 h-64 rounded-full flex flex-col items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: memoizedState.bgColor }}
                >
                  <animated.button
                    style={{
                      ...buttonAnimation,
                      backgroundColor: "white",
                      color: "black",
                      border: "1px black solid",
                    }}
                    className="w-64 h-64 rounded-full text-xl focus:outline-none transition-all duration-300 flex items-center justify-center z-10 border-2 border-[#FFB684] relative overflow-hidden group"
                    onClick={() =>
                      memoizedState.audioUrl && new Audio(memoizedState.audioUrl).play()
                    }
                  >
                    <span className="relative z-10 transition-colors duration-300 group-hover:text-[#FFB684]">
                      Done
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-52 h-52 rounded-full border-2 border-[#FFB684] absolute transition-all duration-300 group-hover:scale-90 opacity-0 group-hover:opacity-100"></div>
                    </div>
                  </animated.button>
                </div>
                <div
                  className="w-48 h-48 relative bottom-[80%] left-[110%] rounded-full flex flex-col items-center justify-center relative overflow-hidden"
                  style={{ backgroundColor: memoizedState.bgColor }}
                >
                  <animated.button
                    style={{
                      ...buttonAnimation,
                      backgroundColor: "#FFB684",
                      color: "black",
                      border: "1px black solid",
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
