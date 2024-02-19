/**
 *
 * @param {*} timeString String '02:30'
 * @returns Returns total seconds of the given timeString
 */
function toSeconds(timeString) {
  const [minutes, seconds] = timeString.split(":").map(Number);
  return minutes * 60 + seconds;
}

/**
 *
 * @param {*} timeString Number 125
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

module.exports = {
  toSeconds,
  toMinutes,
};
