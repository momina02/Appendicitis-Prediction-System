import { db } from "../config/firebase"; 
import { collection, addDoc } from "firebase/firestore";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import "./Quick.css";

// Modal Component to Ask About the Report
const QuickModal = ({ handleReportResponse }) => {
  return ReactDOM.createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-heading">Get Report</h3>
        <p className="modal-text">Would you like to see your report now?</p>
        <div className="modal-buttons">
          <button
            onClick={() => handleReportResponse("no")}
            className="modal-button modal-button-no"
          >
            No
          </button>
          <button
            onClick={() => handleReportResponse("yes")}
            className="modal-button modal-button-yes"
          >
            Yes
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

const Quick = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    Sex: "",
    Fever: "",
    MigratoryPain: "",
    IpsilateralReboundTenderness: "",
    ContralateralReboundTenderness: "",
    LowerRightAbdPain: "",
    CoughingPain: "",
    Nausea: "",
    LossofAppetite: ""
  });
  const [showReportModal, setShowReportModal] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [description, setDescription] = useState("");

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Check if all fields are filled
    const unanswered = Object.values(formData).some((value) => value === "");
    if (unanswered) {
      alert("Please fill all the answers.");
      return;
    }
  
    try {
      // Save form data to Firestore
      await addDoc(collection(db, "symptoms"), formData);
      console.log("Symptoms saved to Firestore");
  
      // Send data to FastAPI backend for prediction
      const response = await fetch("http://localhost:8000/predict_quicktest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
  
      const result = await response.json();
      console.log("Diagnosis:", result.diagnosis);
  
      if (result.diagnosis === "Appendicitis") {
        setPrediction("Positive");
        setDescription("Our analysis indicates signs of appendicitis. We highly recommend you to consult any one of our recommended healthcare professional. For further confirmation, feel free to take the Quick Test.");
      } else {
        setPrediction("Negative");
        setDescription("No signs of appendicitis detected in your ultrasound. If you have symptoms including Fever, Pain in lower abdomen, or Counghing pain feel free to take our Quick Test or contact one of our recommended doctors.");
      }
  
      setShowReportModal(true);
    } catch (error) {
      console.error("Error submitting data:", error);
      alert("There was an error submitting your responses.");
    }  };
  
  

  // On "yes", navigate to the report page and pass state data
  const handleReportResponse = (choice) => {
    setShowReportModal(false);
    if (choice === "yes") {
      navigate("/report", { state: { formData, prediction, description } });
    }
  };

  return (
    <>
      <div className="questionnaire-container">
        <h2>Appendicitis Quick Test</h2>
        <form onSubmit={handleSubmit}>
          {/* Gender question */}
          {[
            { name: "Sex", label: "Please specify your gender." },
          ].map(({ name, label }) => (
            <div className="question" key={name}>
              <p>{label}</p>
              <div className="button-group">
                <button
                  type="button"
                  className={`yes-button ${formData[name] === "male" ? "selected" : ""}`}
                  onClick={() => handleChange(name, "male")}
                >
                  Male
                </button>
                <button
                  type="button"
                  className={`no-button ${formData[name] === "female" ? "selected" : ""}`}
                  onClick={() => handleChange(name, "female")}
                >
                  Female
                </button>
              </div>
            </div>
          ))}
          {/* Other questions */}
          {[
            { name: "Fever", label: "Are you experiencing any fever?" },
            { name: "MigratoryPain", label: "Have you noticed any pain that seems to move from one area to another?" },
            { name: "IpsilateralReboundTenderness", label: "When you press on your abdomen and then quickly release, do you feel a sudden increase of pain at the exact spot where you pressed?" },
            { name: "ContralateralReboundTenderness", label: "When you press on your abdomen and then quickly release, do you notice a sudden increase of pain on the opposite side from where you pressed?" },
            { name: "LowerRightAbdPain", label: "Are you experiencing pain in the lower right side of your abdomen?" },
            { name: "CoughingPain", label: "Does your pain worsen when you cough?" },
            { name: "Nausea", label: "Have you been feeling nauseous or experiencing an upset stomach?" },
            { name: "LossofAppetite", label: "Have you noticed any decrease in your appetite recently?" },
          ].map(({ name, label }) => (
            <div className="question" key={name}>
              <p>{label}</p>
              <div className="button-group">
                <button
                  type="button"
                  className={`yes-button ${formData[name] === "yes" ? "selected" : ""}`}
                  onClick={() => handleChange(name, "yes")}
                >
                  Yes
                </button>
                <button
                  type="button"
                  className={`no-button ${formData[name] === "no" ? "selected" : ""}`}
                  onClick={() => handleChange(name, "no")}
                >
                  No
                </button>
              </div>
            </div>
          ))}
          <button type="submit" className="submit-button">
            Submit
          </button>
        </form>

        {prediction && (
          <div className="prediction-result">
            <h2
              style={{ textAlign: "left", fontSize: "2.9rem", margin: 15 }}
              className="prediction-heading"
            >
              Prediction:{" "}
              <span style={{ color: prediction === "Positive" ? "#d9534f" : "#5cb85c" }}>
                {prediction}
              </span>
            </h2>
            <p className="prediction-description">{description}</p>
          </div>
        )}
      </div>

      {showReportModal && <QuickModal handleReportResponse={handleReportResponse} />}

      <div className="home-footer-p">
        <footer style={{ marginTop: "7%" }}>
          <p>
            &copy; {new Date().getFullYear()} Appendicitis Prediction Dashboard. All rights reserved.
          </p>
        </footer>
      </div>
    </>
  );
};

export default Quick;
