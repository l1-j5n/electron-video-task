import React, { useState, useRef, useEffect } from "react";
import Dropzone from "./components/Dropzone";
import "./App.css";
import MultiRangeSlider from "./components/MultiRangeSlider";
const { ipcRenderer } = window.require("electron");

function App() {
  const [videoUrl, setVideoUrl] = useState("");
  const [showDropzone, setShowDropzone] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef(null);
  const timelineRef = useRef(null);

  const handleDrop = (files) => {
    const file = files[0];
    if (file.type.startsWith("video/")) {
      const videoObjectUrl = URL.createObjectURL(file);
      setVideoUrl(videoObjectUrl);
      setShowDropzone(false);
    } else {
      alert("Please drop a valid video file");
    }
  };

  const handleSelectFile = () => {
    videoRef.current.click();
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file.type.startsWith("video/")) {
      const videoObjectUrl = URL.createObjectURL(file);
      setVideoUrl(videoObjectUrl);
      setShowDropzone(false);
    } else {
      alert("Please select a valid video file");
    }
  };

  const handleUploadClick = () => {
    setShowDropzone(!showDropzone);
  };

  const handleRemoveVideo = () => {
    setVideoUrl("");
    setShowDropzone(true);
    setCurrentTime(0);
    setDuration(0);
    if (videoRef.current) {
      videoRef.current.value = "";
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(videoRef.current.duration);
  };

  const handleTimelineClick = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / rect.width;
    const seekTime = percentage * duration;
    setCurrentTime(seekTime);
    videoRef.current.currentTime = seekTime;
  };

  const handleRemoveClip = (clipIndex) => {
    // Implement functionality to remove split points and update the timeline
  };

  const trimClip = (input, startTime, duration) => {
    ipcRenderer.send("trim-video", {
      inputPath: "/home/logicrays/Videos/testing_video_.mp4",
      startTime: 10,
      duration: 5,
    });
  };

  const handleClipSaveSuccess = (event, args) => {
    console.log("handleClipSaveSuccess >> ", args);
  };

  const handleClipSaveError = (event, args) => {
    console.log("handleClipSaveError >> ", args);
  };

  useEffect(() => {
    // trimClip();
    ipcRenderer.on("clip-save-success", handleClipSaveSuccess);
    ipcRenderer.on("clip-save-error", handleClipSaveError);
    return () => {
      ipcRenderer.removeListener("clip-save-success", handleClipSaveSuccess);
      ipcRenderer.removeListener("clip-save-error", handleClipSaveError);
    };
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <button onClick={handleUploadClick} style={{ marginBottom: "20px" }}>
        Upload Video
      </button>
      <br />
      {showDropzone && (
        <Dropzone handleDrop={handleDrop} handleSelectFile={handleSelectFile} />
      )}
      <input
        ref={videoRef}
        type="file"
        accept="video/*"
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />
      {videoUrl && (
        <div>
          <button onClick={handleRemoveVideo}>Remove</button>
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
          />
          <div
            ref={timelineRef}
            style={{
              // width: "80%",
              // margin: "20px",
              backgroundColor: "#f0f0f0",
              cursor: "pointer",
            }}
            onClick={handleTimelineClick}
          >
            <div
              style={{
                width: `${(currentTime / duration) * 100}%`,
                height: "20px",
                backgroundColor: "red",
              }}
            />
            <MultiRangeSlider
              min={0}
              max={duration}
              onChange={({ min, max }) =>
                console.log(`min = ${min}, max = ${max}`)
              }
              currentTime={currentTime}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
