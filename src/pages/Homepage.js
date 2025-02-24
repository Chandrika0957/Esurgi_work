import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, query, orderByChild, limitToLast, get } from "firebase/database";
import { Card, CardContent, Typography, CircularProgress, styled, Grid, Button, Alert } from "@mui/material";
import Header from "../components/Header";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../config/firebaseConfig";
import { CalendarToday, Person, ShoppingCart, Devices } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const HomePageContainer = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  padding: "20px",
  marginTop: 15,
}));

const LargeCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  width: "85%",
  padding: "30px",
  backgroundColor: "#2F8575",
  color: "#fff",
  textAlign: "left",
  borderRadius: "10px",
  marginBottom: "30px",
  backgroundImage: "url(/homeImage.png)", 
  backgroundRepeat: "no-repeat",
  backgroundPosition: "calc(100% - 15%) center",  
  backgroundSize: "auto 100%", 
}));

const SmallCard = styled(Card)(({ theme }) => ({
  width: "100%",
  height: "130px",
  borderRadius: "10px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  position: "relative",
  paddingLeft: "20px",
}));

const ColorStripe = styled("div")(({ color }) => ({
  position: "absolute",
  left: 0,
  top: "65%",
  transform: "translateY(-50%)",
  width: "4px",
  height: "30%",
  backgroundColor: color,
  borderRadius: "2px",
}));

const IconSquare = styled("div")(({ color }) => ({
  position: "absolute",
  top: "15px",
  right: "19px",
  width: "45px",
  height: "45px",
  backgroundColor: color,
  borderRadius: "8px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& svg": {
    color: "white",
    fontSize: "24px"
  }
}));

const LongCard = styled(Card)(({ theme }) => ({
  width: "100%",
  marginTop: "20px",
  borderRadius: "10px",
}));

const ProgressContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '40px', 
  gap: '20px',
  '& > :first-of-type': {  
    minWidth: '200px',
    flexShrink: 0,
  },
});

const ProgressBarWrapper = styled('div')({
  flex: 0.9,  
  height: '8px',
  backgroundColor: '#E0E0E0',
  borderRadius: '4px',
  position: 'relative',
});

const ProgressBar = styled('div')(({ progress }) => ({
  height: '100%',
  width: `${progress}%`,
  backgroundColor: progress >= 70 ? '#2F8575' : progress >= 50 ? '#FFB547' : '#FF5C5C',
  borderRadius: '4px',
}));

const ProgressLabel = styled('div')(({ progress }) => {
  const backgroundColor = progress >= 70 ? '#2F8575' : progress >= 50 ? '#FFB547' : '#FF5C5C';
  return {
    position: 'absolute',
    left: `${progress}%`,
    transform: 'translateX(-50%)',
    top: '-35px',
    backgroundColor: 'white',
    border: `1px solid ${backgroundColor}`,
    color: backgroundColor,
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '14px',
    whiteSpace: 'nowrap',

    '&::after': {
      content: '""',
      position: 'absolute',
      bottom: '-6px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '0',
      height: '0',
      borderLeft: '6px solid transparent',
      borderRight: '6px solid transparent',
      borderTop: `6px solid ${backgroundColor}`,
    },
  };
});

const Homepage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [deviceCount, setDeviceCount] = useState(0);
  const [therapistCount, setTherapistCount] = useState(0);
  const [isPatient, setIsPatient] = useState(false);
  const [userType, setUserType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setUsername(user.displayName || user.email.split('@')[0]);
        fetchUserType(user.uid);
        fetchPrescriptions(user.uid);
        fetchTestResults(user.uid);
        fetchAppointments(user.uid);
        //fetchPatientsCount(user.uid);
        fetchDevices(); 
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const getGreeting = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) {
      return "Good Morning";
    } else if (currentHour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  const fetchDevices = async () => {
    try {
      const devicesRef = ref(db, 'devices');
      const snapshot = await get(devicesRef);
      
      if (snapshot.exists()) {
        const deviceCount = snapshot.size; 
        setDeviceCount(deviceCount);
      } else {
        setDeviceCount(0); 
      }
    } catch (err) {
      setError("Error fetching devices");
      console.error("Error fetching devices:", err);
    }
  };


  const fetchUserType = async (userId) => {
    try {
      const userRef = ref(db, `users/${userId}`);
      const snapshot = await get(userRef);
      if (snapshot.exists()) {
        const user = snapshot.val();
        setUserType(user.userType);
        if (user.userType === "PATIENT") {
          setTherapistCount(user.physicalTherapists?.length || 0);
        } else if (user.userType === "PT") {
          setPatientCount(user.patients?.length || 0);
        }
      }
    } catch (err) {
      setError("Error fetching user data");
      console.error("Error fetching user data:", err);
    }
  };

  const fetchAppointments = async (userId) => {
    try {
      const appointmentsRef = ref(db, 'appointments');
      const snapshot = await get(appointmentsRef);
      
      if (snapshot.exists()) {
        let count = 0;
        snapshot.forEach((childSnapshot) => {
          const appointment = childSnapshot.val();
          if (appointment.ptID === userId) {
            count++;
          }
        });
        setAppointmentCount(count);
      } else {
        setAppointmentCount(0);
      }
    } catch (err) {
      setError("Error fetching appointments");
      console.error("Error fetching appointments:", err);
    }
  };

  const fetchPrescriptions = async (userId) => {
    console.log(userId)
    try {
      const prescriptionsRef = ref(db, 'prescriptions');
      const snapshot = await get(prescriptionsRef);
  
      if (snapshot.exists()) {
        const prescriptionsData = [];
        snapshot.forEach((childSnapshot) => {
          const prescription = {
            id: childSnapshot.key,
            ...childSnapshot.val(),
          };
  
          if (prescription.ptId === userId || prescription.patientId === userId) {
            prescriptionsData.push(prescription);
          }
        });
  
        const sortedPrescriptions = prescriptionsData
          .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
          .slice(0, 3);
  
        setPrescriptions(sortedPrescriptions);
      } else {
        setPrescriptions([]);
      }
    } catch (err) {
      setError('Error fetching prescriptions');
      console.error('Error fetching prescriptions:', err);
    }
  };

  const fetchTestResults = async (userId, userType) => {
    try {
        const testResultsRef = ref(db, 'testResults');
        const snapshot = await get(testResultsRef);

        if (snapshot.exists()) {
            const testResultsData = [];
            snapshot.forEach((childSnapshot) => {
                const testResult = {
                    id: childSnapshot.key,
                    ...childSnapshot.val(),
                };

                if (
                  
                    (testResult.patientID === userId) || 
                    (testResult.ptId === userId)
                ) {
                    testResultsData.push(testResult);
                    console.log(1)
                }
                console.log(testResult.ptId)

            });

            const sortedTestResults = testResultsData
                .sort((a, b) => new Date(b.date) - new Date(a.date)) 
                .slice(0, 3);

            setTestResults(sortedTestResults);
        } else {
            setTestResults([]);
        }
    } catch (err) {
        setError('Error fetching test results');
        console.error('Error fetching test results:', err);
    }
};

  const calculateProgress = (dates) => {
    if (!dates || dates.length === 0) return 0;
    
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    const completedDates = dates.filter(dateStr => {
      const sessionDate = new Date(dateStr);
      return sessionDate < currentDate;
    });

    return Math.round((completedDates.length / dates.length) * 100);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <>
      <Header />

      <HomePageContainer>
        <LargeCard>
          <CardContent>
            <Typography variant="h4" sx={{ fontWeight: "bold", fontSize: "2.5rem", mb: 3 }}>
              {getGreeting()}, {username}
            </Typography>
            <Typography variant="h5" sx={{ mb: 3 }}>
              Have a nice day at work!
            </Typography>
            <Button
              variant="contained"
              style={{
                backgroundColor: "#fff",
                color: "#2F8575",
                borderRadius: 10,
                marginTop: "20px",
              }}
              onClick={() => navigate('/appointment')}
            >
              Create Appointment
            </Button>             
          </CardContent>
        </LargeCard>
        <Grid
          container
          sx={{
            width: "85%",
            marginBottom: "20px",
            marginLeft: "auto",
            marginRight: "auto",
            paddingLeft: "32px",
            paddingRight: "32px",
            gap: "32px",
            '& > .MuiGrid-item': {
              width: 'calc(25% - 24px)',
              maxWidth: 'calc(25% - 24px)',
              flexBasis: 'calc(25% - 24px)',
            }
          }}
        >
          <Grid item xs={12} sm={6}>
            <SmallCard>
              <ColorStripe color="#2F8575" />
              <IconSquare color="#2F8575">
                <CalendarToday />
              </IconSquare>
              <Typography variant="subtitle1" sx={{ textAlign: "left", mb: 1, fontSize: "1.2rem", fontWeight: 500 }}>
                Appointments
              </Typography>
              <Typography variant="h5" sx={{ textAlign: "left", fontSize: "2rem", fontWeight: 600, color: "#2F8575" }}>
                {appointmentCount}
              </Typography>
            </SmallCard>
          </Grid>
          <Grid item xs={12} sm={6}>
            <SmallCard>
              <ColorStripe color="#FFB547" />
              <IconSquare color="#FFB547">
                <Person />
              </IconSquare>
              <Typography variant="subtitle1" sx={{ textAlign: "left", mb: 1, fontSize: "1.2rem", fontWeight: 500 }}>
                {userType === "PATIENT" ? "Physical Therapists" : "Patients"}
              </Typography>
              <Typography variant="h5" sx={{ textAlign: "left", fontSize: "2rem", fontWeight: 600, color: "#FFB547" }}>
                {userType === "PATIENT" ? therapistCount : patientCount}
              </Typography>
            </SmallCard>
          </Grid>
          <Grid item xs={12} sm={6}>
            <SmallCard>
              <ColorStripe color="#FF5C5C" />
              <IconSquare color="#FF5C5C">
                <ShoppingCart />
              </IconSquare>
              <Typography variant="subtitle1" sx={{ textAlign: "left", mb: 1, fontSize: "1.2rem", fontWeight: 500 }}>
                Orders
              </Typography>
              <Typography variant="h5" sx={{ textAlign: "left", fontSize: "2rem", fontWeight: 600, color: "#FF5C5C" }}>
                3
              </Typography>
            </SmallCard>
          </Grid>
          <Grid item xs={12} sm={6}>
            <SmallCard>
              <ColorStripe color="#4285F4" />
              <IconSquare color="#4285F4">
                <Devices />
              </IconSquare>
              <Typography variant="subtitle1" sx={{ textAlign: "left", mb: 1, fontSize: "1.2rem", fontWeight: 500 }}>
                Devices
              </Typography>
              <Typography variant="h5" sx={{ textAlign: "left", fontSize: "2rem", fontWeight: 600, color: "#4285F4" }}>
              {deviceCount}
              </Typography>
            </SmallCard>
          </Grid>
        </Grid>

        <Grid 
          container 
          sx={{ 
            width: "85%",
            marginLeft: "auto",
            marginRight: "auto",
            paddingLeft: "32px",
            paddingRight: "32px",
            gap: "32px",
            '& > .MuiGrid-item': {
              width: 'calc(50% - 16px)',
              maxWidth: 'calc(50% - 16px)',
              flexBasis: 'calc(50% - 16px)',
              padding: 0,
            }
          }}
        >
          <Grid item>
            <LongCard>
                <CardContent>
                    <Typography variant="h6" sx={{ fontSize: '2rem', color: '#444', mb: 4 }}>
                        {userType === 'patient' ? 'Exercise Pass Rate' : 'Exercise Pass Rate'}
                    </Typography>

                    {testResults.map((result) => (
                      <ProgressContainer key={result.id}>
                          <Typography variant="body1" sx={{ minWidth: '200px', fontWeight: 500 }}>
                              {userType === 'PATIENT'
                                  ? `${result.testType} (${new Date(result.date).toLocaleDateString()})`
                                  : `${result.patientName}'s ${result.testType} (${new Date(result.date).toLocaleDateString()})`}
                          </Typography>
                          <ProgressBarWrapper>
                              <ProgressBar progress={parseFloat(result.averagePassRate) * 100} />
                              <ProgressLabel progress={parseFloat(result.averagePassRate) * 100}>
                                  {(parseFloat(result.averagePassRate) * 100).toFixed(1)}%
                              </ProgressLabel>
                          </ProgressBarWrapper>
                      </ProgressContainer>
                  ))}
                    {testResults.length === 0 && (
                        <Typography variant="body1" sx={{ textAlign: 'center', mt: 2, color: '#666' }}>
                            No test results available.
                        </Typography>
                    )}
                </CardContent>
            </LongCard>
        </Grid>

          <Grid item>
            <LongCard>
              <CardContent>
                <Typography variant="h6" sx={{ fontSize: '2rem', color: '#444', mb: 4 }}>
                  {userType === "PATIENT" ? "My Progress" : "Patient's Progress"}
                </Typography>
                
                {prescriptions.map((prescription, index) => (
                  <ProgressContainer key={prescription.id}>
                    <Typography variant="body1" sx={{ minWidth: '200px', fontWeight: 500 }}>
                      {userType === "PATIENT" 
                        ? prescription.exerciseName 
                        : `${prescription.patientName}'s ${prescription.exerciseName}`
                      }
                    </Typography>
                    <ProgressBarWrapper>
                      <ProgressBar progress={calculateProgress(prescription.dates)} />
                      <ProgressLabel progress={calculateProgress(prescription.dates)}>
                        {calculateProgress(prescription.dates)}%
                      </ProgressLabel>
                    </ProgressBarWrapper>
                  </ProgressContainer>
                ))}

                {prescriptions.length === 0 && (
                  <Typography variant="body1" sx={{ textAlign: 'center', mt: 2, color: '#666' }}>
                    {userType === "PATIENT" 
                      ? "No Prescription Available" 
                      : "No active prescriptions found"
                    }
                  </Typography>
                )}
              </CardContent>
            </LongCard>
          </Grid>
        </Grid>
      </HomePageContainer>
    </>
  );
};

export default Homepage;


