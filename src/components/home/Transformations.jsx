import React from "react";
import { useData } from "../../context/DataContext";
import "../../style/Transformations.css";

function Transformations() {
  const { transformations } = useData();

  if (!transformations || transformations.length === 0) {
    return null; // Return nothing if database has no transformations
  }

  return (
    <section className="transform-section" id="transformations">
      <div className="transform-heading">
        <h2>Transformations We Did</h2>
        <p>Real fitness journeys and amazing results achieved by our members.</p>
      </div>

      <div className="transform-grid">
        {transformations.map((item, index) => (
          <div className="transform-card" key={item._id || index}>
            <img
              src={item.image}
              alt={item.name}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <div className="transform-content">
              <h3>{item.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Transformations;