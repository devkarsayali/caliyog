import React, { useRef } from "react";
import { useData } from "../../context/DataContext";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import expertsImage from "../../assets/experts.JPG";
import "../../style/Transformations.css";

function Transformations() {
  const { transformations } = useData();
  const sliderRef = useRef(null);

  if (!transformations || transformations.length === 0) {
    return null; // Return nothing if database has no transformations
  }

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <section className="transform-section" id="transformations">
      <div className="transform-heading">
        <h2>Transformations We Did</h2>
        <p>Real fitness journeys and amazing results achieved by our members.</p>
      </div>

      <div className="transform-slider-wrapper">
        <button
          type="button"
          className="slider-arrow arrow-left cursor-pointer"
          onClick={scrollLeft}
          aria-label="Previous"
        >
          <FaChevronLeft />
        </button>

        <div className="transform-slider" ref={sliderRef}>
          {transformations.map((item, index) => (
            <div className="transform-card" key={item._id || index}>
              <div className="transform-card-image-box">
                <img
                  src={item.image}
                  alt={item.name || "Transformation Member"}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = expertsImage;
                  }}
                />
              </div>
              <div className="transform-card-content">
                <h3>{item.name}</h3>
                <h4>Real Results</h4>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="slider-arrow arrow-right cursor-pointer"
          onClick={scrollRight}
          aria-label="Next"
        >
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
}

export default Transformations;