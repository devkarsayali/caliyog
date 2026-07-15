import React, { useEffect, useState } from "react";
import "./Navbar.css";
import logo from "../../assets/CaliYog-Logo.png";

function Navbar({ onJoinClick }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const handleJoinClick = () => {
    setMenuOpen(false);
    onJoinClick();
  };

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;

      sections.forEach((section) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute("id");

        if (
          scrollPosition >= top &&
          scrollPosition < top + height
        ) {
          setActiveSection(id);
        }
      });
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

      {/* Join Now */}
      <button
        className="navbar-btn join-link cursor-pointer"
        onClick={handleJoinClick}
      >
        Join Now
      </button>
    </nav>
  );
}

export default Navbar;