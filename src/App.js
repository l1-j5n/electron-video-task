import React, { useState, useRef, useEffect } from "react";
import Dropzone from "./components/Dropzone";
import "./App.css";
import MultiRangeSlider from "./components/MultiRangeSlider";
import { GetFrames } from "./constants/common";
import TrimImg from "./assets/images/frame-trim.svg";
import CutImg from "./assets/images/trim-cut.svg";
const { ipcRenderer } = window.require("electron");

function App() {
  const [videoUrl, setVideoUrl] = useState("");
  const [filePath, setFilePath] = useState("");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [minVal, setMinVal] = useState(0);
  const [maxVal, setMaxVal] = useState(duration);
  const [images, setImages] = useState([]);
  const [isTrimMode, setIsTrimMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [toaster, setToaster] = useState();
  const videoRef = useRef(null);
  const inputRef = useRef(null);
  const timelineRef = useRef(null);
  const playPauseButtonRef = useRef(null);

  // Handle file drop in dropzone
  const handleDrop = (files) => {
    const file = files[0];
    // This function will handle input file
    handleImportedFile(file);
  };

  // Handle file selection in select file input
  const handleSelectFile = () => {
    // When user clicks on select file button
    inputRef.current.click();
  };

  // Handle selected or dropped file and extract data of file
  const handleImportedFile = async (file) => {
    // Accept only video files
    if (file?.type?.startsWith("video/")) {
      setIsLoading(true);
      setFilePath(file?.path);
      // Set videoUrl in state
      const videoObjectUrl = URL.createObjectURL(file);
      setVideoUrl(videoObjectUrl);
    } else {
      // If input file is not video then show an alert
      alert("Please select a valid video file");
    }
  };

  // Handler function for file select event
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    // This function will handle input file
    handleImportedFile(file);
  };

  // Handle remove file events
  const handleRemoveVideo = () => {
    // Clear all states and refs
    setVideoUrl("");
    setCurrentTime(0);
    setDuration(0);
    setImages([]);
    setMinVal(0);
    videoRef.current.value = "";
    inputRef.current.value = "";
  };

  // Update seektime while video is playing
  const handleTimeUpdate = () => {
    // If trim mode is on
    if (isTrimMode) {
      // If seektime react at max value or a right side brush then pause the video
      if (videoRef.current.currentTime >= maxVal) {
        playPauseButtonRef.current.textContent = "Play";
        videoRef.current.pause();
        return;
      } else {
        setCurrentTime(videoRef.current.currentTime);
      }

      // If cut mode is on
    } else {
      // If current time is between selected brushes then set seektime at position of max value or right side brush
      if (
        videoRef.current.currentTime >= minVal &&
        videoRef.current.currentTime <= maxVal
      ) {
        videoRef.current.currentTime = maxVal;
        setCurrentTime(maxVal);
        // If currenttime is greater then duration then pause the video
      } else if (videoRef.current.currentTime >= duration) {
        playPauseButtonRef.current.textContent = "Play";
        setCurrentTime(videoRef.current.currentTime);
      } else {
        setCurrentTime(videoRef.current.currentTime);
      }
    }
  };

  // Set file data to states on file gets load event
  const handleLoadedMetadata = async () => {
    // When file successfully gets load then set duration and maximum video length
    let duration = videoRef.current.duration;
    setDuration(duration);
    setMaxVal(duration);

    // Get frames from the video to show in timeline
    const frames = await GetFrames(videoUrl, 10, 0);  // 10 frames will be cut from the video 

    // Set images in timeline
    setImages(frames);
    setIsLoading(false);
  };

  // Handle click on timeline component
  const handleTimelineClick = (e) => {
    // When user clicks on the timeline then get the clicked offset and move red color seektime thumb to that point 
    const rect = timelineRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / rect.width;
    const seekTime = percentage * duration;
    if (isTrimMode) {
      // If user clicks outside the selected range then don't move seektime thumb there
      if (seekTime > maxVal || seekTime < minVal) {
        return;
      } else {
        setCurrentTime(seekTime);
        videoRef.current.currentTime = seekTime;
      }
    } else if (!isTrimMode) {
      // If user clicks inside the selected range then don't move seektime thumb there
      if (seekTime > minVal && seekTime < maxVal) {
        return;
      } else {
        setCurrentTime(seekTime);
        videoRef.current.currentTime = seekTime;
      }
    }
  };

  // Handle play/pause video button
  const handlePlayPause = (e) => {
    e.stopPropagation();
    let currentSeekTime = videoRef.current.currentTime;
    if (isTrimMode) {
      // If current seektime or position of the red thumb is not between range then set it to the left brush/thumb
      if (currentSeekTime <= minVal || currentSeekTime >= maxVal) {
        videoRef.current.currentTime = minVal;
        setCurrentTime(minVal);
      }
    } else {
      if (currentSeekTime <= minVal || currentSeekTime >= maxVal) {
        setCurrentTime(videoRef.current.currentTime);
      } else {
        // If current seektime or position of the red thumb is in between range then set it to the video start point
        videoRef.current.currentTime = 0;
        setCurrentTime(0);
      }
    }
    // change play/pause button text accordingly
    if (videoRef.current.paused) {
      videoRef.current.play();
      playPauseButtonRef.current.textContent = "Pause";
    } else {
      playPauseButtonRef.current.textContent = "Play";
      videoRef.current.pause();
    }
  };

  // Call electron event for trim video
  const trimClip = (startTime, duration) => {
    setIsLoading(true);
    ipcRenderer.send("trim-video", {
      inputPath: filePath,
      startTime: startTime,
      duration: duration,
    });
  };

  // Call electron event for cut video
  const cutClip = (startTime, endTime) => {
    setIsLoading(true);
    ipcRenderer.send("cut-video", {
      inputPath: filePath,
      startTime: startTime,
      endTime: endTime,
      maxRight: duration,
    });
  };

  // Successfully file save handler event
  const handleClipSaveSuccess = (event, args) => {
    console.log("handleClipSaveSuccess >> ", args);
    setIsLoading(false);
    handleRemoveVideo();
    setToaster("Video saved successfully...");
    setTimeout(() => {
      setToaster("");
    }, 3000);
  };

  // Error handler event
  const handleClipSaveError = (event, args) => {
    console.log("handleClipSaveError >> ", args);
    setIsLoading(false);
    handleRemoveVideo();
  };

  useEffect(() => {
    ipcRenderer.on("clip-save-success", handleClipSaveSuccess);
    ipcRenderer.on("clip-save-error", handleClipSaveError);
    return () => {
      ipcRenderer.removeListener("clip-save-success", handleClipSaveSuccess);
      ipcRenderer.removeListener("clip-save-error", handleClipSaveError);
    };
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      {isLoading && (
        <div className="loader">
          <div className="spinner">
            <div className="r1"></div>
            <div className="r2"></div>
            <div className="r3"></div>
            <div className="r4"></div>
            <div className="r5"></div>
          </div>
        </div>
      )}
      <div className="file-upload">
        {!videoUrl && (
          <Dropzone
            handleDrop={handleDrop}
            handleSelectFile={handleSelectFile}
          />
        )}

        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          style={{ display: "none" }}
          onChange={handleFileInputChange}
        />
      </div>

      <div className="toast-msg">{toaster}</div>

      {videoUrl && (
        <div className="video-wrapper">
          <button onClick={handleRemoveVideo}>
            <svg
              width="256px"
              height="256px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
              <g
                id="SVGRepo_tracerCarrier"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></g>
              <g id="SVGRepo_iconCarrier">
                {" "}
                <path
                  d="M16 8L8 16M8.00001 8L16 16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="#000000"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>{" "}
              </g>
            </svg>
          </button>
          <video
            ref={videoRef}
            src={videoUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          />
          <div
            ref={timelineRef}
            className="speed-scroll"
            style={{
              cursor: "pointer",
            }}
            onClick={handleTimelineClick}
          >
            {images?.length > 0 && (
              <>
                <MultiRangeSlider
                  min={0}
                  max={duration}
                  minVal={minVal}
                  maxVal={maxVal}
                  setMinVal={setMinVal}
                  setMaxVal={setMaxVal}
                  onRangeChange={({ min, max }) =>
                    console.log(`min = ${min}, max = ${max}`)
                  }
                  currentTime={currentTime}
                  trimClip={trimClip}
                  isTrimMode={isTrimMode}
                  playPauseButtonRef={playPauseButtonRef}
                  handlePlayPause={handlePlayPause}
                  cutClip={cutClip}
                />
                <div className="output">
                  {images.map((imgData, index) => (
                    <div key={imgData.image} style={{ opacity: "1" }}>
                      <a key={imgData.image} href={imgData.image}>
                        <img src={imgData.image} alt="" />
                      </a>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
          {images?.length > 0 && (
            <>
              <div className="action-container">
                <button
                  className="play-btn icon-img"
                  ref={playPauseButtonRef}
                  onClick={handlePlayPause}
                >
                  Play
                </button>
                <div className="trim-outer">
                  <button
                    className="trim-btn icon-img"
                    onClick={() => setIsTrimMode(!isTrimMode)}
                  >
                    <img src={isTrimMode ? TrimImg : CutImg} alt="img" />
                    <span>{isTrimMode ? "Trim" : "Cut"}</span>
                  </button>
                </div>
                <button
                  className="save-btn icon-img"
                  onClick={() =>
                    isTrimMode
                      ? trimClip(minVal, maxVal)
                      : cutClip(minVal, maxVal)
                  }
                >
                  Save
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
