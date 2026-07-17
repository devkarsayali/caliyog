import React, { useState, useEffect, useCallback, useRef } from "react";
import toast from 'react-hot-toast';
import { transformationsAPI, uploadToCloudinary } from "../../../api/dataAPI";
import "../../../style/Admin/TransformationsTab.css";

function TransformationsTab({ action, onActionHandled }) {
  const fileInputRef = useRef(null);

  const [transformations, setTransformations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [oldImage, setOldImage] = useState("");
  const [loading, setLoading] = useState(false);

  const loadTransformations = useCallback(async () => {
    try {
      const data = await transformationsAPI.getAll();
      setTransformations(data || []);
    } catch (error) {
      console.error("Transformations Load Error:", error);
      toast.error("Failed to load transformations");
    }
  }, []);

  useEffect(() => {
    loadTransformations();
  }, [loadTransformations]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large! Max 5MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageFile(file);
    };
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setImagePreview("");
    setImageFile(null);
    setOldImage("");
    setShowForm(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  useEffect(() => {
    if (action === "add") {
      openAddForm();
      if (onActionHandled) onActionHandled();
    }
  }, [action, onActionHandled]);

  const saveTransformation = async (e) => {
    e.preventDefault();

    if (!editingId && !imageFile) {
      toast.error("Please select transformation image");
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = oldImage;

      if (imageFile) {
        const uploadedUrl = await uploadToCloudinary(imageFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      }

      if (!finalImageUrl) {
        toast.error("Please upload an image");
        setLoading(false);
        return;
      }

      const payload = {
        name,
        image: finalImageUrl,
      };

      if (editingId) {
        await transformationsAPI.update(editingId, payload);
        toast.success("Transformation updated successfully");
      } else {
        await transformationsAPI.create(payload);
        toast.success("Transformation added successfully");
      }

      resetForm();
      loadTransformations();
    } catch (error) {
      console.error("Transformation Save Error:", error);
      toast.error(error.message || "Failed to save transformation");
    } finally {
      setLoading(false);
    }
  };

  const editTransformation = (item) => {
    setEditingId(item._id);
    setName(item.name || "");
    setImagePreview(item.image);
    setOldImage(item.image || "");
    setImageFile(null);
    setShowForm(true);
  };

  const deleteTransformation = async (id) => {
    if (!window.confirm("Delete this transformation?")) return;

    try {
      await transformationsAPI.delete(id);
      toast.success("Transformation deleted successfully");
      loadTransformations();
    } catch (error) {
      console.error("Transformation Delete Error:", error);
      toast.error("Failed to delete transformation");
    }
  };

  return (
    <div className="admin-content-window select-none">
      <div className="section-title-row">
        <h2>Transformations</h2>
        <span>{transformations.length} Items</span>
        <button
          type="button"
          className="transformation-add-btn cursor-pointer"
          onClick={openAddForm}
        >
          + Add Transformation
        </button>
      </div>

      <div className="transformation-list">
        {transformations.map((item) => (
          <div className="transformation-card-admin" key={item._id}>
            <img src={item.image} alt={item.name} />
            <h3>{item.name}</h3>
            <div className="transformation-card-buttons">
              <button type="button" className="cursor-pointer" onClick={() => editTransformation(item)}>
                Edit
              </button>
              <button
                type="button"
                className="cursor-pointer"
                onClick={() => deleteTransformation(item._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}

        {transformations.length === 0 && (
          <div className="admin-empty-box">
            <h3>No Transformations Yet</h3>
            <p>Click "Add Transformation" to upload your first one.</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="transformation-form-overlay animate-fade-in" onClick={resetForm}>
          <form
            className="transformation-form"
            onSubmit={saveTransformation}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="transformation-form-close cursor-pointer"
              onClick={resetForm}
            >
              ×
            </button>

            <div className="transformation-form-title">
              <h3>
                {editingId ? "Update Transformation" : "Add Transformation"}
              </h3>
              <p>Upload transformation image and add a title/name.</p>
            </div>

            <div className="form-group">
              <label>Transformation Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Transformation 1"
                required
              />
            </div>

            <div className="form-group">
              <label>Transformation Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="file-input"
                onChange={handleImageChange}
              />
              <small>Max 5MB. Image will be uploaded to Firebase Storage.</small>
            </div>

            {imagePreview && (
              <div className="transformation-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}

            <div className="transformation-actions">
              <button
                type="submit"
                className="transformation-save-btn cursor-pointer"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update"
                  : "Save"}
              </button>

              <button
                type="button"
                className="transformation-cancel-btn cursor-pointer"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default TransformationsTab;
