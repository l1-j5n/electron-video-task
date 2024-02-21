import React, { useCallback, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./multiRangeSlider.css";
import { toMinutes } from "../constants/common";

const MultiRangeSlider = ({
  min,
  max,
  minVal,
  maxVal,
  maxRight,
  setMinVal,
  setMaxVal,
  onChange,
  currentTime,
}) => {
  const thirdVal = 0;
  const minValRef = useRef(min);
  const maxValRef = useRef(max);
  const thirdValRef = useRef(thirdVal);
  const range = useRef(null);

  const getPercent = useCallback(
    (value) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  useEffect(() => {
    thirdValRef.current = thirdVal;
  }, [minVal, maxVal, max, thirdVal]);

  return (
    <div className="container">
      <input
        type="range"
        min={min}
        max={max}
        value={minVal}
        onChange={(event) => {
          let sliderRange = document.getElementsByClassName("slider__range");
          sliderRange.left = `${(minVal / maxVal) * 100}%`;
          sliderRange.width = `${maxVal - minVal}%`;
          const value = Math.min(Number(event.target.value), maxVal);
          setMinVal(value);
          minValRef.current = value;
        }}
        className="thumb thumb--left"
        style={{ zIndex: minVal > max - 100 && "5" }}
      />
      <div
        className="selected-range-left"
        style={{ width: `${(minVal * 100) / maxRight}%` }}
      ></div>
      <div
        className="selected-range-right"
        style={{
          left: `${(maxVal * 100) / maxRight}%`,
          width: `${((maxRight - maxVal) * 100) / maxRight}%`,
        }}
      ></div>
      <input
        type="range"
        min={min}
        max={max}
        value={maxVal}
        onChange={(event) => {
          const value = Math.max(Number(event.target.value), minVal + 1);
          setMaxVal(value);
          maxValRef.current = value;
        }}
        className="thumb thumb--right"
      />

      <input
        type="range"
        min={min}
        max={max}
        value={currentTime}
        onChange={(event) => {
          const value = Math.max(
            min,
            Math.min(Number(event.target.value), max)
          );
          thirdValRef.current = value;
          onChange([minVal, value, maxVal]);
        }}
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
  onChange: PropTypes.func.isRequired,
};

export default MultiRangeSlider;
