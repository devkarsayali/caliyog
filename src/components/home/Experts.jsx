import React from "react";
import { useData } from "../../context/DataContext";
import expertsImage from "../../assets/experts.JPG";
import "../../style/Experts.css";

function Experts() {
  const { experts } = useData();

  if (!experts || experts.length === 0) {
    return null; // Return nothing if database has no experts defined
  }

  return (
    <section className="experts-section" id="experts">
      <div className="experts-heading">
        <h2>MEET OUR FITNESS EXPERTS</h2>
        <p>
          Learn from certified coaches, athletes, and fitness professionals
          dedicated to helping you achieve your fitness goals.
        </p>
      </div>

      {/* Banner */}
      <div className="experts-image-container">
        <img
          src={expertsImage}
          alt="Experts Banner"
          className="experts-image"
          loading="lazy"
        />
      </div>

      {/* Scrolling Marquee Cards */}
      <div className="experts-marquee-wrapper">
        <div className="experts-track">
          {/* Render first copy */}
          {experts.map((expert, index) => (
            <div className="expert-info-card" key={`expert-1-${expert._id || index}`}>
              <div className="expert-card-image-box">
                <img
                  className="expert-card-image"
                  src={expert.image}
                  alt={expert.name || "Fitness Expert"}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = expertsImage;
                  }}
                />
              </div>

              <div className="expert-card-content">
                <h3>{expert.name || "Expert Name"}</h3>
                <h4>{expert.specialization || expert.role || "Fitness Expert"}</h4>
                <p>{expert.experience || expert.description || expert.bio || ""}</p>
              </div>
            </div>
          ))}

          {/* Render second copy for seamless infinite scrolling */}
          {experts.map((expert, index) => (
            <div className="expert-info-card" key={`expert-2-${expert._id || index}`}>
              <div className="expert-card-image-box">
                <img
                  className="expert-card-image"
                  src={expert.image}
                  alt={expert.name || "Fitness Expert"}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = expertsImage;
                  }}
                />
              </div>

              <div className="expert-card-content">
                <h3>{expert.name || "Expert Name"}</h3>
                <h4>{expert.specialization || expert.role || "Fitness Expert"}</h4>
                <p>{expert.experience || expert.description || expert.bio || ""}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Experts;