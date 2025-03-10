import React, { useState, useEffect, useMemo } from "react";


import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

import { Pie, Doughnut, Bar } from "react-chartjs-2";
import "./Stats.css";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function generateBlueShades(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
    const lightness = 60 - i * (40 / (count || 1));
    colors.push(`hsl(210, 70%, ${lightness}%)`);
  }
  return colors;
}

const Stats = () => {
  const [data, setData] = useState(null);

  // Chart states
  const [overallDiagnosisData, setOverallDiagnosisData] = useState(null);
  const [appendicitisGenderData, setAppendicitisGenderData] = useState(null);
  const [feverData, setFeverData] = useState(null);
  const [nauseaMigratoryData, setNauseaMigratoryData] = useState(null);
  const [nestedDonutData, setNestedDonutData] = useState(null);
  const [painData, setPainData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch symptom data from Firestore "quick_tests" collection
        const querySnapshot = await getDocs(collection(db, "quick_tests"));
        const firebaseData = [];
        querySnapshot.forEach((doc) => {
          firebaseData.push({ id: doc.id, ...doc.data() });
        });
        setData(firebaseData);

        // Standardize/normalize data using the lowercase 'diagnosis' field
        const standardizedData = firebaseData.map((row) => ({
          ...row,
          // Create a capitalized version if needed, but use the lowercase version for logic
          Diagnosis: row.diagnosis ? String(row.diagnosis).trim() : "",
          diagnosis: row.diagnosis ? String(row.diagnosis).toLowerCase().trim() : "",
          Sex: row.Sex ? String(row.Sex).trim() : "",
          Fever: row.Fever ? String(row.Fever).toLowerCase().trim() : "",
          Nausea: row.Nausea ? String(row.Nausea).toLowerCase().trim() : "",
          MigratoryPain: row.MigratoryPain ? String(row.MigratoryPain).toLowerCase().trim() : "",
          IpsilateralReboundTenderness: row.IpsilateralReboundTenderness
            ? String(row.IpsilateralReboundTenderness).toLowerCase().trim()
            : "",
          ContralateralReboundTenderness: row.ContralateralReboundTenderness
            ? String(row.ContralateralReboundTenderness).toLowerCase().trim()
            : "",
          LowerRightAbdPain: row.LowerRightAbdPain
            ? String(row.LowerRightAbdPain).toLowerCase().trim()
            : "",
          CoughingPain: row.CoughingPain
            ? String(row.CoughingPain).toLowerCase().trim()
            : "",
        }));

        // 1) Overall Diagnosis Distribution (Pie Chart)
        const diagnosisCounts = {};
        standardizedData.forEach((row) => {
          if (row.diagnosis) {
            diagnosisCounts[row.diagnosis] = (diagnosisCounts[row.diagnosis] || 0) + 1;
          }
        });
        const diagLabels = Object.keys(diagnosisCounts);
        const diagValues = Object.values(diagnosisCounts);
        const diagColors = generateBlueShades(diagLabels.length);

        setOverallDiagnosisData({
          labels: diagLabels,
          datasets: [
            {
              data: diagValues,
              backgroundColor: diagColors,
              borderWidth: 1,
            },
          ],
        });

        // 2) Gender Distribution in Appendicitis Cases (Doughnut Chart)
        const appendicitisData = standardizedData.filter(
          (row) => row.diagnosis === "appendicitis"
        );
        const genderCounts = {};
        appendicitisData.forEach((row) => {
          if (row.Sex) {
            genderCounts[row.Sex] = (genderCounts[row.Sex] || 0) + 1;
          }
        });
        const genderLabels = Object.keys(genderCounts);
        const genderValues = Object.values(genderCounts);
        const genderColors = generateBlueShades(genderLabels.length);

        setAppendicitisGenderData({
          labels: genderLabels,
          datasets: [
            {
              data: genderValues,
              backgroundColor: genderColors,
              borderWidth: 1,
            },
          ],
        });

        // 3) Fever vs. Diagnosis (Horizontal Bar Chart)
        const feverCategories = ["yes", "no"];
        const allDiagnoses = Object.keys(diagnosisCounts);
        const feverCounts = {};
        allDiagnoses.forEach((diag) => {
          feverCounts[diag] = { yes: 0, no: 0 };
        });
        standardizedData.forEach((row) => {
          if (row.diagnosis && feverCategories.includes(row.Fever)) {
            feverCounts[row.diagnosis][row.Fever] += 1;
          }
        });
        const feverYesData = allDiagnoses.map((diag) => feverCounts[diag].yes);
        const feverNoData = allDiagnoses.map((diag) => feverCounts[diag].no);

        setFeverData({
          labels: allDiagnoses,
          datasets: [
            {
              label: "Yes",
              data: feverYesData,
              backgroundColor: "hsl(210, 70%, 50%)",
            },
            {
              label: "No",
              data: feverNoData,
              backgroundColor: "hsl(210, 70%, 70%)",
            },
          ],
        });

        // 4) Diagnosis vs. Nausea & Migratory Pain (Grouped Bar)
        const diagSet = new Set(standardizedData.map((row) => row.diagnosis));
        diagSet.delete("");
        const sortedDiags = Array.from(diagSet).sort();

        const nauseaCounts = {};
        const migratoryCounts = {};
        sortedDiags.forEach((diag) => {
          nauseaCounts[diag] = 0;
          migratoryCounts[diag] = 0;
        });
        standardizedData.forEach((row) => {
          if (row.diagnosis) {
            if (row.Nausea === "yes") {
              nauseaCounts[row.diagnosis] += 1;
            }
            if (row.MigratoryPain === "yes") {
              migratoryCounts[row.diagnosis] += 1;
            }
          }
        });

        setNauseaMigratoryData({
          labels: sortedDiags,
          datasets: [
            {
              label: "Nausea",
              data: sortedDiags.map((diag) => nauseaCounts[diag]),
              backgroundColor: "hsl(210, 70%, 50%)",
            },
            {
              label: "Migratory Pain",
              data: sortedDiags.map((diag) => migratoryCounts[diag]),
              backgroundColor: "hsl(210, 70%, 70%)",
            },
          ],
        });

        // 5) Diagnosis, Ipsilateral & Contralateral Rebound Tenderness (Nested Donut)
        const ipsiCounts = {};
        const contraCounts = {};
        standardizedData.forEach((row) => {
          if (row.diagnosis) {
            const ipsi = row.IpsilateralReboundTenderness || "n/a";
            ipsiCounts[ipsi] = (ipsiCounts[ipsi] || 0) + 1;
            const contra = row.ContralateralReboundTenderness || "n/a";
            contraCounts[contra] = (contraCounts[contra] || 0) + 1;
          }
        });

        const outerLabels = diagLabels;
        const outerSizes = diagValues;
        const middleLabels = Object.keys(ipsiCounts);
        const middleSizes = Object.values(ipsiCounts);
        const innerLabels = Object.keys(contraCounts);
        const innerSizes = Object.values(contraCounts);

        const outerColors = generateBlueShades(outerLabels.length);
        const middleColors = generateBlueShades(middleLabels.length);
        const innerColors = generateBlueShades(innerLabels.length);

        setNestedDonutData({
          labels: [
            ...outerLabels,
            ...middleLabels.map((label) => `Ipsi: ${label}`),
            ...innerLabels.map((label) => `Contra: ${label}`),
          ],
          datasets: [
            {
              label: "Diagnosis",
              data: [
                ...outerSizes,
                ...new Array(middleSizes.length + innerSizes.length).fill(0),
              ],
              backgroundColor: outerColors,
            },
            {
              label: "Ipsilateral Rebound",
              data: [
                ...new Array(outerSizes.length).fill(0),
                ...middleSizes,
                ...new Array(innerSizes.length).fill(0),
              ],
              backgroundColor: middleColors,
            },
            {
              label: "Contralateral Rebound",
              data: [
                ...new Array(outerSizes.length + middleSizes.length).fill(0),
                ...innerSizes,
              ],
              backgroundColor: innerColors,
            },
          ],
        });

        // 6) Diagnosis vs. Lower Right Abdominal & Coughing Pain (Grouped Bar)
        const abdCounts = {};
        const coughCounts = {};
        sortedDiags.forEach((diag) => {
          abdCounts[diag] = 0;
          coughCounts[diag] = 0;
        });
        standardizedData.forEach((row) => {
          if (row.diagnosis) {
            if (row.LowerRightAbdPain === "yes") {
              abdCounts[row.diagnosis] += 1;
            }
            if (row.CoughingPain === "yes") {
              coughCounts[row.diagnosis] += 1;
            }
          }
        });
        setPainData({
          labels: sortedDiags,
          datasets: [
            {
              label: "Lower Right Abdominal Pain",
              data: sortedDiags.map((diag) => abdCounts[diag]),
              backgroundColor: "hsl(210, 70%, 50%)",
            },
            {
              label: "Coughing Pain",
              data: sortedDiags.map((diag) => coughCounts[diag]),
              backgroundColor: "hsl(210, 70%, 70%)",
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    };

    fetchData();
  }, []);


  const pieOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const value = context.raw;
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${value} (${percentage}%)`;
            },
          },
        },
        legend: {
          position: "bottom",
          labels: { boxWidth: 12, padding: 15 },
        },
      },
    }),
    []
  );

  const barOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          beginAtZero: true,
          offset: false,
        },
        y: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 12, padding: 15 },
        },
      },
    }),
    []
  );

  const horizontalBarOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: "y",
      scales: {
        y: {
          beginAtZero: true,
          offset: false,
        },
        x: {
          beginAtZero: true,
        },
      },
      plugins: {
        legend: {
          position: "bottom",
          labels: { boxWidth: 12, padding: 15 },
        },
      },
    }),
    []
  );

  return (
    <div className="stats-container">
      <h1 className="stats-title">Appendicitis Stats Dashboard</h1>

      <div className="chart-grid">
        {/* Overall Diagnosis Distribution (Pie) */}
        {overallDiagnosisData && (
          <div className="chart-card">
            <h2 className="graph-title">Overall Diagnosis Distribution</h2>
            <div style={{ position: "relative", height: "300px" }}>
              <Pie data={overallDiagnosisData} options={pieOptions} />
            </div>
          </div>
        )}

        {/* Gender Distribution (Appendicitis) (Doughnut) */}
        {appendicitisGenderData && (
          <div className="chart-card">
            <h2 className="graph-title">
              Gender Distribution in Appendicitis Cases
            </h2>
            <div style={{ position: "relative", height: "300px" }}>
              <Doughnut data={appendicitisGenderData} options={pieOptions} />
            </div>
          </div>
        )}

        {/* Fever vs. Diagnosis (Horizontal Bar) */}
        {feverData && (
          <div className="chart-card">
            <h2 className="graph-title">Fever vs. Diagnosis</h2>
            <div style={{ position: "relative", height: "300px" }}>
              <Bar data={feverData} options={horizontalBarOptions} />
            </div>
          </div>
        )}

        {/* Diagnosis vs. Nausea & Migratory Pain (Grouped Bar) */}
        {nauseaMigratoryData && (
          <div className="chart-card">
            <h2 className="graph-title">
              Diagnosis vs. Nausea & Migratory Pain
            </h2>
            <div style={{ position: "relative", height: "300px" }}>
              <Bar data={nauseaMigratoryData} options={barOptions} />
            </div>
          </div>
        )}

        {/* Nested Donut (Diagnosis + Rebound Tenderness) */}
        {nestedDonutData && (
          <div className="chart-card">
            <h2 className="graph-title">
              Diagnosis, Ipsilateral & Contralateral Rebound Tenderness
            </h2>
            <div style={{ position: "relative", height: "300px" }}>
              <Doughnut data={nestedDonutData} options={pieOptions} />
            </div>
          </div>
        )}

        {/* Diagnosis vs. Lower Right Abdominal & Coughing Pain (Grouped Bar) */}
        {painData && (
          <div className="chart-card">
            <h2 className="graph-title">
              Diagnosis vs. Lower Right Abdominal & Coughing Pain
            </h2>
            <div style={{ position: "relative", height: "300px" }}>
              <Bar data={painData} options={barOptions} />
            </div>
          </div>
        )}
      </div>

      {!data && (
        <div style={{ textAlign: "center", color: "#888", marginTop: "2rem" }}>
          <p>Loading data...</p>
          <div
            style={{
              margin: "0 auto",
              width: "40px",
              height: "40px",
              border: "4px solid #ccc",
              borderTopColor: "#333",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
        </div>
      )}

      <footer className="home-footer">
        <p>
          &copy; {new Date().getFullYear()} Appendicitis Prediction Dashboard.
          All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default Stats;
