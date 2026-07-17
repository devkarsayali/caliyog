import React, { useEffect, useState, useCallback } from "react";
import toast from 'react-hot-toast';
import { aboutAPI, uploadToCloudinary } from "../../../api/dataAPI";
import "../../../style/Admin/AboutTab.css";

function AboutTab() {
  const [formData, setFormData] = useState({
    _id: "",
    title: "",
    subtitle: "",
    description: "",
    mission: "",
    vision: "",
  });

  const [image1File, setImage1File] = useState(null);
  const [image2File, setImage2File] = useState(null);
  const [oldImage1, setOldImage1] = useState("");
  const [oldImage2, setOldImage2] = useState("");

  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const loadAbout = useCallback(async () => {
    try {
      const documents = await aboutAPI.getAll();
      if (documents && documents.length > 0) {
        const data = documents[0];
        setFormData({
          _id: data._id || "",
          title: data.title || "",
          subtitle: data.subtitle || "",
          description: data.description || "",
          mission: data.mission || "",
          vision: data.vision || "",
        });
        setOldImage1(data.image1 || "");
        setOldImage2(data.image2 || "");
      }
    } catch (error) {
      console.error("About Load Error:", error);
      toast.error("Failed to load about data");
    }
  }, []);

  useEffect(() => {
    loadAbout();
  }, [loadAbout]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const compressImage = (file, maxWidth = 1200, quality = 0.7) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                // Keep same filename
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                reject(new Error("Canvas to Blob conversion failed"));
              }
            },
            file.type,
            quality
          );
        };
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImage1Change = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setCompressing(true);
      const compressedFile = await compressImage(file);
      setImage1File(compressedFile);
    } catch (error) {
      toast.error(error.message || "Image 1 compression failed");
      e.target.value = "";
      setImage1File(null);
    } finally {
      setCompressing(false);
    }
  };

  const handleImage2Change = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setCompressing(true);
      const compressedFile = await compressImage(file);
      setImage2File(compressedFile);
    } catch (error) {
      toast.error(error.message || "Image 2 compression failed");
      e.target.value = "";
      setImage2File(null);
    } finally {
      setCompressing(false);
    }
  };

  const saveAbout = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let finalImg1 = oldImage1;
      let finalImg2 = oldImage2;

      // Upload files to Firebase Storage first if changed
      if (image1File) {
        const url1 = await uploadToCloudinary(image1File);
        if (url1) finalImg1 = url1;
      }

      if (image2File) {
        const url2 = await uploadToCloudinary(image2File);
        if (url2) finalImg2 = url2;
      }

      const payload = {
        title: formData.title,
        subtitle: formData.subtitle,
        description: formData.description,
        mission: formData.mission,
        vision: formData.vision,
        image1: finalImg1,
        image2: finalImg2,
      };

      if (formData._id) {
        await aboutAPI.update(formData._id, payload);
      } else {
        await aboutAPI.create(payload);
      }

      toast.success("About section updated successfully!");
      setImage1File(null);
      setImage2File(null);
      loadAbout();
    } catch (error) {
      console.error("About Save Error:", error);
      toast.error(error.message || "Failed to save about section");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="about-tab">
      <form className="about-form" onSubmit={saveAbout}>
        <div className="form-grid">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Welcome to CaliYog"
            />
          </div>

          <div className="form-group">
            <label>Subtitle</label>
            <input
              type="text"
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              placeholder="With Strength and Grace"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Write about your fitness club"
            rows="5"
          />
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Mission</label>
            <textarea
              name="mission"
              value={formData.mission}
              onChange={handleChange}
              placeholder="Enter mission"
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Vision</label>
            <textarea
              name="vision"
              value={formData.vision}
              onChange={handleChange}
              placeholder="Enter vision"
              rows="4"
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>About Image 1</label>
            <input type="file" accept="image/*" className="file-input" onChange={handleImage1Change} />
            <small>Large images will be compressed automatically</small>
          </div>

          <div className="form-group">
            <label>About Image 2</label>
            <input type="file" accept="image/*" className="file-input" onChange={handleImage2Change} />
            <small>Large images will be compressed automatically</small>
          </div>
        </div>

        <div className="preview-box">
          {(image1File || oldImage1) && (
            <img
              src={image1File ? URL.createObjectURL(image1File) : oldImage1}
              alt="About Preview 1"
            />
          )}

          {(image2File || oldImage2) && (
            <img
              src={image2File ? URL.createObjectURL(image2File) : oldImage2}
              alt="About Preview 2"
            />
          )}
        </div>

        <button
          className="save-about-btn cursor-pointer"
          type="submit"
          disabled={loading || compressing}
        >
          {compressing
            ? "Compressing Image..."
            : loading
              ? "Saving..."
              : "Save About Section"}
        </button>
      </form>
    </div>
  );
}

export default AboutTab;
