import React from "react";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      {/* Header Section */}
      <header className="home-header">
        <h1>Appendicitis Prediction Dashboard</h1>
        <p>
          Your one-stop solution for appendicitis diagnosis, patient statistics,
          and personalized predictions.
        </p>
      </header>

      {/* About Appendicitis Section */}
      <section className="about-section">
        <h2>What is Appendicitis?</h2>
        <p>
          Appendicitis is an inflammation of the appendix, a small pouch connected
          to the large intestine. It can lead to severe abdominal pain and requires
          prompt medical attention. Our application helps predict appendicitis through
          ultrasound image analysis and a quick test based on a short Q/A, while also
          offering detailed patient statistics and downloadable reports.
        </p>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="feature-card">
          <h3>Stats</h3>
          <p>View up-to-date statistics and trends from appendicitis cases.</p>
        </div>
        <div className="feature-card">
          <h3>Ultrasound Prediction</h3>
          <p>
            Upload and analyze ultrasound images to predict the risk of appendicitis.
          </p>
        </div>
        <div className="feature-card">
          <h3>Quick Test Prediction</h3>
          <p>
            Answer a few questions to receive an immediate prediction based on your symptoms.
          </p>
        </div>
        <div className="feature-card">
          <h3>Downloadable Report</h3>
          <p>
            Generate and download a comprehensive report of your analysis and statistics.
          </p>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="home-footer">
        <p>&copy; {new Date().getFullYear()} Appendicitis Prediction Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
