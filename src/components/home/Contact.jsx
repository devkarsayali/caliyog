import React, { useState } from "react";
import toast from 'react-hot-toast';
import { contactsAPI } from "../../api/dataAPI";
import "../../style/Contact.css";
import {
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
  FaGlobe,
  FaInstagram,
  FaFacebookF,
  FaWhatsapp,
  FaClock,
} from "react-icons/fa";

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await contactsAPI.create({
        name: formData.name.trim(),
        email: formData.email.trim(),
        contact: formData.contact.trim(),
        message: formData.message.trim(),
        status: "New",
        createdAt: new Date().toISOString()
      });

      toast.success("Thank you! Your enquiry has been submitted successfully.");
      setFormData({
        name: "",
        email: "",
        contact: "",
        message: "",
      });
    } catch (error) {
      console.error("Enquiry submission error:", error);
      toast.error("Failed to submit enquiry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact-section select-none" id="contact">
      <div className="contact-heading">
        <h2>Contact Us</h2>
        <p>
          Join CALIYOG Outdoor Fitness Club and start your fitness journey today.
        </p>
      </div>

      <div className="contact-container">
        <div className="contact-info">
          <h3>Get In Touch</h3>

          <p>
            <span className="contact-icon">
              <FaMapMarkerAlt />
            </span>
            <strong>Address:</strong> Near Your Location, Sangli
          </p>

          <p>
            <span className="contact-icon">
              <FaPhoneAlt />
            </span>
            <strong>Phone:</strong>{" "}
            <a href="tel:+919876543210">+91 98765 43210</a>
          </p>

          <p>
            <span className="contact-icon">
              <FaEnvelope />
            </span>
            <strong>Email:</strong>{" "}
            <a href="mailto:caliyogfitness@gmail.com">
              caliyogfitness@gmail.com
            </a>
          </p>

          <p>
            <span className="contact-icon">
              <FaGlobe />
            </span>
            <strong>Website:</strong>{" "}
            <a
              href="https://www.caliyogfitness.com"
              target="_blank"
              rel="noreferrer"
            >
              www.caliyogfitness.com
            </a>
          </p>

          <p>
            <span className="contact-icon">
              <FaInstagram />
            </span>
            <strong>Instagram:</strong>{" "}
            <a
              href="https://www.instagram.com/caliyog_fitness_club"
              target="_blank"
              rel="noreferrer"
            >
              @caliyog_fitness_club
            </a>
          </p>

          <p>
            <span className="contact-icon">
              <FaFacebookF />
            </span>
            <strong>Facebook:</strong>{" "}
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noreferrer"
            >
              CaliYog Outdoor Fitness Club
            </a>
          </p>

          <p>
            <span className="contact-icon">
              <FaWhatsapp />
            </span>
            <strong>WhatsApp:</strong>{" "}
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noreferrer"
            >
              Chat on WhatsApp
            </a>
          </p>

          <p>
            <span className="contact-icon">
              <FaClock />
            </span>
            <strong>Timings:</strong> Morning & Evening Batches Available
          </p>
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Enter Your Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Enter Your Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="contact"
            placeholder="Enter Your Phone Number"
            value={formData.contact}
            onChange={handleChange}
          />

          <textarea
            rows="5"
            name="message"
            placeholder="Write Your Message..."
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>

          <button type="submit" className="cursor-pointer" disabled={loading}>
            {loading ? "Sending..." : "Send Enquiry"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default Contact;