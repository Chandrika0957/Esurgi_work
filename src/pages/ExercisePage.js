import React, { useState, useEffect } from "react";
import { useRoleState } from "../PatientContext";
import {
  Typography,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  ListItemText,
  styled,
} from "@mui/material";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import firebaseConfig from "../config/firebaseConfig";
import { exerciseData as exercises } from "../config/exerciseData";
import Header from "../components/Header";
import { Label } from "@mui/icons-material";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const ExerciseContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
});

const TitleTypography = styled(Typography)(({ theme }) => ({
  color: "rgb(0,113,115)",
  fontFamily: "Montserrat",
  fontWeight: "bold",
  padding: "20px",
}));

const DeviceStatus = styled("div")({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  margin: "20px",
});

const FormContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "30px",
  width: "80%",
  backgroundColor: "#f9f9f9",
  padding: "30px",
});

const TextFieldContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "5px",
});

const TextFieldLabel = styled("div")({
  fontWeight: "bold",
  color: "black",
});

const SubmitButtom = styled("Button")({
  width: "40%",
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

const ExercisePage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [patients, setPatients] = useState([]);

  const [selectedPatient, setSelectedPatient] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [holdTime, setHoldTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [daysOfWeek, setDaysOfWeek] = useState([]);
  const days = [
    "Every Monday",
    "Every Tuesday",
    "Every Wednesday",
    "Every Thursday",
    "Every Friday",
    "Every Saturday",
    "Every Sunday",
  ];
  const [deviceConnected, setDeviceConnected] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { setAlert } = useRoleState();

  const calculateDateFromToday = (daysToAdd) => {
    const date = new Date();
    console.log(date);
    date.setDate(date.getDate() + daysToAdd);
    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    const getCurrentUser = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    const initialStateDate = calculateDateFromToday(0);
    const initialEndDate = calculateDateFromToday(14);
    setStartDate(initialStateDate);
    setEndDate(initialEndDate);

    return () => getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const db = firebase.database();
        const usersRef = db.ref("users");
        const snapshot = await usersRef.once("value");
        const users = snapshot.val();

        const getCurrentUserPatients = Object.entries(users)
          .filter(
            ([key, user]) =>
              user.userType.toLowerCase() === "patient" &&
              user.physicalTherapists &&
              user.physicalTherapists.includes(currentUser.uid)
          )
          .map(([key, user]) => ({ id: key, ...user }));
        setPatients(getCurrentUserPatients);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching patients: ", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchPatients();
    return () => {
      const db = firebase.database();
      const usersRef = db.ref("users");
      usersRef.off();
    };
  }, [currentUser]);

  ////////////////////////////////////////////////////////////////////////////////////

  const handleBeginExercise = () => {
    setError(null);
    if (!selectedPatient || !sets || !reps || !exerciseName) {
      setError("All fields must be filled.");
      return;
    }
    if (sets <= 0 || reps <= 0) {
      setError("Sets and Reps need to be above 0");
      return;
    }
    ////////////////////////////////////////////////////////////////////////////////////

    const getExerciseDates = (startDate, endDate, selectedDays) => {
      const daysOfWeekMap = {
        "Every Monday": 1,
        "Every Tuesday": 2,
        "Every Wednesday": 3,
        "Every Thursday": 4,
        "Every Friday": 5,
        "Every Saturday": 6,
        "Every Sunday": 0,
      };

      const start = new Date(startDate);
      const end = new Date(endDate);
      const dates = [];
      console.log(`Start Date: ${start.toISOString().split("T")[0]}`);
      console.log(`End Date: ${end.toISOString().split("T")[0]}`);

      selectedDays.forEach((day) => {
        const targetDayOfWeek = daysOfWeekMap[day];
        let currentDate = new Date(start);

        currentDate.setHours(12, 0, 0, 0);

        console.log(`Target Day of Week for ${day}: ${targetDayOfWeek}`);

        let currentDayOfWeek = currentDate.getDay();
        console.log(`Current Day of Week: ${currentDayOfWeek}`);

        let daysUntilNextOccurrence =
          (targetDayOfWeek - currentDayOfWeek + 7) % 7;
        if (daysUntilNextOccurrence === 0) {
          daysUntilNextOccurrence = 7;
        }
        console.log(`Days Until Next Occurrence: ${daysUntilNextOccurrence}`);

        currentDate.setDate(currentDate.getDate() + daysUntilNextOccurrence);
        console.log(
          `First Occurrence Date: ${currentDate.toISOString().split("T")[0]}`
        );

        if (currentDate >= start && currentDate <= end) {
          dates.push(currentDate.toISOString().split("T")[0]);
          console.log(`Added Date: ${currentDate.toISOString().split("T")[0]}`);
        }

        while (currentDate <= end) {
          currentDate.setDate(currentDate.getDate() + 7);
          console.log(`curr Date: ${currentDate.toISOString().split("T")[0]}`);
          console.log(`ennn Date: ${end.toISOString().split("T")[0]}`);
          dates.push(currentDate.toISOString().split("T")[0]);

          if (currentDate <= end + 1) {
            dates.push(currentDate.toISOString().split("T")[0]);
            console.log(`DAYUM: ${dates}`);

            console.log(
              `Added Date: ${currentDate.toISOString().split("T")[0]}`
            );
          }
        }
      });

      const uniqueDates = [...new Set(dates)].sort();
      console.log(`Unique Dates: ${uniqueDates}`);
      return uniqueDates;
    };

    ////////////////////////////////////////////////////////////////////////////////////

    const dates = getExerciseDates(startDate, endDate, daysOfWeek);

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

    const selectedPatientInput = patients.find(
      (patient) => patient.id === selectedPatient
    );
    const patientName = `${selectedPatientInput.firstName} ${selectedPatientInput.lastName}`;

    const db = firebase.database();
    const exercisesRef = db.ref("prescriptions");
    const exerciseData = {
      patientId: selectedPatient,
      patientName,
      ptId: currentUser.uid,
      email: selectedPatientInput.email,
      exerciseName,
      holdTime,
      sets,
      reps,
      startDate,
      endDate,
      daysOfWeek,
      dates,
      serverTimestamp: firebase.database.ServerValue.TIMESTAMP,
      formattedTimestamp: formattedTimestamp,
    };

    exercisesRef
      .push(exerciseData)
      .then(() => {
        if (setAlert) {
          setAlert({
            open: true,
            type: "success",
            message: `You have added ${exerciseName} for ${
              patients.find((patient) => patient.id === selectedPatient)
                .firstName
            }`,
          });
        }

        setSelectedPatient("");
        setExerciseName("");
        setHoldTime("");
        setSets("");
        setReps("");
        setStartDate("");
        setEndDate("");
        setDaysOfWeek([]);
        setError(null);
      })
      .catch((error) => {
        console.error("Error adding exercise: ", error);
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

  ////////////////////////////////////////////////////////////////////////////////////

  const handleExerciseSelected = (e) => {
    const selectedExercise = exercises.find(
      (exercise) => exercise.name === e.target.value
    );
    if (selectedExercise) {
      setExerciseName(selectedExercise.name);
      setSets(selectedExercise.sets);
      setReps(selectedExercise.reps);
      setHoldTime(selectedExercise.holdTime);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <ExerciseContainer>
        <Header />
        <TitleTypography variant="h4">Start a New Exercise</TitleTypography>
        <FormContainer>
          <TextFieldContainer>
            <TextFieldLabel>Select Patient:</TextFieldLabel>
            <TextField
              select
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ bgcolor: "white" }}
            >
              {patients.map((patient) => (
                <MenuItem key={patient.id} value={patient.id}>
                  {patient.firstName} {patient.lastName}
                </MenuItem>
              ))}
            </TextField>
          </TextFieldContainer>

          <TextFieldContainer>
            <TextFieldLabel>Select Exercise:</TextFieldLabel>
            <TextField
              select
              value={exerciseName}
              onChange={handleExerciseSelected}
              fullWidth
              variant="outlined"
              sx={{ bgcolor: "white" }}
            >
              {exercises.map((exercise) => (
                <MenuItem key={exercise.name} value={exercise.name}>
                  {exercise.name}
                </MenuItem>
              ))}
            </TextField>
          </TextFieldContainer>

          <TextFieldContainer>
            <TextFieldLabel>Select Number Of Sets:</TextFieldLabel>
            <TextField
              type="number"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ bgcolor: "white" }}
            />
          </TextFieldContainer>

          <TextFieldContainer>
            <TextFieldLabel>Select Number Of Reps:</TextFieldLabel>
            <TextField
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ bgcolor: "white" }}
            />
          </TextFieldContainer>

          <TextFieldContainer>
            <TextFieldLabel>Select Hold Time Per Second:</TextFieldLabel>
            <TextField
              type="number"
              value={holdTime}
              onChange={(e) => setHoldTime(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ bgcolor: "white" }}
            />
          </TextFieldContainer>

          <TextFieldContainer>
            <TextFieldLabel>Start Date:</TextFieldLabel>
            <TextField
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ bgcolor: "white" }}
            />
          </TextFieldContainer>

          {/* do a minimum of 2 weeks away from today */}
          <TextFieldContainer>
            <TextFieldLabel>End Date:</TextFieldLabel>
            <TextField
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              variant="outlined"
              sx={{ bgcolor: "white" }}
            />
          </TextFieldContainer>

          <TextFieldContainer>
            <TextFieldLabel>Select Days Of The Week:</TextFieldLabel>
            <FormControl fullWidth variant="outlined">
              <Select
                multiple
                value={daysOfWeek}
                onChange={(e) => setDaysOfWeek(e.target.value)}
                renderValue={(selected) => selected.join(", ")}
                sx={{ bgcolor: "white" }}
              >
                {days.map((day) => (
                  <MenuItem key={day} value={day}>
                    <Checkbox checked={daysOfWeek.indexOf(day) > -1} />
                    <ListItemText primary={day} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </TextFieldContainer>
        </FormContainer>

        <DeviceStatus>
          {deviceConnected ? (
            <>
              <Typography color="green">Device connected (✓)</Typography>
            </>
          ) : (
            <>
              <Typography variant="h6" color="red">
                Device not connected (X)
              </Typography>
            </>
          )}
        </DeviceStatus>
        <SubmitButtom variant="contained" onClick={handleBeginExercise}>
          Begin Exercise
        </SubmitButtom>
        {error && <ErrorTypography variant="h6">{error}</ErrorTypography>}
      </ExerciseContainer>
    </>
  );
};

export default ExercisePage;
