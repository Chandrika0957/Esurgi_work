import React, { useEffect, useState } from 'react';
import { styled } from '@mui/material/styles';
import Drawer from '@mui/material/Drawer';
import { Avatar, Button, Typography, Alert } from '@mui/material';
import { useRoleState } from '../../PatientContext';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { ref, update } from 'firebase/database';
import { useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import firebaseConfig from '../../config/firebaseConfig';
import 'firebase/compat/database';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Styled components
const Container = styled('div')({
  width: 350,
  padding: 25,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  fontFamily: "monospace",
});

const Profile = styled('div')({
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
  height: "92%",
});

const Picture = styled(Avatar)({
  width: 100,
  height: 100,
  cursor: "pointer",
  backgroundColor: "rgb(0,113,115)",
  objectFit: "contain",
});

const LogoutButton = styled(Button)({
  height: "8%",
  width: "100%",
  backgroundColor: "rgb(0,113,115)",
  marginTop: 20,
});

const PatientList = styled('div')({
  flex: 1,
  width: "100%",
  backgroundColor: "grey",
  borderRadius: 10,
  padding: 15,
  paddingTop: 10,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 12,
  overflowY: "scroll",
});

const Patient = styled('div')({
  padding: 10,
  borderRadius: 5,
  color: "black",
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  boxShadow: "0 0 3px black",
  cursor: "pointer",
  transition: "background-color 0.3s ease, box-shadow 0.3s ease",
  '&:hover': {
    boxShadow: "0 0 8px rgba(0, 113, 115, 0.5)",
  },
});

const AvatarStyled = styled(Avatar)(({ theme }) => ({
  height: 38,
  width: 38,
  marginLeft: 15,
  cursor: "pointer",
  backgroundColor: "rgb(0,113,115)",
  border: "2px solid black",
}));

export default function UserSidebar() {
  const navigate = useNavigate();
  const [state, setState] = useState({ right: false });
  const { user, setAlert, patientlist } = useRoleState();
  const [patients, setPatients] = useState([]);
  const [error, setError] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const dbRef = firebase.database().ref('users');
        dbRef.on('value', (snapshot) => {
          const users = snapshot.val();
          const patientsData = Object.entries(users)
            .filter(([key, user]) => {
              const userType = user?.userType || '';
              return String(userType).replace(/\s/g, '') === 'PATIENT';
            })
            .map(([key, user]) => ({ ...user, userID: key }));
          setPatients(patientsData);
          setLoading(false);
        });
      } catch (error) {
        console.error("Error fetching patients: ", error);
      }
    };

    fetchPatients();
    const fetchPicture = async() => {
      try {
        const db = firebase.database();
        const usersRef = db.ref("users");
  
        const snapshot = await usersRef.once("value");
        const users = snapshot.val();
        const userData = users[user.uid];
        if (userData) {
          setProfilePictureUrl(userData?.profilePicture);
        } else {
          setError("User data not found");
        }
        setLoading(false);
      } catch (error) {
        setError("Error fetching user data");
        setLoading(false);
      }
    }
    
    fetchPicture();

    return () => {
      const dbRef = firebase.database().ref('users');
      dbRef.off();
    };
  }, []);

  const toggleDrawer = (anchor, open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };

  const handlePatientClick = (patient) => {
    navigate(`/patients/:id`);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setTimeout(() => {
      setSelectedPatient(null);
    }, 300);
  };

  const logout = () => {
    signOut(auth).then(() => {
      if (setAlert) {
        setAlert({
          open: true,
          type: "success",
          message: "You have logged out!",
        });
      }
      navigate('/');
    }).catch((error) => {
      if (setAlert) {
        setAlert({
          open: true,
          message: error.message,
          type: "error",
        });
      }
    });
  };

  return (
    <div>
      {['right'].map((anchor) => (
        <React.Fragment key={anchor}>
          <AvatarStyled
            onClick={toggleDrawer(anchor, true)}
            src={profilePictureUrl}
            alt={user.displayName || user.email}
          />
          <Drawer anchor={anchor} open={state[anchor]} onClose={toggleDrawer(anchor, false)}>
            <Container>
              <Profile>
                <Picture src={profilePictureUrl} alt={user.displayName || user.email} />
                <Typography
                  sx={{
                    width: "100%",
                    fontSize: 25,
                    textAlign: "center",
                    fontWeight: "bolder",
                    wordWrap: "break-word",
                  }}
                >
                  {user.displayName || user.email}
                </Typography>
                <PatientList>
                  <Typography sx={{ fontSize: 15, textShadow: "0 0 5px black" }}>
                    Patient List
                  </Typography>
                  {loading ? (
                    <Typography>Loading...</Typography>
                  ) : (
                    patients.map((patient) => (
                      <Patient key={patient.userID} onClick={() => handlePatientClick(patient)}>
                        <span>{patient.firstName} {patient.lastName}</span>
                      </Patient>
                    ))
                  )}
                </PatientList>
              </Profile>
              <LogoutButton variant="contained" onClick={logout}>
                Logout
              </LogoutButton>
            </Container>
          </Drawer>
        </React.Fragment>
      ))}
    </div>
  );
}