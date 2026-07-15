import React, { useEffect } from "react";
import logo from "../../assets/CaliYog-Logo.png";
import "./SplashScreen.css";

function SplashScreen({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="splash-container select-none">
      <div className="splash-content">
        <img
          src={logo}
          alt="CaliYog Logo"
          className="splash-logo"
        />

        <h1 className="splash-title">
          CALIYOG OUTDOOR FITNESS CLUB
        </h1>

        <p className="splash-text">
          Build Strength • Transform Body • Live Healthy
        </p>
      </div>
    </div>
  );
}

export default SplashScreen;