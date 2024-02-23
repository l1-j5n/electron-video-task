/**
 *
 * @param {string} timeString Ex. String '02:30'
 * @returns Returns total seconds of the given timeString
 */
function toSeconds(timeString) {
  const [minutes, seconds] = timeString.split(":").map(Number);
  return minutes * 60 + seconds;
}

/**
 *
 * @param {string} timeString Ex. Number 125
 * @returns Returns (02:05) total minutes and seconds of the given timeString
 */
function toMinutes(timeString) {
  let minutes = Math.floor(timeString / 60);
  let remainingSeconds = timeString % 60;

  let minutesStr = minutes < 10 ? "0" + minutes : minutes;
  let secondsStr =
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

  return minutesStr + ":" + secondsStr;
}

/**
 * @param {string} videoUrl url to the video file (html5 compatible format) eg: mp4
 * @param {number} amount number of frames per second or total number of frames that you want to extract
 * @param {number} type [fps, totalFrames] The method of extracting frames: Number of frames per second of video or the total number of frames across the whole video duration. defaults to fps
 * @description Extracts frames from the video and returns them as an array of imageData
 * @returns Array of frames
 */
async function GetFrames(videoUrl, amount) {
  const frames = [];
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  let duration;

  const video = document.createElement("video");
  video.preload = "auto";

  await new Promise((resolve) => {
    video.addEventListener("loadeddata", () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      duration = video.duration;
      resolve();
    });

    video.src = videoUrl;
    video.load();
  });

  let totalFrames = amount;

  for (let time = 0; time < duration; time += duration / totalFrames) {
    frames.push({
      image: await getVideoFrame(video, context, canvas, time),
      captureTime: time,
    });
  }

  return frames;
}

/**
 * @param {HTMLVideoElement} video HTML video element
 * @param {CanvasRenderingContext2D} context Canvas rendering context
 * @param {HTMLCanvasElement} canvas HTML canvas element
 * @param {number} time Time in seconds to retrieve the frame from
 * @description Retrieves a single frame from the video at a specified time
 * @returns Captured frame
 */
async function getVideoFrame(video, context, canvas, time) {
  return new Promise((resolve) => {
    const eventCallback = () => {
      video.removeEventListener("seeked", eventCallback);
      storeFrame(video, context, canvas, resolve);
    };
    video.addEventListener("seeked", eventCallback);
    video.currentTime = time;
  });
}

/**
 * @param {HTMLVideoElement} video HTML video element
 * @param {CanvasRenderingContext2D} context Canvas rendering context
 * @param {HTMLCanvasElement} canvas HTML canvas element
 * @param {function} resolve Resolve function for the Promise
 * @description Stores the frame on the canvas and resolves with the data URL
 */
function storeFrame(video, context, canvas, resolve) {
  context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
  resolve(canvas.toDataURL());
}

module.exports = {
  toSeconds,
  toMinutes,
  GetFrames,
};
