import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiPlus, FiEdit, FiTrash2, FiX, FiUpload, FiImage } from "react-icons/fi";
import toast from 'react-hot-toast';
import { eventsAPI, uploadToCloudinary } from "../../../api/dataAPI";
import "../../../style/Admin/EventsTab.css";

function GalleryEventsTab() {
  const [events, setEvents] = useState([]);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editId, setEditId] = useState(null);

  const fileInputRef = useRef(null);

  const [galleryForm, setGalleryForm] = useState({
    imagePreview: "",
    imageFile: null,
    title: "",
    oldImage: "",
  });

  const getImageUrl = (img) => {
    if (!img) return "";
    return img;
  };

  const hasImage = (img) => {
    if (!img) return false;
    if (typeof img === "string") return img.trim() !== "";
    return false;
  };

  const loadData = useCallback(async () => {
    try {
      const data = await eventsAPI.getAll();
      const eventList = data || [];
      setEvents(eventList.filter((item) => item.eventType === "gallery"));
    } catch (error) {
      console.error("Gallery Events Load Error:", error);
      toast.error("Failed to load gallery events");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const closeGalleryModal = () => {
    setShowGalleryModal(false);
    setEditId(null);
    setModalMode("add");
    setGalleryForm({ imagePreview: "", imageFile: null, title: "", oldImage: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openBrowse = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large! Max 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setGalleryForm((prev) => ({
        ...prev,
        imagePreview: reader.result,
        imageFile: file,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();

    if (!editId && !galleryForm.imageFile) {
      toast.error("Please upload an event image");
      return;
    }

    try {
      let finalImageUrl = galleryForm.oldImage;

      if (galleryForm.imageFile) {
        const uploadedUrl = await uploadToCloudinary(galleryForm.imageFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      if (!finalImageUrl) {
        toast.error("Please upload an image");
        return;
      }

      const payload = {
        eventType: "gallery",
        title: galleryForm.title.trim(),
        description: "",
        image: finalImageUrl,
        location: "",
        date: "",
      };

      if (modalMode === "add") {
        await eventsAPI.create(payload);
        toast.success("Gallery event added successfully");
      } else {
        await eventsAPI.update(editId, payload);
        toast.success("Gallery event updated successfully");
      }

      await loadData();
      closeGalleryModal();
    } catch (error) {
      console.error("Gallery Save Error:", error);
      toast.error("Failed to save gallery event");
    }
  };

  const deleteEvent = async (id) => {
    if (!window.confirm("Delete this gallery event?")) return;

    try {
      await eventsAPI.delete(id);
      toast.success("Gallery event deleted successfully");
      await loadData();
    } catch (error) {
      console.error("Delete Gallery Event Error:", error);
      toast.error("Failed to delete gallery event");
    }
  };

  const openGalleryAdd = () => {
    setModalMode("add");
    setEditId(null);
    setGalleryForm({ imagePreview: "", imageFile: null, title: "", oldImage: "" });
    setShowGalleryModal(true);
  };

  const openGalleryEdit = (evt) => {
    setGalleryForm({
      imagePreview: getImageUrl(evt.image || evt.img),
      imageFile: null,
      title: evt.title || "",
      oldImage: evt.image || "",
    });
    setEditId(evt._id);
    setModalMode("edit");
    setShowGalleryModal(true);
  };

  return (
    <div className="admin-content-window select-none">
      <button
        type="button"
        className="events-action-btn primary cursor-pointer"
        onClick={openGalleryAdd}
      >
        <FiPlus /> Add Gallery Event
      </button>

      <div className="section-title-row">
        <h2>Gallery Cards</h2>
        <span>{events.length} Items</span>
      </div>

      <div className="events-cards-grid">
        {events.map((evt) => {
          const imageUrl = getImageUrl(evt.image || evt.img);

          return (
            <article className="event-card-admin" key={evt._id}>
              <div className="event-img-box">
                {hasImage(evt.image || evt.img) ? (
                  <img
                    src={imageUrl}
                    alt={evt.title || "Gallery Event"}
                    className="event-img"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="image-placeholder">
                    <FiImage />
                    <span>No Image</span>
                  </div>
                )}
              </div>

              <div className="event-card-content">
                <h3>{evt.title || "Untitled Event"}</h3>
              </div>

              <div className="event-card-footer">
                <button
                  type="button"
                  className="event-edit-btn cursor-pointer"
                  onClick={() => openGalleryEdit(evt)}
                >
                  <FiEdit /> Edit
                </button>

                <button
                  type="button"
                  className="event-delete-btn cursor-pointer"
                  onClick={() => deleteEvent(evt._id)}
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </article>
          );
        })}

        {events.length === 0 && (
          <div className="admin-empty-box">
            <div className="empty-icon"><FiImage /></div>
            <h3>No Gallery Events</h3>
            <p>Click "Add Gallery Event" to upload images.</p>
          </div>
        )}
      </div>

      {showGalleryModal && (
        <div className="event-modal-overlay">
          <div className="event-modal">
            <div className="event-modal-header">
              <h3>{modalMode === "add" ? "Add" : "Edit"} Gallery Event</h3>
              <button type="button" className="cursor-pointer" onClick={closeGalleryModal}>
                <FiX />
              </button>
            </div>

            <form onSubmit={handleGallerySubmit}>
              <div className="event-modal-body">
                <div className="event-image-preview" onClick={openBrowse}>
                  {hasImage(galleryForm.imagePreview) ? (
                    <img src={galleryForm.imagePreview} alt="Preview" />
                  ) : (
                    <div className="image-placeholder">
                      <FiImage />
                      <span>Add Image</span>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden-file-input"
                />

                <button
                  type="button"
                  className="event-upload-btn cursor-pointer"
                  onClick={openBrowse}
                >
                  <FiUpload /> Upload Event Image
                </button>

                <div className="admin-form-group">
                  <label>Event Title</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={galleryForm.title}
                    onChange={(e) =>
                      setGalleryForm({ ...galleryForm, title: e.target.value })
                    }
                    placeholder="Enter event title"
                    required
                  />
                </div>
              </div>

              <div className="event-modal-footer">
                <button type="button" className="cancel-btn cursor-pointer" onClick={closeGalleryModal}>
                  Cancel
                </button>
                <button type="submit" className="save-btn cursor-pointer">
                  Save Gallery Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GalleryEventsTab;
