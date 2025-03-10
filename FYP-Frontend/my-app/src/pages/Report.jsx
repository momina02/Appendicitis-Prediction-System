import React from "react";
import { useLocation } from "react-router-dom";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import "./Report.css";

const Report = () => {
  const { state } = useLocation();
  if (!state) {
    return <div>No report data available. Please go back and generate a report.</div>;
  }
  
  // Data can come either from Quick test (formData) or Ultrasound (previewUrl)
  const { formData, previewUrl, prediction, description } = state;

  const handleDownload = () => {
    const reportElement = document.getElementById("report-content");
    html2canvas(reportElement, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const mmPerPx = 0.264583; 
  
      // Calculate the custom PDF dimensions in mm
      const pdfWidth = canvasWidth * mmPerPx;
      const pdfHeight = canvasHeight * mmPerPx;
  
      // Create jsPDF instance with a custom page size that fits the entire content
      const pdf = new jsPDF("p", "mm", [pdfWidth, pdfHeight]);
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("Report.pdf");
    });
  };

// ####################################################################################################

  const handleEmailShare = () => {
    const reportElement = document.getElementById("report-content");
    if (!reportElement) return;
  
    const reportText = reportElement.innerText; // To get plain text from report
    const subject = encodeURIComponent("Your Diagnostic Report");
    const body = encodeURIComponent(`Here is your diagnostic report:\n\n${reportText}`);
  
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

// ####################################################################################################

  return (
    <div className="report-container">
      <div id="report-content" className="report-content">
        <div className="report-header">
          <h1 className="report-title">Diagnostic Report</h1>
          <p className="report-date">Date: {new Date().toLocaleDateString()}</p>
        </div>
        <section className="report-intro">
          <h2>Introduction</h2>
          <p>
            This diagnostic report provides a comprehensive analysis based on the data you submitted. The report is designed to give an overview of your reported symptoms, the underlying methodology used to generate a preliminary diagnosis, and the resulting findings.
          </p>
        </section>
        {previewUrl && (
          <div className="report-image-container">
            <img src={previewUrl} alt="Ultrasound" className="report-image" />
          </div>
        )}
        <section className="report-methodology">
          <h2>Methodology</h2>
          <p>
          Our diagnostic process integrates your self-reported symptoms or the ultrasound imaging data. The data is processed using a combination of validated clinical criteria and machine learning algorithms that assess potential markers associated with conditions such as appendicitis. While these techniques are rigorously tested, the results are intended as an initial screening rather than a definitive diagnosis.
          </p>
        </section>
        <section className="report-findings">
          <h2>Findings</h2>
          <p>
            <strong>Prediction:</strong>{" "}
            <span className={prediction === "Positive" ? "positive" : "negative"}>
              {prediction}
            </span>
          </p>
          <p>{description}</p>
        </section>
        {formData && (
          <section className="report-user-data">
            <h2>User Data Summary</h2>
            <ul>
              {Object.entries(formData).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> {value}
                </li>
              ))}
            </ul>
          </section>
        )}
        <section className="report-disclaimer">
          <h2>Disclaimer</h2>
          <p>
            This report is provided for informational purposes only. It is not intended to replace professional medical advice, diagnosis, or treatment. If you have any concerns about your health, please consult a recommended healthcare professional.
          </p>
        </section>
      </div>
      <button onClick={handleDownload} className="download-button">
        Download Report
      </button>
      <button onClick={handleEmailShare} className="share-button">
        Share via Email
      </button>

    </div>
  );
};

export default Report;
