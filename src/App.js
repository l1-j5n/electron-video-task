import React, { useState, useRef, useEffect } from "react";
import Dropzone from "./components/Dropzone";
import "./App.css";
import MultiRangeSlider from "./components/MultiRangeSlider";
import { GetFrames } from "./constants/common";
const { ipcRenderer } = window.require("electron");

function App() {
  const [videoUrl, setVideoUrl] = useState("");
  const [filePath, setFilePath] = useState("");
  const [showDropzone, setShowDropzone] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [minVal, setMinVal] = useState(0);
  const [maxVal, setMaxVal] = useState(duration);
  const [images, setImages] = useState([]);
  const videoRef = useRef(null);
  const timelineRef = useRef(null);

  useEffect(() => {}, [maxVal]);

  const handleDrop = (files) => {
    const file = files[0];
    handleImportedFile(file);
  };

  const handleSelectFile = () => {
    videoRef.current.click();
  };

  const handleImportedFile = async (file) => {
    if (file.type.startsWith("video/")) {
      setFilePath(file?.path);
      const videoObjectUrl = URL.createObjectURL(file);
      setVideoUrl(videoObjectUrl);
      setShowDropzone(false);
    } else {
      alert("Please select a valid video file");
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleImportedFile(file);
  };

  const handleUploadClick = () => {
    setShowDropzone(!showDropzone);
  };

  const handleRemoveVideo = () => {
    setVideoUrl("");
    setShowDropzone(true);
    setCurrentTime(0);
    setDuration(0);
    setImages([]);
    setMinVal(0);
    if (videoRef.current) {
      videoRef.current.value = "";
    }
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = async () => {
    setDuration(videoRef.current.duration);
    setMaxVal(videoRef.current.duration);
    const frames = await GetFrames(videoUrl, 10, 0);
    setImages(frames);
  };

  const handleTimelineClick = (e) => {
    const rect = timelineRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const percentage = offsetX / rect.width;
    const seekTime = percentage * duration;
    setCurrentTime(seekTime);
    videoRef.current.currentTime = seekTime;
  };

  const trimClip = (startTime, duration) => {
    ipcRenderer.send("trim-video", {
      inputPath: filePath,
      startTime: startTime,
      duration: duration,
    });
  };

  const handleClipSaveSuccess = (event, args) => {
    console.log("handleClipSaveSuccess >> ", args);
  };

  const handleClipSaveError = (event, args) => {
    console.log("handleClipSaveError >> ", args);
  };

  useEffect(() => {
    ipcRenderer.on("clip-save-success", handleClipSaveSuccess);
    ipcRenderer.on("clip-save-error", handleClipSaveError);
    return () => {
      ipcRenderer.removeListener("clip-save-success", handleClipSaveSuccess);
      ipcRenderer.removeListener("clip-save-error", handleClipSaveError);
    };
  }, []);

  const now = new Date().toDateString();

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
              backgroundColor: "#f0f0f0",
              cursor: "pointer",
            }}
            onClick={handleTimelineClick}
          >
            <MultiRangeSlider
              min={0}
              max={duration}
              minVal={minVal}
              maxVal={maxVal}
              setMinVal={setMinVal}
              setMaxVal={setMaxVal}
              onChange={({ min, max }) =>
                console.log(`min = ${min}, max = ${max}`)
              }
              currentTime={currentTime}
              trimClip={trimClip}
            />
            {images?.length > 0 && (
              <div className="output">
                {images.map((imgData, index) => (
                  <>
                    <a key={imgData.image} href={imgData.image}>
                      <p>{imgData.captureTime}</p>
                      <img src={imgData.image} alt="" />
                    </a>
                  </>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
