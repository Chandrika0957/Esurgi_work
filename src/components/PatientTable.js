import React, { useState } from "react";
import Pagination from '@mui/material/Pagination';
import {
  Container,
  createTheme,
  TableCell,
  LinearProgress,
  ThemeProvider,
  Typography,
  TextField,
  TableBody,
  TableRow,
  TableHead,
  TableContainer,
  Table,
  Paper,
  styled
} from '@mui/material';
import { useNavigate } from "react-router-dom";
import { useRoleState } from "../PatientContext";
import { BsFillXCircleFill, BsFillPlusCircleFill } from "react-icons/bs";
import { ref, set, update } from "firebase/database";
import { db } from "../firebase";

export function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Styled components
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  backgroundColor: "#16171a",
  cursor: "pointer",
  "&:hover": {
    backgroundColor: "#131111",
  },
  fontFamily: "Montserrat",
}));

const StyledPagination = styled(Pagination)(({ theme }) => ({
  "& .MuiPaginationItem-root": {
    color: "rgb(0,113,115)",
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

export default function PatientsTable() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { symbol, patients, loading, patientlist, user, setAlert } = useRoleState();

  const navigate = useNavigate();

  const handleSearch = () => {
    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(search) ||
        patient.symbol.toLowerCase().includes(search)
    );
  };

  const inPatientlist = (patient) => {
    return patientlist.includes(patient?.id);
  }

  const addToPatientList = async (patient) => {
    const patientRef = ref(db, `patientlist/${user.uid}`);

    try {
      await update(patientRef, {
        patients: [...patientlist, patient?.id]
      });

      setAlert({
        open: true,
        message: `${patient.name} was added to patient list!`,
        type: "success",
      });
    } catch (error) {
      setAlert({
        open: true,
        message: error.message,
        type: "error",
      });
    }
  }

  const removeFromPatientlist = async (patient) => {
    const patientRef = ref(db, `patientlist/${user.uid}`);

    try {
      await update(patientRef, {
        patients: patientlist.filter((id) => id !== patient?.id)
      });

      setAlert({
        open: true,
        message: `${patient.name} was removed from patient list!`,
        type: "success",
      });
    } catch (error) {
      setAlert({
        open: true,
        message: error.message,
        type: "error",
      });
    }
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Container sx={{ textAlign: "center" }}>
        <Typography
          variant="h4"
          sx={{ margin: 2, fontFamily: "Montserrat" }}
        >
          List of Patients
        </Typography>
        <TextField
          label="Search For a Patient..."
          variant="outlined"
          sx={{ marginBottom: 2, width: "100%" }}
          onChange={(e) => setSearch(e.target.value)}
        />
        <TableContainer component={Paper}>
          {loading ? (
            <LinearProgress sx={{ backgroundColor: "gold" }} />
          ) : (
            <Table aria-label="simple table">
              <TableHead sx={{ backgroundColor: "rgb(0,113,115)" }}>
                <TableRow>
                  {["Name", "PT", "Last Monitored", "Location", "Add"].map((head) => (
                    <TableCell
                      sx={{
                        color: "black",
                        fontWeight: "700",
                        fontFamily: "Montserrat",
                      }}
                      key={head}
                      align={head === "Name" ? "left" : "right"}
                    >
                      {head}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {handleSearch()
                  .slice((page - 1) * 10, (page - 1) * 10 + 10)
                  .map((row) => {
                    const profit = row.price_change_percentage_24h > 0;
                    return (
                      <StyledTableRow
                        key={row.name}
                        onClick={() => navigate(`/patients/${row.id}`)}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{ display: "flex", gap: 2 }}
                        >
                          <img
                            src={row?.image}
                            alt={row.name}
                            height="50"
                            style={{ marginBottom: 10 }}
                          />
                          <div
                            style={{ display: "flex", flexDirection: "column" }}
                          >
                            <span
                              style={{
                                textTransform: "uppercase",
                                fontSize: 22,
                              }}
                            >
                              {row.symbol}
                            </span>
                            <span style={{ color: "darkgrey" }}>
                              {row.name}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell align="right">
                          {symbol}{" "}
                          {numberWithCommas(row.current_price.toFixed(2))}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color: profit ? "rgb(14, 203, 129)" : "red",
                            fontWeight: 500,
                          }}
                        >
                          {profit && "+"}
                          {row.price_change_percentage_24h.toFixed(2)}%
                        </TableCell>
                        <TableCell align="right">
                          {symbol}{" "}
                          {numberWithCommas(
                            row.market_cap.toString().slice(0, -6)
                          )}
                          M
                        </TableCell>
                        <TableCell align="right">
                          {
                            !inPatientlist(row) ? 
                              <BsFillPlusCircleFill
                                style={{
                                  fontSize: 25,
                                  color: "green",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click event
                                  addToPatientList(row);
                                }}
                              />
                              :
                              <BsFillXCircleFill
                                style={{
                                  fontSize: 25,
                                  color: "red",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click event
                                  removeFromPatientlist(row);
                                }}  
                              />
                          }
                        </TableCell>
                      </StyledTableRow>
                    );
                  })}
              </TableBody>
            </Table>
          )}
        </TableContainer>

        <StyledPagination
          count={Math.ceil(handleSearch()?.length / 10)}
          sx={{
            padding: 2,
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
          onChange={(_, value) => {
            setPage(value);
            window.scroll(0, 450);
          }}
        />
      </Container>
    </ThemeProvider>
  );
}
