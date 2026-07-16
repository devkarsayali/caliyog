import React from "react";
import "../../style/Footer.css";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Club Info */}
        <div className="footer-box">
          <h2>CALIYOG FITNESS CLUB</h2>
          <p>
            Transform Your Body, Build Strength,
            Improve Performance, and Live a Healthy Life
            with CaliYog Outdoor Fitness Club.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer-box">
          <h3>Quick Links</h3>
          <ul>
            <li><a href="#home">Home</a></li>
            <li><a href="#about">About</a></li>
            <li><a href="#whychooseus">Why Choose Us</a></li>
            <li><a href="#batches">Batches</a></li>
            <li><a href="#membership">Membership</a></li>
            <li><a href="#transformations">Transformations</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="footer-box">
          <h3>Contact Info</h3>
          <p>📍 Sangli, Maharashtra</p>
          <p>
            📞{" "}
            <a href="tel:+919404128090">
              +91 9404128090
            </a>
          </p>
          <p>
            📧{" "}
            <a href="mailto:caliyogoutdoorfitnessclub@gmail.com">
              caliyogoutdoorfitnessclub@gmail.com
            </a>
          </p>
        </div>

        {/* Social Media */}
        <div className="footer-box">
          <h3>Follow Us</h3>
          <a
            href="https://www.instagram.com/cali.yog/?utm_source=ig_web_button_share_sheet"
            target="_blank"
            rel="noreferrer"
            className="social-link"
          >
            📸 Instagram
          </a>
          <a
            href="https://share.google/s3LpW5bI5PI0EPYqB"
            target="_blank"
            rel="noreferrer"
            className="social-link"
          >
            👍 Facebook
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        © 2025 CALIYOG Outdoor Fitness Club | All Rights Reserved
      </div>
    </footer>
  );
}

export default Footer;