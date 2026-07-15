import React from "react";
import homeVideo from "../../assets/home-video.mp4";
import "../../style/Home.css";

function Home({ onJoinClick }) {
  return (
    <section className="home-section" id="home">
      <video
        className="background-video"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={homeVideo} type="video/mp4" />
      </video>

      <div className="overlay"></div>

      <div className="home-content">
        <span className="hero-badge">
          Welcome to CaliYog
        </span>

        <h1 className="home-title">
          CALIYOG OUTDOOR FITNESS CLUB
        </h1>

        <p className="home-subtitle">
          Build Strength • Transform Body • Live Healthy
        </p>

        <button
          className="join-btn cursor-pointer"
          onClick={() => onJoinClick && onJoinClick()}
        >
          Join Now
        </button>
      </div>
    </section>
  );
}

export default Home;