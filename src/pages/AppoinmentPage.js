import React, { useState, useEffect } from "react";
import { useRoleState } from "../PatientContext";
import {
  Typography,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  styled,
} from "@mui/material";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import firebaseConfig from "../config/firebaseConfig";
import Header from "../components/Header";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const AppointmentContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
});

const TitleTypography = styled(Typography)(({ theme }) => ({
  color: "rgb(0,113,115)",
  fontFamily: "Montserrat",
  fontWeight: "bold",
  padding: "20px",
}));

const FormContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "30px",
  width: "80%",
  backgroundColor: "#f9f9f9",
  padding: "30px",
});

const TextFieldContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  width: "100%"
});

const TextFieldLabel = styled("div")({
  fontWeight: "bold",
  color: "black",
});

const SubmitButtom = styled("Button")({
  width: "80%",
  height: 40,
  borderRadius: 8,
  fontFamily: "Montserrat",
  backgroundColor: "rgb(0, 113, 115)",
  color: "white",
  cursor: "pointer",
  marginBottom: 20,
});

const ErrorTypography = styled(Typography)(({ theme }) => ({
  color: "red",
  marginTop: "20px",
}));

const LoadingSpinner = (props) => <CircularProgress {...props} sx={{ m: 3 }} />;

const MyAccountPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [personList, setPersonList] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState("");
  const [isPt, setIsPt] = useState(false);
  const [dateTime, setDateTime] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setAlert } = useRoleState();

  useEffect(() => {
    const getCurrentUser = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const db = firebase.database();
        const usersRef = db.ref("users");
        const snapshot = await usersRef.once("value");
        const users = snapshot.val();

        if (users[currentUser.uid].userType.toLowerCase() === "pt") {
          const physicalTherapistsPatients = Object.entries(users)
            .filter(
              ([key, user]) =>
                user.userType.toLowerCase() === "patient" &&
                user.physicalTherapists &&
                user.physicalTherapists.includes(currentUser.uid)
            )
            .map(([key, user]) => ({ id: key, ...user }));

          setPersonList(physicalTherapistsPatients);
          setIsPt(true);
        } else if (
          users[currentUser.uid].userType.toLowerCase() === "patient"
        ) {
          const patientPhysicalTherapists = Object.entries(users)
            .filter(
              ([key, user]) =>
                user.userType.toLowerCase() === "pt" &&
                users[currentUser.uid].physicalTherapists.includes(user.uid)
            )
            .map(([key, user]) => ({ id: key, ...user }));

          setPersonList(patientPhysicalTherapists);
          setIsPt(false);
        }
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchList();
    return () => {
      const db = firebase.database();
      const usersRef = db.ref("users");
      usersRef.off();
    };
  }, [currentUser]);

  const handleAddAppointment = () => {
    setError(null);
    if (!selectedPerson || !dateTime || !reason) {
      setError("All fields must be filled.");
      return;
    }
    const now = new Date();
    const formattedTimestamp = now.toLocaleString("en-US", {
      month: "long",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/New_York",
    });

    const db = firebase.database();
    const appointmentsRef = db.ref("appointments");
    const appointmentData = {
      userId: currentUser.uid,
      selectedPersonId: selectedPerson,
      dateTime,
      reason,
      serverTimestamp: firebase.database.ServerValue.TIMESTAMP,
      formattedTimestamp: formattedTimestamp,
    };

    appointmentsRef
      .push(appointmentData)
      .then(() => {
        if (setAlert) {
          setAlert({
            open: true,
            type: "success",
            message: `You have added an appoinment!`,
          });
        }
        setSelectedPerson("");
        setDateTime("");
        setReason("");
        setError(null);
      })
      .catch((error) => {
        setError(error.message);
        if (setAlert) {
          setAlert({
            open: true,
            message: error.message,
            type: "error",
          });
        }
      });
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <AppointmentContainer>
        <Header />
        <TitleTypography variant="h4">Add Appointment</TitleTypography>
        <FormContainer>
          <TextFieldContainer>
            <TextFieldLabel>
              {isPt
                ? "Select Patient:"
                : "Select Physical Therapist:"}
            </TextFieldLabel>
            <TextField
              select
              value={selectedPerson}
              onChange={(e) => setSelectedPerson(e.target.value)}
              fullWidth
              variant="outlined"
            >
              {personList.map((person) => (
                <MenuItem key={person.id} value={person.id}>
                  {person.firstName} {person.lastName}
                </MenuItem>
              ))}
            </TextField>
          </TextFieldContainer>

          <TextFieldContainer>
            <TextFieldLabel>Date and Time</TextFieldLabel>
            <TextField
              label=""
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              fullWidth
              variant="outlined"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </TextFieldContainer>

          <TextFieldContainer>
            <TextFieldLabel>Reason:</TextFieldLabel>
            <TextField
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              fullWidth
              variant="outlined"
            />
          </TextFieldContainer>

          <SubmitButtom variant="contained" onClick={handleAddAppointment}>
            Add Appointment
          </SubmitButtom>
          {error && <ErrorTypography variant="h6">{error}</ErrorTypography>}
        </FormContainer>
      </AppointmentContainer>
    </>
  );
};

export default MyAccountPage;
