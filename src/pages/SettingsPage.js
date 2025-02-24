import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Switch from '@mui/material/Switch';
import emailjs from 'emailjs-com';
import firebase from "firebase/compat/app";
import "firebase/compat/database";
import firebaseConfig from "../config/firebaseConfig";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Function to format timestamps to YYYY-MM-DD
const formatTimestampToDate = (seconds, nanoseconds) => {
  const date = new Date(seconds * 1000 + nanoseconds / 1000000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Boolean function to determine if an exercise is not done
const NotDone = async (patientId, prescriptionDates) => {
  try {
    const db = firebase.database();
    const exercisesRef = db.ref('exercises');

    // Fetch exercises data for the matching patient
    const snapshot = await exercisesRef.orderByChild('userID').equalTo(patientId).once('value');
    const exercises = snapshot.val();

    if (exercises) {
      // Iterate through all exercises and check their timestamps
      for (const key in exercises) {
        const { timestamp } = exercises[key];
        const exerciseDate = formatTimestampToDate(timestamp.seconds, timestamp.nanoseconds);

        // Compare exercise dates to prescribed dates
        for (const prescribedDate of prescriptionDates) {
          if (exerciseDate === prescribedDate) {
            return false; // Exercise has been done on this date
          }
        }
      }
    }
  } catch (error) {
    console.error('Error checking exercises:', error);
  }

  return true; // Exercise has not been done on any of the prescribed dates
};

const SettingsPage = () => {
  const [serverMode, setServerMode] = useState(false);
  const [statusText, setStatusText] = useState('Server mode is OFF');
  const timerRef = useRef(null); 

  const toggleServerMode = () => {
    setServerMode((prev) => !prev);
  };

  useEffect(() => {
    if (!serverMode && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setStatusText('Server mode is OFF.');
    }

    if (serverMode) {
      setStatusText('Server mode is ON. Fetching orders and sending emails. STAY ON THIS PAGE');

      fetchAndSendEmails();

      timerRef.current = setInterval(() => {
        fetchAndSendEmails();
      }, 2 * 60 * 1000); 
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [serverMode]);

  const fetchAndSendEmails = async () => {
    if (!serverMode) return;

    try {
      const db = firebase.database();
      const prescriptionsRef = db.ref('prescriptions');
      const snapshot = await prescriptionsRef.once('value');
      const prescriptions = snapshot.val();

      if (prescriptions) {
        const currentDate = new Date().toISOString().split('T')[0];

        await Promise.all(Object.keys(prescriptions).map(async (key) => {
          const prescription = prescriptions[key];
          const { startDate, endDate, exerciseName, sets, reps, holdTime, daysOfWeek, email, patientId, dates } = prescription;

          console.log(`Processing prescription ${key}:`, { email, exerciseName, sets, reps, holdTime, daysOfWeek, dates });

          // Check if the exercise hasn't been done for any of the prescribed dates
          const shouldSendEmail = await NotDone(patientId, dates);

          if (currentDate >= startDate && currentDate <= endDate && shouldSendEmail) {
            const emailParams = {
              to_email: email,
              subject: 'Exercise Reminder',
              message: `This is a reminder to perform the exercises prescribed by your physical therapist: ${exerciseName}, ${sets} sets of ${reps} reps with ${holdTime} seconds hold time on ${daysOfWeek.join(', ')}.`,
            };

            try {
              console.log(`Email sent to: ${email}`); 
              // Uncomment and add keys to actually send email:
              // await emailjs.send('service_key', 'template_key', emailParams, 'userKey');
            } catch (emailError) {
              console.error('Error sending email:', JSON.stringify(emailError, null, 2));
            }
          }
        }));
      } else {
        console.log('No prescriptions found.');
      }
    } catch (error) {
      console.error('Error fetching prescriptions or sending email:', JSON.stringify(error, null, 2));
    }
  };

  return (
    <div>
      <Header />
      <h2 style={{ color: 'black' }}>Server Mode</h2>
      <Switch
        checked={serverMode}
        onChange={toggleServerMode}
        name="serverModeSwitch"
        inputProps={{ 'aria-label': 'server mode toggle' }}
      />
      <p style={{ color: 'black' }}>{statusText}</p>
    </div>
  );
};

export default SettingsPage;
