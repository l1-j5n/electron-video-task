import React, { useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./multiRangeSlider.css";
import { toMinutes } from "../constants/common";

const MultiRangeSlider = ({
  min,
  max,
  minVal,
  maxVal,
  setMinVal,
  setMaxVal,
  onRangeChange,
  currentTime,
  isTrimMode,
}) => {
  const minValRef = useRef(min);
  const maxValRef = useRef(max);
  const range = useRef(null);

  // for get how many percentage timeline should be show as selected
  const getPercent = useCallback(
    (value) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxVal);

    // Set range of the selected video clip
    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, maxVal, getPercent]);

  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    // Set range of the selected video clip
    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  // When user move left brush/thumb then change value accordingly
  const handleMinValChange = (event) => {
    const value = Math.min(Number(event.target.value), maxVal);
    setMinVal(value);
    minValRef.current = value;
  };

    // When user move right brush/thumb then change value accordingly
  const handleMaxValChange = (event) => {
    const value = Math.max(Number(event.target.value), minVal + 1);
    setMaxVal(value);
    maxValRef.current = value;
  };

  // When user click on timeline then change third red brush/thumb accordingly
  const handleCurrentTimeChange = (event) => {
    const value = Math.max(min, Math.min(Number(event.target.value), max));
    onRangeChange([minVal, value, maxVal]);
  };

  return (
    <div className="container">
      <input
        type="range"
        min={min}
        max={max}
        value={minVal}
        step={"0.01"}
        onChange={handleMinValChange}
        className="thumb thumb--left"
        style={{ zIndex: minVal > max - 100 && "5" }}
      />
      {isTrimMode && (
        <div
          className="selected-range-left"
          style={{ width: `${(minVal * 100) / max}%` }}
        ></div>
      )}
      {!isTrimMode && (
        <div
          className="selected-range-middle"
          style={{
            left: `${(minVal * 100) / max}%`,
            width: `${((maxVal - minVal) * 100) / max}%`,
          }}
        ></div>
      )}
      {isTrimMode && (
        <div
          className="selected-range-right"
          style={{
            left: `${(maxVal * 100) / max}%`,
            width: `${((max - maxVal) * 100) / max}%`,
          }}
        ></div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        value={maxVal}
        step={"0.01"}
        onChange={handleMaxValChange}
        className="thumb thumb--right"
      />

      <input
        type="range"
        min={min}
        max={max}
        value={currentTime}
        step={"0.01"}
        onChange={handleCurrentTimeChange}
        className="thumb thumb--third"
      />

      <div className="slider">
        <div className="slider__track" />
        <div ref={range} className="slider__range" />
      </div>
      <div className="values">
        <div className="slider__left-value">{toMinutes(minVal.toFixed())}</div>
        <div className="slider__middle-value">
          {toMinutes(currentTime.toFixed())}
        </div>
        <div className="slider__right-value">{toMinutes(maxVal.toFixed())}</div>
      </div>
    </div>
  );
};

MultiRangeSlider.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  onRangeChange: PropTypes.func.isRequired,
  minVal: PropTypes.number.isRequired,
  maxVal: PropTypes.number.isRequired,
  setMinVal: PropTypes.func.isRequired,
  setMaxVal: PropTypes.func.isRequired,
  currentTime: PropTypes.number.isRequired,
  isTrimMode: PropTypes.bool.isRequired,
};

export default MultiRangeSlider;
