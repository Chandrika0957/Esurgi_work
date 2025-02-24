import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, push } from 'firebase/database';
import Header from '../components/Header';
import Select from 'react-select';
import cptCodes from '../data/cptCodes.json'; 
import diagnosisCodes from '../data/diagnosisCodes.json'; 

const CPT = () => {
   const [PTs, setPTs] = useState([]);
   const [patients, setPatients] = useState([]);
   const [formData, setFormData] = useState({
      therapist: '',
      patient: '',
      duration: '4',
      diagnosisCode: '',
      cptCode: ''
   });

   const db = getDatabase();

   useEffect(() => {
      const usersRef = ref(db, 'users');
      onValue(usersRef, (snapshot) => {
         const data = snapshot.val();
         const PTList = Object.entries(data)
            .filter(([key, user]) => user.userType.replace(/"/g, '') === 'PT')
            .map(([key, PT]) => ({ value: key, label: `${PT.firstName} ${PT.lastName}` }));
         const patientList = Object.entries(data)
            .filter(([key, user]) => user.userType.replace(/"/g, '') === 'PATIENT')
            .map(([key, patient]) => ({ value: key, label: `${patient.firstName} ${patient.lastName}` }));

         setPTs(PTList);
         setPatients(patientList);
      });
   }, [db]);

   const handleChange = (name, selectedOption) => {
      setFormData({
         ...formData,
         [name]: selectedOption ? selectedOption.value : ''
      });
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      const cptRef = ref(db, 'CPT');
      push(cptRef, formData).then(() => {
         alert('Data submitted successfully');
         setFormData({
            therapist: '',
            patient: '',
            duration: '4', 
            diagnosisCode: '',
            cptCode: ''
         });
      }).catch((error) => {
         console.error('Error submitting data: ', error);
      });
   };

   return (
      <>
         <Header />
         <h1 style={{ color: 'black', textAlign: 'center', marginBottom: '1rem' }}>Order Biostabilizer for Patient Home Use</h1>
         <form 
            onSubmit={handleSubmit} 
            style={{
               display: 'flex',
               flexDirection: 'column',
               gap: '1rem',
               maxWidth: '600px',
               margin: 'auto',
               padding: '2rem',
               backgroundColor: '#f9f9f9',
               borderRadius: '8px',
               boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
               color: 'black'
            }}
         >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: 'black' }}>Physical Therapist:</label>
               <Select
                  options={PTs}
                  value={PTs.find(pt => pt.value === formData.therapist) || null}
                  onChange={(selectedOption) => handleChange('therapist', selectedOption)}
                  placeholder="Select Physical Therapist"
                  isClearable
                  styles={{
                     control: (provided) => ({
                        ...provided,
                        backgroundColor: 'white',
                        color: 'black'
                     }),
                     singleValue: (provided) => ({
                        ...provided,
                        color: 'black'
                     })
                  }}
               />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: 'black' }}>Patient Name:</label>
               <Select
                  options={patients}
                  value={patients.find(patient => patient.value === formData.patient) || null}
                  onChange={(selectedOption) => handleChange('patient', selectedOption)}
                  placeholder="Select Patient"
                  isClearable
                  styles={{
                     control: (provided) => ({
                        ...provided,
                        backgroundColor: 'white',
                        color: 'black'
                     }),
                     singleValue: (provided) => ({
                        ...provided,
                        color: 'black'
                     })
                  }}
               />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: 'black' }}>Duration (weeks):</label>
               <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  onChange={(e) => handleChange('duration', { value: e.target.value })}
                  placeholder="Enter duration in weeks"
                  style={{
                     padding: '0.5rem',
                     borderRadius: '4px',
                     border: '1px solid #ddd',
                     color: 'black'
                  }}
                  required
               />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: 'black' }}>Diagnosis Code:</label>
               <Select
                  options={diagnosisCodes.map(code => ({ value: code.code, label: `${code.code} - ${code.name}` }))}
                  value={diagnosisCodes.map(code => ({ value: code.code, label: `${code.code} - ${code.name}` }))
                        .find(option => option.value === formData.diagnosisCode) || null}
                  onChange={(selectedOption) => handleChange('diagnosisCode', selectedOption)}
                  placeholder="Select Diagnosis Code"
                  isClearable
                  styles={{
                     control: (provided) => ({
                        ...provided,
                        backgroundColor: 'white',
                        color: 'black'
                     }),
                     singleValue: (provided) => ({
                        ...provided,
                        color: 'black'
                     })
                  }}
               />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
               <label style={{ marginBottom: '0.5rem', fontWeight: 'bold', color: 'black' }}>CPT Code:</label>
               <Select
                  options={cptCodes.map(code => ({ value: code.code, label: `${code.code} - ${code.description}` }))}
                  value={cptCodes.map(code => ({ value: code.code, label: `${code.code} - ${code.description}` }))
                        .find(option => option.value === formData.cptCode) || null}
                  onChange={(selectedOption) => handleChange('cptCode', selectedOption)}
                  placeholder="Select CPT Code"
                  isClearable
                  styles={{
                     control: (provided) => ({
                        ...provided,
                        backgroundColor: 'white',
                        color: 'black'
                     }),
                     singleValue: (provided) => ({
                        ...provided,
                        color: 'black'
                     })
                  }}
               />
            </div>

            <button 
               type="submit" 
               style={{
                  padding: '0.75rem',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  textAlign: 'center'
               }}
            >
               Submit
            </button>
         </form>
      </>
   );
};

export default CPT;
