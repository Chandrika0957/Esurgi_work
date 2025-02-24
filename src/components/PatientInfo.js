import React, { useEffect, useState } from 'react';
import { CircularProgress, createTheme, ThemeProvider, styled } from '@mui/material';
import { Line } from 'react-chartjs-2';
import axios from "axios";
import {
   Chart as ChartJS,
   CategoryScale,
   LinearScale,
   PointElement,
   LineElement,
   Title,
   Tooltip,
   Legend,
} from 'chart.js';
import { chartDays } from '../config/data';
import SelectButton from './SelectButton';
import { HistoricalChart } from '../config/api';

ChartJS.register(
   CategoryScale,
   LinearScale,
   PointElement,
   LineElement,
   Title,
   Tooltip,
   Legend
);

// Styled components using MUI's `styled` utility
const Container = styled('div')(({ theme }) => ({
   width: "75%",
   display: "flex",
   flexDirection: "column",
   alignItems: "center",
   justifyContent: "center",
   marginTop: 25,
   padding: 40,
   [theme.breakpoints.down("md")]: {
      width: "100%",
      marginTop: 0,
      padding: 20,
      paddingTop: 0,
   },
}));

const darkTheme = createTheme({
   palette: {
      primary: {
         main: "#fff",
      },
      mode: "dark",
   },
});

const PatientInfo = ({ patient }) => {
   const [historicData, setHistoricData] = useState();
   const [days, setDays] = useState(1);

   const fetchHistoricData = async () => {
      const { data } = await axios.get(HistoricalChart(patient.id, days));
      setHistoricData(data);
   };

   useEffect(() => {
      fetchHistoricData();
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [days]);

   return (
      <ThemeProvider theme={darkTheme}>
         <Container>
            {
               !historicData ? (
                  <CircularProgress
                     sx={{ color: "rgb(0,113,115)" }}
                     size={250}
                     thickness={1}
                  />
               ) : (
                  <>
                     <Line
                        data={{
                           labels: historicData.map((patient) => {
                              let date = new Date(patient[0]);
                              let time = date.getHours() > 12
                                 ? `${date.getHours() - 12}:${date.getMinutes()}PM`
                                 : `${date.getHours()}:${date.getMinutes()}AM`;
                              return days === 1 ? time : date.toLocaleDateString();
                           }),
                           datasets: [
                              {
                                 data: historicData.map((patient) => patient[1]),
                                 label: `Price ( Past ${days} Days) in `,
                                 borderColor: "rgb(0,113,115)",
                              }
                           ]
                        }}
                        options={{
                           elements: {
                              point: {
                                 radius: 1,
                              },
                           },
                        }}
                     />
                     <div
                        style={{
                           display: "flex",
                           marginTop: 20,
                           justifyContent: "space-around",
                           width: "100%",
                        }}
                     >
                        {chartDays.map(day => (
                           <SelectButton
                              key={day.value}
                              onClick={() => setDays(day.value)}
                              selected={day.value === days}
                           >
                              {day.label}
                           </SelectButton>
                        ))}
                     </div>
                  </>
               )
            }
         </Container>
      </ThemeProvider>
   );
};

export default PatientInfo;
