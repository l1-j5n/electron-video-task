/**
 *
 * @param {*} timeString String '02:30'
 * @returns Returns total seconds of the given timeString
 */
function toSeconds(timeString) {
  const [minutes, seconds] = timeString.split(":").map(Number);
  return minutes * 60 + seconds;
}

module.exports = {
  toSeconds,
};
