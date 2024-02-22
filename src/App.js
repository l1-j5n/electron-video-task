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
  const [maxRight, setMaxRight] = useState(duration);
  const [images, setImages] = useState([]);
  const [isTrimMode, setIsTrimMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [toaster, setToaster] = useState();
  const videoRef = useRef(null);
  const inputRef = useRef(null);
  const timelineRef = useRef(null);
  const playPauseButtonRef = useRef(null);

  useEffect(() => {}, [maxVal, inputRef]);

  const handleDrop = (files) => {
    const file = files[0];
    handleImportedFile(file);
  };

  const handleSelectFile = () => {
    inputRef.current.click();
  };

  const handleImportedFile = async (file) => {
    if (file?.type?.startsWith("video/")) {
      setIsLoading(true);
      setFilePath(file?.path);
      const videoObjectUrl = URL.createObjectURL(file);
      setVideoUrl(videoObjectUrl);
    } else {
      alert("Please select a valid video file");
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleImportedFile(file);
  };

  const handleRemoveVideo = () => {
    setVideoUrl("");
    setCurrentTime(0);
    setDuration(0);
    setImages([]);
    setMinVal(0);
    videoRef.current.value = "";
    inputRef.current.value = "";
  };

  const handleTimeUpdate = () => {
    if (isTrimMode) {
      if (videoRef.current.currentTime >= maxVal) {
        playPauseButtonRef.current.textContent = "Play";
        videoRef.current.pause();
        return;
      } else {
        setCurrentTime(videoRef.current.currentTime);
      }
    } else {
      if (
        videoRef.current.currentTime >= minVal &&
        videoRef.current.currentTime <= maxVal
      ) {
        videoRef.current.currentTime = maxVal;
        setCurrentTime(maxVal);
      } else {
        setCurrentTime(videoRef.current.currentTime);
      }
    }
  };

  const handleLoadedMetadata = async () => {
    let duration = videoRef.current.duration;
    setDuration(duration);
    setMaxVal(duration);
    setMaxRight(duration);
    const frames = await GetFrames(videoUrl, 10, 0);
    setImages(frames);
    setIsLoading(false);
  };

  const handleTimelineClick = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / rect.width;
    const seekTime = percentage * duration;
    if (isTrimMode) {
      if (seekTime > maxVal || seekTime < minVal) {
        return;
      } else {
        setCurrentTime(seekTime);
        videoRef.current.currentTime = seekTime;
      }
    } else if (!isTrimMode) {
      if (seekTime > minVal && seekTime < maxVal) {
        return;
      } else {
        setCurrentTime(seekTime);
        videoRef.current.currentTime = seekTime;
      }
    }
  };

  const handlePlayPause = (e) => {
    e.stopPropagation();
    let currentSeekTime = videoRef.current.currentTime;
    if (isTrimMode) {
      if (currentSeekTime <= minVal || currentSeekTime >= maxVal) {
        videoRef.current.currentTime = minVal;
        setCurrentTime(minVal);
      }
    } else {
      if (currentSeekTime <= minVal || currentSeekTime >= maxVal) {
        setCurrentTime(videoRef.current.currentTime);
      } else {
        videoRef.current.currentTime = 0;
        setCurrentTime(0);
      }
    }
    if (videoRef.current.paused) {
      videoRef.current.play();
      playPauseButtonRef.current.textContent = "Pause";
    } else {
      playPauseButtonRef.current.textContent = "Play";
      videoRef.current.pause();
    }
  };

  const trimClip = (startTime, duration) => {
    setIsLoading(true);
    ipcRenderer.send("trim-video", {
      inputPath: filePath,
      startTime: startTime,
      duration: duration,
    });
  };

  const cutClip = (startTime, endTime) => {
    setIsLoading(true);
    ipcRenderer.send("cut-video", {
      inputPath: filePath,
      startTime: startTime,
      endTime: endTime,
      maxRight: maxRight,
    });
  };

  const handleClipSaveSuccess = (event, args) => {
    console.log("handleClipSaveSuccess >> ", args);
    setIsLoading(false);
    handleRemoveVideo();
    setToaster("Video saved successfully...");
    setTimeout(() => {
      setToaster("");
    }, 3000);
  };

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
                  maxRight={maxRight}
                  setMinVal={setMinVal}
                  setMaxVal={setMaxVal}
                  onChange={({ min, max }) =>
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
