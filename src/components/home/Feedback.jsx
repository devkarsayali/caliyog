import React, { useRef } from "react";
import logo from "../../assets/CaliYog-Logo.png";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "../../style/Feedback.css";

const feedbacks = [
  {
    name: "nidhi patwardhan",
    rating: 5,
    reviews: "5 reviews",
    photos: "",
    date: "11 months ago",
    text: "Lots of open space to workout. Not like a routine cramped up gym. And the best trainers in city, make this caliyog gym the place to be achieve your dream of fitness.",
  },
  {
    name: "Chetan Mali",
    rating: 5,
    reviews: "Local Guide",
    photos: "37 reviews • 8 photos",
    date: "a year ago",
    text: "Definitely one of the best places in the town yet. Fantastic coaches and a great vibe all around.",
  },
  {
    name: "Nikhil Chavan",
    rating: 5,
    reviews: "8 reviews",
    date: "a month ago",
    text: "Helps to increase strength, Endurance... Motivate to grow at individual as well as in group. Dedicated coaches helps to achieve our goals. Definitely more than traditional workout.",
  },
  {
    name: "vidya kadam",
    rating: 5,
    reviews: "2 reviews",
    photos: "",
    date: "a year ago",
    text: "The best place to workout. Let me save you the trouble. Just go n join it. U will love the gym(Should be called something else) The experience and joy is something you wont get in any other gym.",
  },
  {
    name: "Tarachand Ratawa",
    rating: 5,
    reviews: "10 reviews",
    photos: "4 photos",
    date: "11 months ago",
    text: "One of its kind fitness center in Sangli Kolhapur district, so now why to go Pune Mumbai when we have world class center here in our area!😊",
  },
  {
    name: "Mandar Patil",
    rating: 5,
    reviews: "2 reviews",
    photos: "",
    date: "11 months ago",
    text: "Must join...very fresh atmosphere...very good trainers...Can't escape from daily scheduled work out... Sore today, stronger tomorrow",
  },
  {
    name: "prasad nandanikar",
    rating: 5,
    reviews: "2 reviews",
    photos: "3 photos",
    date: "a year ago",
    text: "It's new totally a new concept and those who love fitness it's best for them to just explore themselves in strength and flexibility.I would recommend to join this.",
  },
  {
    name: "Alisha Pathan",
    rating: 5,
    reviews: "3 reviews",
    photos: "",
    date: "6 months ago",
    text: "Caliyog has been awesome to me. The workouts are fun, the Coach are inspiring, they know how to push you to the limit in the best way possible with your workouts!",
  },
  {
    name: "vishwas Kadam",
    rating: 5,
    reviews: "Local Guide",
    photos: "146 reviews • 452 photos",
    date: "a year ago",
    text: "More than a gym and fitness club! Join and forget about health worries. You will definitely get addicted. All coaches are fantastic and inspiring.",
  },
  {
    name: "sanjeet zele",
    rating: 5,
    reviews: "Local Guide",
    photos: "",
    date: "2 months ago",
    text: "Been almost 9 months since I started my calisthenics journey without caliyog, joining Caliyog was one of the best decision I've ever made and the one of the best aspects of the gym is its knowledgeable trainers. ",
  },
];

function Feedback() {
  const sliderRef = useRef(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

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

      <div className="feedback-slider-wrapper">
        <button
          type="button"
          className="feedback-slider-arrow feedback-arrow-left cursor-pointer"
          onClick={scrollLeft}
          aria-label="Previous"
        >
          <FaChevronLeft />
        </button>

        <div className="feedback-slider" ref={sliderRef}>
          {feedbacks.map((item, index) => (
            <div className="feedback-card" key={index}>
              <div className="feedback-top">
                <div className="feedback-user-info">
                  <h3>{item.name}</h3>
                  <p>
                    {item.reviews}{item.photos ? ` • ${item.photos}` : ""}
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

        <button
          type="button"
          className="feedback-slider-arrow feedback-arrow-right cursor-pointer"
          onClick={scrollRight}
          aria-label="Next"
        >
          <FaChevronRight />
        </button>
      </div>
    </section>
  );
}

export default Feedback;