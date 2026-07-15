import React from "react";
import { useData } from "../../context/DataContext";
import "../../style/Events.css";

function Events() {
  const { events } = useData();

  if (!events || events.length === 0) {
    return null; // Return nothing if database has no events defined
  }

  const galleryItems = events.filter((item) => item.eventType === "gallery");
  const organisedItems = events.filter(
    (item) => item.eventType === "organized" || item.eventType === "organised"
  );

  return (
    <section className="events-section" id="events">
      {galleryItems.length > 0 && (
        <>
          <div className="events-heading">
            <h2>Events and Clicks</h2>
            <p>Memorable moments from our fitness events and group activities.</p>
          </div>

          <div className="events-grid">
            {galleryItems.map((item, index) => (
              <div className="event-card" key={item._id || index}>
                <div className="event-img-box">
                  <img
                    src={item.image}
                    alt={item.title || "Gallery Event"}
                    className="event-img"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
                <div className="event-content">
                  <h3>{item.title || "Untitled Event"}</h3>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {organisedItems.length > 0 && (
        <div className="events-achievements">
          <div className="achievement-header">
            <span>MAJOR EVENTS</span>
            <h2>Events We Organised In Last Two Years</h2>
            <p>Organised big fitness events through CaliYog.</p>
          </div>

          <div className="achievement-list">
            {organisedItems.map((event, index) => (
              <div className="achievement-item" key={event._id || index}>
                <span>{index + 1}</span>
                <div>
                  <p>{event.title || "Untitled Organised Event"}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="coach-message">
            <h3>10+ Coaches Dedicated To One Mission</h3>
            <p>
              Introducing fitness into everyone's life through outdoor training,
              community support, discipline, and performance-based fitness.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default Events;