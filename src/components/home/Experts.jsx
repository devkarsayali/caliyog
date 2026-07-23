import React, { useState } from "react";
import { useData } from "../../context/DataContext";
import expertsImage from "../../assets/experts.JPG";
import ImageModal from "../common/ImageModal";
import "../../style/Experts.css";

function Experts() {
  const { experts } = useData();
  const [selectedImage, setSelectedImage] = useState(null);

  if (!experts || experts.length === 0) {
    return null; // Return nothing if database has no experts defined
  }

  const openModal = (src, name, subtitle) => {
    setSelectedImage({
      src,
      alt: name || "Fitness Expert",
      caption: subtitle ? `${name} - ${subtitle}` : name,
    });
  };

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
      <div
        className="experts-image-container cursor-pointer"
        onClick={() => openModal(expertsImage, "CaliYog Expert Coaches Team", "Outdoor Fitness Trainers")}
      >
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
            <div
              className="expert-info-card cursor-pointer"
              key={`expert-1-${expert._id || index}`}
              onClick={() => openModal(expert.image || expertsImage, expert.name || "Fitness Expert", expert.specialization || expert.role)}
            >
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
            <div
              className="expert-info-card cursor-pointer"
              key={`expert-2-${expert._id || index}`}
              onClick={() => openModal(expert.image || expertsImage, expert.name || "Fitness Expert", expert.specialization || expert.role)}
            >
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

      {/* Fullscreen Image Lightbox Modal */}
      <ImageModal
        isOpen={!!selectedImage}
        imageSrc={selectedImage?.src}
        imageAlt={selectedImage?.alt}
        caption={selectedImage?.caption}
        onClose={() => setSelectedImage(null)}
      />
    </section>
  );
}

export default Experts;
