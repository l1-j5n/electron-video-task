import React, { useState, useRef } from "react";
import Dropzone from "./components/Dropzone";
import "./App.css";

function App() {
  const [videoUrl, setVideoUrl] = useState("");
  const [showDropzone, setShowDropzone] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (files) => {
    console.log("handle drop called");
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
    fileInputRef.current.click();
  };

  const handleFileInputChange = (e) => {
    console.log("handle file input change called");
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <button onClick={handleUploadClick} style={{ marginBottom: '20px' }}>Upload Video</button>
      {showDropzone && (
        <Dropzone handleDrop={handleDrop} handleSelectFile={handleSelectFile} />
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        style={{ display: "none" }}
        onChange={handleFileInputChange}
      />
      {videoUrl && (
        <div>
          <button onClick={handleRemoveVideo}>Remove</button>
          <video src={videoUrl} controls />
        </div>
      )}
    </div>
  );
}

export default App;
