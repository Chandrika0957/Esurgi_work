import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { getDatabase, ref, onValue } from 'firebase/database';
import Header from '../components/Header';
import './CalendarPage.css';

const CalendarPage = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [events, setEvents] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    const db = getDatabase();
    const usersRef = ref(db, 'users');
    
    const unsubscribe = onValue(usersRef, (snapshot) => {
      const users = snapshot.val();
      const patientsData = Object.entries(users)
        .filter(([key, user]) => user.userType.replace(/"/g, '') === 'PATIENT')
        .map(([key, user]) => ({ ...user, userID: key }));
      
      setPatients(patientsData);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = () => {
    if (selectedPatient) {
      fetchPatientEvents(selectedPatient.userID);
      setShowCalendar(true); 
    }
  };

  const fetchPatientEvents = (patientId) => {
    const db = getDatabase();
    const prescriptionsRef = ref(db, 'prescriptions');

    onValue(prescriptionsRef, (snapshot) => {
      const prescriptions = snapshot.val();
      const formattedEvents = [];

      Object.values(prescriptions).forEach((prescription) => {
        if (prescription.patientId === patientId) {
          const { exerciseName, sets, reps, holdTime, dates } = prescription;

          dates.forEach((date) => {
            formattedEvents.push({
               title: `${exerciseName}\n${sets} sets of ${reps} reps\nwith ${holdTime} sec hold time`,
               date: date
            });
          });
        }
      });

      setEvents(formattedEvents);
    });
  };

  const handleBack = () => {
    setShowCalendar(false);
    setSelectedPatient(null);
    setEvents([]); 
  };

  return (
    <>
      <Header />
      <div className="calendar-page">
        {!showCalendar ? (
          <>
            <h2 style={{ color: 'black', marginTop: '20px' }}> {}
              Choose a patient to display their calendar
            </h2>
            <select
              value={selectedPatient ? selectedPatient.userID : ''}
              onChange={(e) => {
                const selected = patients.find(patient => patient.userID === e.target.value);
                setSelectedPatient(selected);
              }}
              style={{ fontSize: '18px', padding: '10px', width: '300px', marginTop: '15px' }} 
            >
              <option value="" disabled>Select a patient</option>
              {patients.map((patient) => (
                <option key={patient.userID} value={patient.userID}>
                  {patient.firstName} {patient.lastName}
                </option>
              ))}
            </select>
            <br />
            <button
              onClick={handleSubmit}
              style={{ fontSize: '18px', padding: '10px', marginTop: '10px' }} 
            >
              Submit
            </button>
          </>
        ) : (
          <>
            <h1 style={{ textAlign: 'center', fontSize: '28px', marginBottom: '20px', color: 'black' }}>
              {selectedPatient.firstName} {selectedPatient.lastName}'s Calendar
            </h1>
            <button
              onClick={handleBack}
              style={{ fontSize: '18px', padding: '10px', marginBottom: '20px' }} 
            >
              Back
            </button>
            <FullCalendar
  plugins={[dayGridPlugin]}
  initialView="dayGridMonth"
  events={events}
  eventContent={(eventInfo) => {
    return (
      <>
        <b>{eventInfo.event.title.split('\n')[0]}</b>
        <br />
        <i>{eventInfo.event.title.split('\n')[1]}</i>
        <br />
        <i>{eventInfo.event.title.split('\n')[2]}</i>
      </>
    );
  }}
/>

          </>
        )}
      </div>
    </>
  );
};

export default CalendarPage;
