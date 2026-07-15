import React from "react";
import { useData } from "../../context/DataContext";
import "../../style/WhyChooseUs.css";

function WhyChooseUs() {
  const { whyChooseUs } = useData();

  if (!whyChooseUs || whyChooseUs.length === 0) {
    return null; // Return nothing if database has no Why Choose Us items
  }

  return (
    <section id="whychooseus" className="why-section">
      <div className="why-title">
        <h2>WHY CHOOSE US?</h2>
        <p>We work for fitness, strength, and performance — not just looks.</p>
      </div>

      <div className="why-container">
        {whyChooseUs.map((item, index) => (
          <div className="why-card" key={item._id || index}>
            <div className="why-image">
              <img src={item.image} alt={item.title} loading="lazy" />
            </div>

            <div className="why-content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default WhyChooseUs;