import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref, onValue } from 'firebase/database';
import React, { createContext, useContext, useState, useEffect } from 'react';
import firebaseConfig from './config/firebaseConfig';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const RoleContext = createContext();

export const RoleProvider = ({ children }) => {
   const [loading, setLoading] = useState(false);
   const [user, setUser] = useState(null);
   const [alert, setAlert] = useState({
      open: false,
      message: "",
      type: "success",
   });

   const [patientlist, setPatientlist] = useState([]);
   const [patients, setPatients] = useState([]); 

   useEffect(() => {
      if (user) {
         const patientRef = ref(db, `patientlist/${user.uid}`);

         const unsubscribe = onValue(patientRef, (snapshot) => {
            if (snapshot.exists()) {
               setPatientlist(snapshot.val().patients || []);
            } else {
               console.log("No Items in Watchlist");
            }
         }, (error) => {
            console.error("Error in onValue:", error);
         });

         return () => {
            unsubscribe();
         };
      }
   }, [user]);

   useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
         if (currentUser) {
            setUser(currentUser);
         } else {
            setUser(null);
         }
      });

      return () => {
         unsubscribe();
      };
   }, []);

   const fetchPatients = async () => {
      setLoading(true);
      try {
         const data = await placeholderFunction();
         setPatients(data);
      } catch (error) {
         console.error("Error fetching patients:", error);
         setAlert({
            open: true,
            message: "Failed to fetch patients",
            type: "error",
         });
      } finally {
         setLoading(false);
      }
   };

   async function placeholderFunction() {
      return new Promise((resolve) => {
         resolve('Placeholder data');
      });
   }

   return (
      <RoleContext.Provider value={{ patients, loading, alert, setAlert, fetchPatients, user, patientlist }}>
         {children}
      </RoleContext.Provider>
   );
};

export default RoleContext;

export const useRoleState = () => {
   return useContext(RoleContext);
};
