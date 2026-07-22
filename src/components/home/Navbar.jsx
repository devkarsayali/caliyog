import React, { useEffect, useState } from "react";
import "./Navbar.css";
import logo from "../../assets/CaliYog-Logo.png";

function Navbar({ onJoinClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const closeMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleJoinClick = () => {
    setMenuOpen(false);
    onJoinClick();
  };

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");

    const handleScroll = () => {
      const threshold = 160; // offset threshold (handles navbar height buffer)
      let currentSection = "home";

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= threshold && rect.bottom > threshold) {
          currentSection = section.getAttribute("id");
        }
      });

      setActiveSection(currentSection);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo-section">
        <img
          src={logo}
          alt="CaliYog Logo"
          className="logo-img"
        />
        <div className="logo">
          CALIYOG
        </div>
      </div>

      {/* Mobile Menu Toggle */}
      <div
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </div>

      {/* Navigation Links */}
      <ul className={`nav-links ${menuOpen ? "active" : ""}`}>
        <li>
          <a
            href="#home"
            className={activeSection === "home" ? "active" : ""}
            onClick={closeMenu}
          >
            Home
          </a>
        </li>

        <li>
          <a
            href="#about"
            className={activeSection === "about" ? "active" : ""}
            onClick={closeMenu}
          >
            About
          </a>
        </li>

        <li>
          <a
            href="#whychooseus"
            className={activeSection === "whychooseus" ? "active" : ""}
            onClick={closeMenu}
          >
            Why Choose Us
          </a>
        </li>

        <li>
          <a
            href="#batches"
            className={activeSection === "batches" ? "active" : ""}
            onClick={closeMenu}
          >
            Batches
          </a>
        </li>

        <li>
          <a
            href="#membership"
            className={activeSection === "membership" ? "active" : ""}
            onClick={closeMenu}
          >
            Membership
          </a>
        </li>

        <li>
          <a
            href="#transformations"
            className={activeSection === "transformations" ? "active" : ""}
            onClick={closeMenu}
          >
            Transformations
          </a>
        </li>

        <li>
          <a
            href="#experts"
            className={activeSection === "experts" ? "active" : ""}
            onClick={closeMenu}
          >
            Experts
          </a>
        </li>

        <li>
          <a
            href="#events"
            className={activeSection === "events" ? "active" : ""}
            onClick={closeMenu}
          >
            Events
          </a>
        </li>

        <li>
          <a
            href="#feedback"
            className={activeSection === "feedback" ? "active" : ""}
            onClick={closeMenu}
          >
            Feedback
          </a>
        </li>

        <li>
          <a
            href="#contact"
            className={activeSection === "contact" ? "active" : ""}
            onClick={closeMenu}
          >
            Contact
          </a>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;