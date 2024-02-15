import React from "react";

const Dropzone = ({ handleDrop, handleSelectFile }) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
  };

  const handleDropEvent = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleDrop(files);
  };

  return (
    <div
      onDrop={handleDropEvent}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      style={{
        width: "100%",
        height: "200px",
        border: "2px dashed #ccc",
        textAlign: "center",
        lineHeight: "200px",
      }}
    >
      <button onClick={handleSelectFile}>Select File</button>
      (or drop video files here)
    </div>
  );
};

export default Dropzone;
