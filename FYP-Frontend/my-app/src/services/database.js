import { ref, set, push, onValue, off } from 'firebase/database';
import { db } from '../config/firebase';

// Add new patient data
export const addPatientData = async (patientData) => {
  try {
    const newPatientRef = push(ref(db, 'patients'));
    await set(newPatientRef, patientData);
    return true;
  } catch (error) {
    console.error('Error adding patient:', error);
    return false;
  }
};

// Subscribe to patient data
export const subscribeToPatients = (callback) => {
  const patientsRef = ref(db, 'patients');
  onValue(patientsRef, (snapshot) => {
    const data = [];
    snapshot.forEach((childSnapshot) => {
      data.push(childSnapshot.val());
    });
    callback(data);
  });

  // Return unsubscribe function
  return () => off(patientsRef);
};

