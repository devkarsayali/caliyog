import React, { useEffect, useState } from "react";
import { FiPlus, FiEdit, FiTrash2, FiX } from "react-icons/fi";
import toast from 'react-hot-toast';
import { batchesAPI } from "../../../api/dataAPI";
import "../../../style/Admin/BatchesTab.css";

function BatchesTab() {
  const [batches, setBatches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    icon: "",
    title: "",
    points: [""],
  });

  const loadBatches = async () => {
    try {
      const data = await batchesAPI.getAll();
      setBatches(data || []);
    } catch (error) {
      console.error("Batches Load Error:", error);
      toast.error("Failed to load batches");
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const resetForm = () => {
    setForm({
      icon: "",
      title: "",
      points: [""],
    });
  };

  const closeModal = () => {
    setShowModal(false);
    setModalMode("add");
    setEditId(null);
    resetForm();
  };

  const openAddModal = () => {
    setModalMode("add");
    setEditId(null);
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (batch) => {
    setModalMode("edit");
    setEditId(batch._id);

    setForm({
      icon: batch.icon || "",
      title: batch.title || "",
      points: Array.isArray(batch.points) && batch.points.length > 0 ? batch.points : [""],
    });

    setShowModal(true);
  };

  const handlePointChange = (index, value) => {
    const updatedPoints = [...form.points];
    updatedPoints[index] = value;
    setForm({
      ...form,
      points: updatedPoints,
    });
  };

  const addPointInput = () => {
    setForm({
      ...form,
      points: [...form.points, ""],
    });
  };

  const removePointInput = (index) => {
    const updatedPoints = form.points.filter((_, i) => i !== index);
    setForm({
      ...form,
      points: updatedPoints.length > 0 ? updatedPoints : [""],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanPoints = form.points
      .map((point) => point.trim())
      .filter((point) => point !== "");

    if (!form.title.trim()) {
      toast.error("Please enter batch title");
      return;
    }

    if (cleanPoints.length === 0) {
      toast.error("Please add at least one batch point");
      return;
    }

    const payload = {
      icon: form.icon.trim() || "💪",
      title: form.title.trim(),
      points: cleanPoints,
    };

    try {
      if (modalMode === "add") {
        await batchesAPI.create(payload);
        toast.success("Batch added successfully");
      } else {
        await batchesAPI.update(editId, payload);
        toast.success("Batch updated successfully");
      }
      loadBatches();
      closeModal();
    } catch (error) {
      console.error("Batch Save Error:", error);
      toast.error("Failed to save batch");
    }
  };

  const deleteBatch = async (id) => {
    if (!window.confirm("Are you sure you want to delete this batch?")) return;

    try {
      await batchesAPI.delete(id);
      toast.success("Batch deleted successfully");
      loadBatches();
    } catch (error) {
      console.error("Batch Delete Error:", error);
      toast.error("Failed to delete batch");
    }
  };

  return (
    <div className="admin-content-window select-none">
      <button
        type="button"
        className="batch-add-btn cursor-pointer"
        onClick={openAddModal}
      >
        <FiPlus /> Add Batch
      </button>

      <div className="batch-admin-grid">
        {batches.length === 0 ? (
          <div className="admin-empty-box">
            No batches found. Click Add Batch.
          </div>
        ) : (
          batches.map((batch) => (
            <article className="batch-admin-card" key={batch._id}>
              <div className="batch-admin-icon">{batch.icon || "💪"}</div>

              <h3>{batch.title}</h3>

              <ul>
                {Array.isArray(batch.points) &&
                  batch.points.map((point, index) => (
                    <li key={index}>{point}</li>
                  ))}
              </ul>

              <div className="batch-admin-actions">
                <button
                  type="button"
                  className="btn-icon cursor-pointer"
                  onClick={() => openEditModal(batch)}
                >
                  <FiEdit />
                </button>

                <button
                  type="button"
                  className="btn-icon btn-icon-danger cursor-pointer"
                  onClick={() => deleteBatch(batch._id)}
                >
                  <FiTrash2 />
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {modalMode === "add" ? "Add" : "Edit"} Batch
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
              <div className="admin-modal-body">
                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Batch Icon</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      value={form.icon}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          icon: e.target.value,
                        })
                      }
                      placeholder="🔥"
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Batch Title</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      value={form.title}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          title: e.target.value,
                        })
                      }
                      placeholder="Weight Loss & Fitness"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label>Batch Points</label>

                  <div className="features-input-list">
                    {form.points.map((point, index) => (
                      <div className="features-input-item" key={index}>
                        <input
                          type="text"
                          className="admin-form-control"
                          value={point}
                          onChange={(e) =>
                            handlePointChange(index, e.target.value)
                          }
                          placeholder={`Point #${index + 1}`}
                        />

                        {form.points.length > 1 && (
                          <button
                            type="button"
                            className="btn-icon btn-icon-danger feature-remove-btn cursor-pointer"
                            onClick={() => removePointInput(index)}
                          >
                            <FiX />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary add-point-btn cursor-pointer"
                      onClick={addPointInput}
                    >
                      <FiPlus /> Add Point
                    </button>
                  </div>
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
                  {modalMode === "add" ? "Save Batch" : "Update Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default BatchesTab;
