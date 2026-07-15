import React, { useState, useEffect, useCallback, useRef } from "react";
import toast from 'react-hot-toast';
import { whyChooseUsAPI, uploadToCloudinary } from "../../../api/dataAPI";
import "../../../style/Admin/WhyChooseUsTab.css";

function WhyChooseUsTab() {
  const fileInputRef = useRef(null);

  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [oldImage, setOldImage] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const loadItems = useCallback(async () => {
    try {
      const result = await whyChooseUsAPI.getAll();
      setItems(result || []);
    } catch (error) {
      console.error("Why Choose Us Load Error:", error);
      toast.error("Failed to load cards");
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setEditingId(null);
    setImagePreview("");
    setImageFile(null);
    setOldImage("");
    setShowForm(false);
    setFormData({ title: "", description: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const saveItem = async (e) => {
    e.preventDefault();
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
        toast.error("Please upload an image for the card");
        setLoading(false);
        return;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        image: finalImageUrl,
      };

      if (editingId) {
        await whyChooseUsAPI.update(editingId, payload);
        toast.success("Card updated successfully");
      } else {
        await whyChooseUsAPI.create(payload);
        toast.success("Card added successfully");
      }

      resetForm();
      loadItems();
    } catch (error) {
      console.error("Why Choose Us Save Error:", error);
      toast.error(error.message || "Failed to save card");
    } finally {
      setLoading(false);
    }
  };

  const editItem = (item) => {
    setEditingId(item._id);
    setImagePreview(item.image);
    setOldImage(item.image || "");
    setImageFile(null);
    setFormData({
      title: item.title || "",
      description: item.description || "",
    });
    setShowForm(true);
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this card?")) return;
    try {
      await whyChooseUsAPI.delete(id);
      toast.success("Card deleted successfully");
      loadItems();
    } catch (error) {
      console.error("Why Choose Us Delete Error:", error);
      toast.error("Failed to delete card");
    }
  };

  return (
    <div className="admin-content-window select-none">
      <div className="section-title-row">
        <h2>Why Choose Us Cards</h2>
        <span>{items.length} Items</span>
        <button type="button" className="why-add-btn cursor-pointer" onClick={openAddForm}>
          + Add Card
        </button>
      </div>

      <div className="why-list">
        {items.map((item) => (
          <div className="why-card-admin" key={item._id}>
            <div className="why-card-image">
              {item.image ? (
                <img src={item.image} alt={item.title} />
              ) : (
                <span>🖼️</span>
              )}
            </div>

            <div className="why-card-content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </div>

            <div className="why-card-buttons">
              <button type="button" className="cursor-pointer" onClick={() => editItem(item)}>
                Edit
              </button>
              <button type="button" className="cursor-pointer" onClick={() => deleteItem(item._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <div className="admin-empty-box">
            <h3>No Cards Yet</h3>
            <p>Click "Add Card" to create your first Why Choose Us card.</p>
          </div>
        )}
      </div>

      {showForm && (
        <div className="why-form-overlay animate-fade-in" onClick={resetForm}>
          <form
            className="why-form"
            onSubmit={saveItem}
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" className="why-form-close cursor-pointer" onClick={resetForm}>
              ×
            </button>

            <div className="why-form-title">
              <h3>{editingId ? "Update Feature Card" : "Add New Feature Card"}</h3>
              <p>Upload image, add title, and description for the website card.</p>
            </div>

            <div className="form-group">
              <label>Card Image</label>
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
              <div className="why-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}

            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Expert Trainers"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write card description"
                rows="4"
                required
              />
            </div>

            <div className="why-actions">
              <button type="submit" className="why-save-btn cursor-pointer" disabled={loading}>
                {loading ? "Saving..." : editingId ? "Update Card" : "Save Card"}
              </button>
              <button type="button" className="why-cancel-btn cursor-pointer" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default WhyChooseUsTab;
