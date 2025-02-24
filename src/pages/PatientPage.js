import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useRoleState } from '../PatientContext';
import { Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Card, CardContent, Grid, Container, TextField } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Header from '../components/Header';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { Chart, LineElement, CategoryScale, LinearScale, PointElement, Legend, Title, Tooltip, TimeScale } from 'chart.js';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import firebaseConfig from '../config/firebaseConfig';
import { initializeApp } from 'firebase/app';
import { saveAs } from 'file-saver';
import { unparse } from 'papaparse'; 

const app = initializeApp(firebaseConfig);

Chart.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Title, Tooltip, TimeScale);

const ContainerStyled = (props) => (
  <Container {...props} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 3 }} />
);

const HeadingContainer = (props) => (
  <div {...props} sx={{ display: 'flex', alignItems: 'center', position: 'relative' }} />
);

const Heading = (props) => (
  <Typography {...props} sx={{ fontWeight: 'bold', fontFamily: 'Montserrat', color: '#007173' }} />
);

const ButtonContainer = (props) => (
  <div {...props} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
    {props.children}
  </div>
);

const PatientGrid = (props) => (
  <Grid container {...props} sx={{ width: '100%', mt: 2 }} />
);

const PatientCard = (props) => (
  <Card {...props} sx={{ width: '100%', cursor: 'pointer', '&:hover': { boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)' } }} />
);

const formatTimestamp = (seconds, nanoseconds) => {
  const date = new Date(seconds * 1000 + nanoseconds / 1000000);
  return date.toISOString(); 
};

const ExercisesTable = (props) => (
  <Table {...props} sx={{ width: '100%', mt: 2 }} />
);

const BackButton = (props) => (
  <Button {...props} sx={{ backgroundColor: 'white', border: '1px solid #007173', color: '#007173', '&:hover': { backgroundColor: '#f1f1f1', boxShadow: 'none' }, mr: 'auto', boxShadow: 'none' }} />
);

const PatientButton = (props) => (
  <Button {...props} sx={{ backgroundColor: 'white', border: '1px solid #007173', color: '#007173', '&:hover': { backgroundColor: '#f1f1f1' } }} />
);

const LoadingSpinner = (props) => (
  <CircularProgress role="progressbar" data-testid="loading-spinner" {...props} sx={{ m: 3 }} />
);

const ChartContainer = (props) => (
  <div {...props} style={{ width: '100%', height: 'auto', aspectRatio: '4/3' }} />
);

const SwitchButton = (props) => (
  <Button {...props} sx={{ m: '10px 0', backgroundColor: 'white', border: '1px solid #007173', color: '#007173', ml: 2, '&:hover': { backgroundColor: '#f1f1f1' }}} />
);

const PatientPage = () => {

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { id } = useParams();
  const { user, patientlist, setAlert } = useRoleState();
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPatients, setFilteredPatients] = useState(patients);
  
  const [notifications, setNotifications] = useState([]);
  const [earliestDataPoint, setEarliestDataPoint] = useState(null);
  const [latestDataPoint, setLatestDataPoint] = useState(null);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [exercises, setExercises] = useState(new Map());
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [exerciseData, setExerciseData] = useState([]);
  const [chartView, setChartView] = useState('Left & Right');
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [dateRangeValid, setDateRangeValid] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const db = getDatabase(app);
        const usersRef = ref(db, 'users');
        const unsubscribe = onValue(usersRef, (snapshot) => {
          const users = snapshot.val();
          const patientsData = Object.entries(users)
            .filter(([key, user]) => {
              const userType = user?.userType || '';
              return String(userType).replace(/\s/g, '') === 'PATIENT';
            })
            .map(([key, user]) => ({ ...user, userID: key }));
          setPatients(patientsData);
          setFilteredPatients(patientsData);
          setLoading(false);
        });
  
        return () => {
          off(usersRef);
        };
      } catch (error) {
        console.error("Error fetching patients: ", error);
      }
    };
  
    fetchPatients();
  
    if (selectedPatient) {
      try {
        const db = getDatabase(app);
        const exercisesRef = ref(db, 'exercises');
        const unsubscribe = onValue(exercisesRef, (snapshot) => {
          const exercisesData = snapshot.val();
          const patientExercises = Object.values(exercisesData)
            .filter((exercise) => exercise.userID === selectedPatient.userID);
  
          const uniqueExercises = new Map();
          patientExercises.forEach(exercise => {
            const exerciseName = exercise.exerciseName.replace(/"/g, '');
            if (!uniqueExercises.has(exerciseName)) {
              uniqueExercises.set(exerciseName, []);
            }
            uniqueExercises.get(exerciseName).push(exercise);
          });
  
          setExercises(uniqueExercises);
  
          const data = patientExercises.map((exercise, index) => {
            const totalSets = exercise.sets.length;
            const totalReps = exercise.sets.reduce((acc, set) => acc + set.reps.length, 0);
  
            const successRatesLeft = exercise.sets.flatMap(set => set.reps.map(rep => rep.repData.pt.successRateLeft));
            const successRatesRight = exercise.sets.flatMap(set => set.reps.map(rep => rep.repData.pt.successRateRight));
  
            const avgSuccessRateLeft = successRatesLeft.reduce((acc, rate) => acc + rate, 0) / successRatesLeft.length;
            const avgSuccessRateRight = successRatesRight.reduce((acc, rate) => acc + rate, 0) / successRatesRight.length;
  
            return {
              timestamp: new Date(exercise.timestamp.seconds * 1000 + exercise.timestamp.nanoseconds / 1000000),
              index: index + 1,
              totalSets,
              totalReps,
              avgSuccessRateLeft,
              avgSuccessRateRight
            };
          }).sort((a, b) => a.timestamp - b.timestamp);
  
          setExerciseData(data);
  
          const earliestDataPoint = data.length > 0 ? data[0].timestamp : null;
          const latestDataPoint = data.length > 0 ? data[data.length - 1].timestamp : null;
          setEarliestDataPoint(earliestDataPoint);
          setLatestDataPoint(latestDataPoint);
  
          if (earliestDataPoint && latestDataPoint) {
            setStartDate(earliestDataPoint);
            setEndDate(latestDataPoint);
            handleDateChange();

          }
        });
  
        return () => {
          off(exercisesRef);
        };
      } catch (error) {
        console.error("Error fetching exercises: ", error);
      }
    }
  }, [selectedPatient]);

  const exportToCSV = () => {
    if (!startDate || !endDate) {
        setAlert({
            open: true,
            type: "error",
            message: "Start date or end date is not set.",
        });
        return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const filteredData = exerciseData.filter(data => {
        const timestamp = new Date(data.timestamp);
        return timestamp >= start && timestamp <= end;
    });

    if (filteredData.length === 0) {
        setAlert({
            open: true,
            type: "warning",
            message: "No data available for the selected date range.",
        });
        return;
    }

    const csvData = filteredData.map(data => ({
        Date: data.timestamp.toISOString().split('T')[0],
        "Left Success Rate": data.avgSuccessRateLeft,
        "Right Success Rate": data.avgSuccessRateRight,
        "Average Success Rate": (data.avgSuccessRateLeft + data.avgSuccessRateRight) / 2
    }));

    const csvString = unparse(csvData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    saveAs(blob, `${selectedPatient.firstName}_${selectedPatient.lastName}_${selectedExercise}_data.csv`);

    setAlert({
        open: true,
        type: "success",
        message: "CSV file has been downloaded successfully.",
    });
};

  const handlePatientClick = async (patient) => {
    setSelectedPatient(patient);
    setLoading(true);
    try {
      const db = getDatabase(app);
      const exercisesRef = ref(db, 'exercises');
      onValue(exercisesRef, (snapshot) => {
        const exercisesData = snapshot.val();
        const patientExercises = Object.values(exercisesData)
          .filter((exercise) => exercise.userID === patient.userID);

        const uniqueExercises = new Map();
        patientExercises.forEach(exercise => {
          const exerciseName = exercise.exerciseName;
          if (!uniqueExercises.has(exerciseName)) {
            uniqueExercises.set(exerciseName, []);
          }
          uniqueExercises.get(exerciseName).push(exercise);
        });

        setExercises(uniqueExercises);
        setLoading(false);
      }); 

      return () => {
        off(exercisesRef);
      };
    } catch (error) {
      console.error("Error fetching exercises: ", error);
    }
  };

  const handleBackClick = () => {
    if (selectedExercise) {
      setSelectedExercise(null);
      setExerciseData([]);
    } else {
      setSelectedPatient(null);
      setExercises(new Map());
    }
  };

  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
  
    const filtered = patients.filter(patient => 
      `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(query)
    );
    setFilteredPatients(filtered);
  };
  

  const handleExerciseClick = (exerciseName) => {
    const exerciseInstances = exercises.get(exerciseName);
    setSelectedExercise(exerciseName);
    setIsInitialLoad(true);

    const data = exerciseInstances.map((exercise, index) => {
      const totalSets = exercise.sets.length;
      const totalReps = exercise.sets.reduce((acc, set) => acc + set.reps.length, 0);

      const successRatesLeft = exercise.sets.flatMap(set => set.reps.map(rep => rep.repData.pt.successRateLeft));
      const successRatesRight = exercise.sets.flatMap(set => set.reps.map(rep => rep.repData.pt.successRateRight));

      const avgSuccessRateLeft = successRatesLeft.reduce((acc, rate) => acc + rate, 0) / successRatesLeft.length;
      const avgSuccessRateRight = successRatesRight.reduce((acc, rate) => acc + rate, 0) / successRatesRight.length;

      return {
        timestamp: new Date(exercise.timestamp.seconds * 1000 + exercise.timestamp.nanoseconds / 1000000),
        index: index + 1,
        totalSets,
        totalReps,
        avgSuccessRateLeft,
        avgSuccessRateRight
      };
    }).sort((a, b) => a.timestamp - b.timestamp);

    setExerciseData(data);

    const earliestDataPoint = data[0]?.timestamp;
    const latestDataPoint = data[data.length - 1]?.timestamp;
    setEarliestDataPoint(earliestDataPoint);
    setLatestDataPoint(latestDataPoint);

    if (earliestDataPoint && latestDataPoint) {
      const oneDay = 24 * 60 * 60 * 1000;
      const startDateAdjusted = new Date(earliestDataPoint.getTime() - oneDay);
      const endDateAdjusted = new Date(latestDataPoint.getTime() + oneDay);
      
      setStartDate(startDateAdjusted);
      setEndDate(endDateAdjusted);

      setTimeout(() => {
        handleDateChange();
      }, 0);
    }
  };

  // useEffect(() => {
  //   if (startDate && endDate && exerciseData.length > 0) {
  //     handleDateChange();
  //   }
  // }, [startDate, endDate, exerciseData]);

  const handleChartViewChange = (view) => {
    setChartView(view);
  };

  const handleDateChange = () => {
    let newNotifications = [];
    const oneDay = 24 * 60 * 60 * 1000; 
  
    if (startDate && endDate) {
      const startDateAdjusted = new Date(startDate.getTime() - oneDay);
      let endDateAdjusted = latestDataPoint ? new Date(latestDataPoint.getTime() + oneDay) : null;
  
      if (startDate > endDate) {
        newNotifications.push(`Start date must be before end date`);
      }
  
     
      if ((startDate < earliestDataPoint ) &&  (startDate != startDateAdjusted)){
        newNotifications.push(
          `No exercise data before ${earliestDataPoint.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',

          })}`
        );
      }
  
      if (latestDataPoint && endDate > endDateAdjusted) {
        newNotifications.push(
          `No exercise data after ${latestDataPoint.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
          })}`
        );
      }

  
      if (newNotifications.length === 0 && startDate <= endDate) {
        setDateRangeValid(true);
        const filteredData = exerciseData.filter(data =>
          data.timestamp >= startDate && data.timestamp <= endDate
        );
  
        setChartData({
          labels: filteredData.map(data => data.timestamp),
          datasets: [
            {
              label: 'Left Success Rate',
              data: filteredData.map(data => data.avgSuccessRateLeft),
              borderColor: '#c90300',
              fill: false,
              hidden: chartView === 'Average',
            },
            {
              label: 'Right Success Rate',
              data: filteredData.map(data => data.avgSuccessRateRight),
              borderColor: '#26b0ff',
              fill: false,
              hidden: chartView === 'Average',
            },
            {
              label: 'Average Success Rate',
              data: filteredData.map(data => (data.avgSuccessRateLeft + data.avgSuccessRateRight) / 2),
              borderColor: '#8300c9',
              fill: false,
              hidden: chartView === 'Left & Right',
            }
          ]
        });
      } else {
        setDateRangeValid(false);
      }
  
      setNotifications(newNotifications);
    }
    setIsInitialLoad(false);

  };

  const renderChart = () => {
    const options = {
      scales: {
        x: {
          title: {
            display: true,
            text: 'Date'
          },
          type: 'time',
          time: {
            unit: 'day', 
            tooltipFormat: 'PPP', 
            displayFormats: {
              day: 'MMM d, yyyy'  
            }
          }
        },
        y: {
          title: {
            display: true,
            text: 'Success Rate (%)'
          },
          beginAtZero: true,
          max: 1
        }
      }
    };
  
    return <Line data={chartData} options={options} />;
  };
  

  if (loading) {
    return <LoadingSpinner />;
  }

  if (selectedPatient) {
    if (selectedExercise) {
      return (
        <>
          <Header />
          <ContainerStyled>
            <HeadingContainer>
              <Heading variant="h3">
                {`${selectedPatient.firstName} ${selectedPatient.lastName}'s ${selectedExercise} Exercise`}
              </Heading>
            </HeadingContainer>
            <ButtonContainer>
              <BackButton onClick={handleBackClick} variant="contained" startIcon={<ArrowBackIcon />}>
                Back
              </BackButton>
              <SwitchButton onClick={() => handleChartViewChange('Left & Right')}>
                Left & Right
              </SwitchButton>
              <SwitchButton onClick={() => handleChartViewChange('Average')}>
                Average
              </SwitchButton>
              <SwitchButton onClick={exportToCSV}>
                Export to CSV
              </SwitchButton>
            </ButtonContainer>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Grid container spacing={5} justifyContent="center">
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="Start Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={startDate ? startDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value) : null)}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    label="End Date"
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    value={endDate ? endDate.toISOString().split('T')[0] : ''}
                    onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value) : null)}
                    fullWidth
                  />
                </Grid>
              </Grid>

              <Button onClick={handleDateChange} sx={{ mt: 2, ml: 2 }} variant="contained">
                Apply Date Range
              </Button>
              {notifications.length > 0 && notifications.map((notification, index) => (
                <Typography key={index} color="error" sx={{ mt: 2 }}>
                  {notification}
                </Typography>
              ))}
            </LocalizationProvider>
            <ChartContainer>
              {renderChart()}
            </ChartContainer>
          </ContainerStyled>
        </>
      );
    } else {
      return (
        <>
          <Header />
          <ContainerStyled>
            <HeadingContainer>
              <Heading variant="h3">
                {`${selectedPatient.firstName} ${selectedPatient.lastName}'s Exercises`}
              </Heading>
            </HeadingContainer>
            <BackButton onClick={handleBackClick} variant="contained" startIcon={<ArrowBackIcon />}>
              Back
            </BackButton>
            <ExercisesTable>
              <TableHead>
                <TableRow>
                  <TableCell>Exercise Name</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from(exercises.keys()).map((exerciseName, index) => (
                  <TableRow key={index}>
                    <TableCell>{exerciseName}</TableCell>
                    <TableCell>
                      <PatientButton onClick={() => handleExerciseClick(exerciseName)}>
                        View Details
                      </PatientButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </ExercisesTable>
          </ContainerStyled>
        </>
      );
    }
  } else {
    return (
      <>
        <Header />
        <ContainerStyled>
          <Heading variant="h3">
            Patients List
          </Heading>
          <TextField
            label="Search Patients"
            variant="outlined"
            fullWidth
            margin="normal"
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <PatientGrid spacing={3}>
            {filteredPatients.map((patient, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <PatientCard onClick={() => handlePatientClick(patient)}>
                  <CardContent>
                    <Typography variant="h5">
                      {patient.firstName} {patient.lastName}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {patient.email}
                    </Typography>
                  </CardContent>
                </PatientCard>
              </Grid>
            ))}
          </PatientGrid>
        </ContainerStyled>
      </>
    );
  }
};

export default PatientPage;