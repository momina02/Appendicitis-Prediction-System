import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import "./Doctor.css";

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "doctors"));
        const doctorsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDoctors(doctorsList);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <div className="doc-doctors-container">
      <h2 className="doc-title">Recommended Doctors</h2>
      <div className="doc-doctors-list">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="doc-doctor-card">
            <h3 className="doc-doctor-name">{doctor.name}</h3>
            <p className="doc-p"><strong>Education:</strong> {doctor.education}</p>
            <p className="doc-p"><strong>Hospital:</strong> {doctor.hospital}</p>
            <p className="doc-p"><strong>Profession:</strong> {doctor.speciality}</p>
            <p className="doc-p"><strong>Contact:</strong> {doctor.contact}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Doctors;
