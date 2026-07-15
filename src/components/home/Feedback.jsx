import React from "react";
import logo from "../../assets/CaliYog-Logo.png";
import "../../style/Feedback.css";

const feedbacks = [
  {
    name: "Akshita Jain",
    image: "https://i.pravatar.cc/100?img=1",
    rating: 5,
    reviews: "7 reviews",
    photos: "4 photos",
    date: "2 days ago",
    text: "Been 3 months now and CaliYog has changed me so much. Best coaches and amazing positive vibe.",
  },
  {
    name: "Amruta Bharkhada",
    image: "https://i.pravatar.cc/100?img=5",
    rating: 5,
    reviews: "4 reviews",
    photos: "2 photos",
    date: "4 days ago",
    text: "Personal attention, proper guidance and truly amazing coaches. Love the place CaliYog.",
  },
  {
    name: "Raksha Jaju",
    image: "https://i.pravatar.cc/100?img=8",
    rating: 5,
    reviews: "3 reviews",
    photos: "1 photo",
    date: "1 month ago",
    text: "Best place to get out of boring gym routines. Every workout is unique and powerful.",
  },
  {
    name: "Siddharth Patil",
    image: "https://i.pravatar.cc/100?img=12",
    rating: 5,
    reviews: "2 reviews",
    photos: "3 photos",
    date: "11 months ago",
    text: "Coaches support you to unlock new skills and improve health. Great fitness community.",
  },
  {
    name: "Chetan Mali",
    image: "https://i.pravatar.cc/100?img=15",
    rating: 5,
    reviews: "Local Guide",
    photos: "27 reviews",
    date: "1 year ago",
    text: "One of the best places in the town. Fantastic coaches and great vibe all around.",
  },
  {
    name: "Vidya Kadam",
    image: "https://i.pravatar.cc/100?img=20",
    rating: 5,
    reviews: "Local Guide",
    photos: "146 reviews",
    date: "1 year ago",
    text: "More than a gym and fitness club. Join and forget about health worries.",
  },
  {
    name: "Tarachand Ratavase",
    image: "https://i.pravatar.cc/100?img=25",
    rating: 5,
    reviews: "10 reviews",
    photos: "4 photos",
    date: "11 months ago",
    text: "One of the finest fitness centers. Excellent coaching, supportive trainers, and a great atmosphere for everyone.",
  },
  {
    name: "Priya Nandanikar",
    image: "https://i.pravatar.cc/100?img=30",
    rating: 5,
    reviews: "2 reviews",
    photos: "3 photos",
    date: "1 year ago",
    text: "A unique fitness concept. Perfect for those who want to improve strength, flexibility, and overall health.",
  },
];

function Feedback() {
  return (
    <section id="feedback" className="feedback-section">
      <div className="feedback-heading">
        <img
          src={logo}
          alt="CaliYog Logo"
          loading="lazy"
        />

        <h2>MEMBER FEEDBACKS</h2>

        <p>
          Real words from our CaliYog fitness community
        </p>
      </div>

      <div className="feedback-container">
        {feedbacks.map((item, index) => (
          <div className="feedback-card" key={index}>
            <div className="feedback-top">
              <div className="feedback-user-img">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                />
              </div>

              <div className="feedback-user-info">
                <h3>{item.name}</h3>
                <p>
                  {item.reviews} • {item.photos}
                </p>
              </div>

              <div className="google-icon-box">
                <span className="google-letter-g">G</span>
              </div>
            </div>

            <div className="feedback-rating">
              <div className="stars">
                {"★".repeat(item.rating)}
                {"☆".repeat(5 - item.rating)}
              </div>
              <span className="feedback-date">{item.date}</span>
            </div>

            <p className="feedback-text">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Feedback;