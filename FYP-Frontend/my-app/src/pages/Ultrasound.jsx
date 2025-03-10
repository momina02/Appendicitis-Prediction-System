import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Ultrasound.css";

const Ultrasound = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [description, setDescription] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(false);

  
  const predictAppendicitis = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        body: formData,
      });
      return await response.json();
    } catch (error) {
      console.error("Error during prediction:", error);
      return null;
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPrediction(null);
      setDescription("");
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!imageFile) {
      alert("Please select an ultrasound image to upload");
      return;
    }
    setLoading(true);
    const data = await predictAppendicitis(imageFile);
    setLoading(false);

    if (data) {
      
      const model1Pred = data.model1_predictions || [];
      const model2Pred = data.model2_predictions || [];
      
      
      const isPositive =
        model1Pred.some(cls => cls.toLowerCase().includes("appendix") || cls.toLowerCase().includes("appendicitis")) ||
        model2Pred.some(cls => cls.toLowerCase().includes("appendix") || cls.toLowerCase().includes("appendicitis"));

      const predictionResult = isPositive ? "Positive" : "Negative";

      setPrediction(predictionResult);
      setDescription(
        predictionResult === "Positive"
          ? "Our analysis indicates signs of appendicitis. We highly recommend you to consult any one of our recommended healthcare professional. For further confirmation, feel free to take the Quick Test."
          : "No signs of appendicitis detected in your ultrasound. If you have symptoms including Fever, Pain in lower abdomen, or Counghing pain feel free to take our Quick Test or contact one of our recommended doctors."
      );
      setShowReportModal(true);
    } else {
      alert("Error during prediction. Please try again.");
    }
  };

  const handleReportResponse = (choice) => {
    setShowReportModal(false);
    if (choice === "yes") {
      
      navigate("/report", {
        state: {
          previewUrl,
          prediction,
          description,
        },
      });
    }
  };

  return (
    <div className="ultrasound-container">
      <h1 className="ultrasound-heading">Ultrasound Diagnosis</h1>

      <div className="upload-box" onClick={() => fileInputRef.current?.click()}>
        {previewUrl ? (
          <img src={previewUrl} alt="Ultrasound preview" className="upload-preview" />
        ) : (
          <div className="upload-box-content">
            <div className="upload-box-plus-sign">+</div>
            <div className="upload-box-text">Click to upload ultrasound image</div>
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden-input"
        />
      </div>

      <div className="button-container">
        <button onClick={handleUpload} className="analyze-button">
          {loading ? "Analyzing..." : "Upload & Analyze"}
        </button>
      </div>

      {prediction && (
        <div className="prediction-result">
          <h2 className="prediction-heading">
            Prediction:{" "}
            <span style={{ color: prediction === "Positive" ? "#d9534f" : "#5cb85c" }}>
              {prediction}
            </span>
          </h2>
          <p className="prediction-description">{description}</p>
        </div>
      )}

      {showReportModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-heading">Download Report</h3>
            <p className="modal-text">Would you like to download the report?</p>
            <div className="modal-buttons">
              <button onClick={() => handleReportResponse("no")} className="modal-button modal-button-no">
                No
              </button>
              <button onClick={() => handleReportResponse("yes")} className="modal-button modal-button-yes">
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="home-footer">
        <p>&copy; {new Date().getFullYear()} Appendicitis Prediction Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Ultrasound;
