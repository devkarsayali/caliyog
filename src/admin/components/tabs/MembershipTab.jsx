import React, { useState, useEffect, useCallback } from "react";
import { FiPlus, FiEdit, FiTrash2, FiX } from "react-icons/fi";
import toast from 'react-hot-toast';
import { membershipsAPI } from "../../../api/dataAPI";
import "../../../style/Admin/MembershipTab.css";

function MembershipTab() {
  const [memberships, setMemberships] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [editId, setEditId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    price: "",
    subtitle: "",
    features: [""],
    featured: false,
  });

  const loadData = useCallback(async () => {
    try {
      const data = await membershipsAPI.getAll();
      setMemberships(data || []);
    } catch (error) {
      console.error("Membership Load Error:", error);
      toast.error("Failed to load memberships");
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({
      title: "",
      price: "",
      subtitle: "",
      features: [""],
      featured: false,
    });
  };

  const openAddModal = () => {
    setModalMode("add");
    setEditId(null);
    setShowModal(true);
  };

  const openEditModal = (membership) => {
    setModalMode("edit");
    setEditId(membership._id);
    setForm({
      title: membership.title || "",
      price: membership.price || "",
      subtitle: membership.subtitle || "",
      features: Array.isArray(membership.features) && membership.features.length > 0 ? membership.features : [""],
      featured: membership.featured || false,
    });
    setShowModal(true);
  };

  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...form.features];
    updatedFeatures[index] = value;
    setForm({
      ...form,
      features: updatedFeatures,
    });
  };

  const addFeatureInput = () => {
    setForm({
      ...form,
      features: [...form.features, ""],
    });
  };

  const removeFeatureInput = (index) => {
    const updatedFeatures = form.features.filter((_, i) => i !== index);
    setForm({
      ...form,
      features: updatedFeatures.length > 0 ? updatedFeatures : [""],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanFeatures = form.features
      .map((feat) => feat.trim())
      .filter((feat) => feat !== "");

    if (!form.title.trim()) {
      toast.error("Please enter membership title");
      return;
    }

    if (!form.price.trim()) {
      toast.error("Please enter price");
      return;
    }

    if (!form.subtitle.trim()) {
      toast.error("Please enter subtitle");
      return;
    }

    const payload = {
      title: form.title.trim(),
      price: form.price.trim(),
      subtitle: form.subtitle.trim(),
      features: cleanFeatures,
      featured: form.featured,
    };

    try {
      if (modalMode === "add") {
        await membershipsAPI.create(payload);
        toast.success("Membership added successfully");
      } else {
        await membershipsAPI.update(editId, payload);
        toast.success("Membership updated successfully");
      }
      loadData();
      closeModal();
    } catch (error) {
      console.error("Membership Save Error:", error);
      toast.error("Failed to save membership");
    }
  };

  const deleteMembership = async (id) => {
    if (!window.confirm("Are you sure you want to delete this membership?")) return;

    try {
      await membershipsAPI.delete(id);
      toast.success("Membership deleted successfully");
      loadData();
    } catch (error) {
      console.error("Membership Delete Error:", error);
      toast.error("Failed to delete membership");
    }
  };

  return (
    <div className="admin-content-window select-none">
      <header className="admin-header">
        <button
          type="button"
          className="membership-add-btn cursor-pointer"
          onClick={openAddModal}
        >
          + Add Plan
        </button>
      </header>

      <div className="admin-cards-grid">
        {memberships.map((membership) => (
          <article className="admin-item-card" key={membership._id}>
            <div className="admin-item-content">
              <div className="admin-item-title">{membership.title}</div>
              
              <div className="admin-item-subtitle membership-price">
                {membership.price}
              </div>

              {membership.featured && (
                <span className="admin-badge admin-badge-replied membership-badge">
                  Featured Plan
                </span>
              )}

              <p className="membership-subtitle">{membership.subtitle}</p>

              <ul className="membership-feature-list">
                {membership.features?.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>

            <div className="admin-item-footer">
              <button
                type="button"
                className="btn-icon cursor-pointer"
                onClick={() => openEditModal(membership)}
              >
                <FiEdit />
              </button>

              <button
                type="button"
                className="btn-icon btn-icon-danger cursor-pointer"
                onClick={() => deleteMembership(membership._id)}
              >
                <FiTrash2 />
              </button>
            </div>
          </article>
        ))}

        {memberships.length === 0 && (
          <div className="admin-empty-box">
            No membership plans found. Click Add Plan.
          </div>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">
                {modalMode === "add" ? "Add" : "Edit"} Membership Plan
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
                <div className="admin-form-group">
                  <label>Plan Title</label>
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
                    placeholder="Yearly Membership"
                    required
                  />
                </div>

                <div className="admin-form-row">
                  <div className="admin-form-group">
                    <label>Pricing Rate</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      value={form.price}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          price: e.target.value,
                        })
                      }
                      placeholder="₹24,000"
                      required
                    />
                  </div>

                  <div className="admin-form-group">
                    <label>Subtitle / Caption</label>
                    <input
                      type="text"
                      className="admin-form-control"
                      value={form.subtitle}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          subtitle: e.target.value,
                        })
                      }
                      placeholder="Best Value Plan"
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          featured: e.target.checked,
                        })
                      }
                    />
                    Feature this card
                  </label>
                </div>

                <div className="admin-form-group">
                  <label>Included Features List</label>

                  <div className="features-input-list">
                    {form.features.map((feature, index) => (
                      <div className="features-input-item" key={index}>
                        <input
                          type="text"
                          className="admin-form-control"
                          value={feature}
                          onChange={(e) =>
                            handleFeatureChange(index, e.target.value)
                          }
                          placeholder={`Feature #${index + 1}`}
                          required
                        />

                        {form.features.length > 1 && (
                          <button
                            type="button"
                            className="btn-icon btn-icon-danger feature-remove-btn cursor-pointer"
                            onClick={() => removeFeatureInput(index)}
                          >
                            <FiX />
                          </button>
                        )}
                      </div>
                    ))}

                    <button
                      type="button"
                      className="admin-btn admin-btn-secondary add-feature-btn cursor-pointer"
                      onClick={addFeatureInput}
                    >
                      <FiPlus /> Add Plan Feature
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
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MembershipTab;
