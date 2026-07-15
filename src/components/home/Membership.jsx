import React from "react";
import { useData } from "../../context/DataContext";
import "../../style/Membership.css";

function Membership({ onJoinClick }) {
  const { memberships } = useData();

  if (!memberships || memberships.length === 0) {
    return null; // Return nothing if database has no memberships defined
  }

  return (
    <section className="membership-section" id="membership">
      <div className="membership-header">
        <span>MEMBERSHIP PLANS</span>
        <h2>Choose Your Fitness Journey</h2>
        <p>Flexible plans designed for every fitness goal.</p>
      </div>

      <div className="membership-grid">
        {memberships.map((plan, index) => {
          const isKids = 
            String(plan.title || "").toLowerCase().includes("kids") || 
            String(plan.subtitle || "").toLowerCase().includes("kids");

          return (
            <div
              key={plan._id || index}
              className={`plan-card card-${index + 1} ${isKids ? "featured" : ""}`}
            >
              <h3>{plan.title}</h3>
              <h1>{plan.price}</h1>
              <p className="plan-subtitle">{plan.subtitle}</p>

              <ul>
                {plan.features?.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>

              <button
                type="button"
                className="plan-btn cursor-pointer"
                onClick={() => onJoinClick && onJoinClick(plan.title)}
              >
                Join Now
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default Membership;