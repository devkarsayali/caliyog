import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiX,
  FiUserCheck,
  FiImage,
  FiUpload,
} from "react-icons/fi";
import toast from 'react-hot-toast';
import { expertsAPI, uploadToCloudinary } from "../../../api/dataAPI";
import "../../../style/Admin/ExpertsTab.css";

function ExpertsTab({ action, onActionHandled }) {
  const [experts, setExperts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editId, setEditId] = useState(null);

  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    specialization: "",
    experience: "",
    imagePreview: "", 
    imageFile: null,
    oldImage: "",
  });

  const loadData = useCallback(async () => {
    try {
      const data = await expertsAPI.getAll();
      setExperts(data || []);
    } catch (error) {
      console.error("Experts Load Error:", error);
      toast.error("Failed to load experts");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (action === "add") {
      openAddModal();
      if (onActionHandled) onActionHandled();
    }
  }, [action, onActionHandled]);

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);

    setForm({
      name: "",
      specialization: "",
      experience: "",
      imagePreview: "",
      imageFile: null,
      oldImage: "",
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const openAddModal = () => {
    setModalMode("add");
    setShowModal(true);
  };

  const openEditModal = (expert) => {
    setForm({
      name: expert.name || "",
      specialization: expert.specialization || expert.role || "",
      experience: expert.experience || expert.description || expert.bio || "",
      imagePreview: expert.image || "", 
      imageFile: null,
      oldImage: expert.image || "",
    });

    setEditId(expert._id);
    setModalMode("edit");
    setShowModal(true);
  };

  const openBrowse = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error("File is too large! Please upload image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        imagePreview: reader.result,
        imageFile: file,
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editId && !form.imageFile) {
      toast.error("Please upload expert image");
      return;
    }

    try {
      let finalImageUrl = form.oldImage;

      if (form.imageFile) {
        const uploadedUrl = await uploadToCloudinary(form.imageFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      if (!finalImageUrl) {
        toast.error("Please upload an image");
        return;
      }

      const payload = {
        name: form.name.trim(),
        specialization: form.specialization.trim(),
        experience: form.experience.trim(),
        image: finalImageUrl,
      };

      if (modalMode === "add") {
        await expertsAPI.create(payload);
        toast.success("Expert added successfully");
      } else {
        await expertsAPI.update(editId, payload);
        toast.success("Expert updated successfully");
      }

      await loadData();
      closeModal();
    } catch (error) {
      console.error("Expert Save Error:", error);
      toast.error("Failed to save expert");
    }
  };

  const deleteExpert = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this fitness expert?"
    );

    if (!confirmDelete) return;

    try {
      await expertsAPI.delete(id);
      toast.success("Expert deleted successfully");
      await loadData();
    } catch (error) {
      console.error("Expert Delete Error:", error);
      toast.error("Failed to delete expert");
    }
  };

  return (
    <div className="admin-content-window select-none">
      <button
        type="button"
        className="experts-add-btn cursor-pointer"
        onClick={openAddModal}
      >
        <FiPlus /> Add Expert
      </button>

      <div className="admin-cards-grid">
        {experts.map((expert) => {
          return (
            <article className="expert-card" key={expert._id}>
              <div className="expert-image-box">
                {expert.image ? (
                  <img
                    src={expert.image}
                    alt={expert.name}
                    className="expert-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="expert-avatar">
                    <FiUserCheck />
                  </div>
                )}
                <span className="expert-status">Active Expert</span>
              </div>

              <div className="expert-card-content">
                <h3>{expert.name}</h3>
                <span className="expert-specialization">
                  {expert.specialization || expert.role}
                </span>
                <p>{expert.experience || expert.description || expert.bio}</p>
              </div>

              <div className="expert-card-footer">
                <button
                  type="button"
                  className="expert-edit-btn cursor-pointer"
                  onClick={() => openEditModal(expert)}
                >
                  <FiEdit /> Edit
                </button>

                <button
                  type="button"
                  className="expert-delete-btn cursor-pointer"
                  onClick={() => deleteExpert(expert._id)}
                >
                  <FiTrash2 /> Delete
                </button>
              </div>
            </article>
          );
        })}

        {experts.length === 0 && (
          <div className="admin-empty-box">
            <div className="empty-icon">
              <FiUserCheck />
            </div>
            <h3>No Experts Found</h3>
            <p>Click Add Expert to create your first fitness expert profile.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal small-expert-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {modalMode === "add" ? "Add" : "Edit"} Fitness Expert
              </h3>

              <button
                type="button"
                className="admin-modal-close cursor-pointer"
                onClick={closeModal}
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body compact-modal-body">
                <div
                  className="expert-photo-preview"
                  onClick={openBrowse}
                  title="Click to upload photo"
                >
                  {form.imagePreview ? (
                    <img src={form.imagePreview} alt="Preview" />
                  ) : (
                    <div className="photo-placeholder">
                      <FiImage />
                      <span>Add Photo</span>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden-file-input"
                />

                <button
                  type="button"
                  className="upload-photo-btn cursor-pointer"
                  onClick={openBrowse}
                >
                  <FiUpload /> Upload Expert Photo
                </button>

                <div className="admin-form-group">
                  <label>Expert Name</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter expert name"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Specialization</label>
                  <input
                    type="text"
                    className="admin-form-control"
                    value={form.specialization}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        specialization: e.target.value,
                      })
                    }
                    placeholder="e.g. Head Coach"
                    required
                  />
                </div>

                <div className="admin-form-group">
                  <label>Experience</label>
                  <textarea
                    rows="2"
                    className="admin-form-control"
                    value={form.experience}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        experience: e.target.value,
                      })
                    }
                    placeholder="Experience and certifications"
                    required
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary cursor-pointer"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button type="submit" className="admin-btn admin-btn-primary cursor-pointer">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpertsTab;
