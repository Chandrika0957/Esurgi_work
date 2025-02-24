import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useRoleState } from "../PatientContext";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from 'firebase/auth';

// Styled components
const Container = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  backgroundColor: "white",
}));

const Logo = styled("img")(({ theme }) => ({
  width: 100,
  marginBottom: theme.spacing(4),
}));

const Form = styled("form")(({ theme }) => ({
  width: "100%",
  maxWidth: 400,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}));

const Input = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: "100%",
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
  },
}));

const ButtonGroup = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  width: "100%",
  marginTop: 16,
});

const BackButtonStyled = styled(Button)(({ theme }) => ({
  width: "48%",
  height: 40,
  borderRadius: 8,
  textTransform: "none",
  backgroundColor: "rgb(230, 245, 245)",
  color: "rgb(0, 113, 115)",
  "&:hover": {
    backgroundColor: "rgb(230, 245, 245)",
    color: "rgb(0, 113, 115)",
  },
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  width: "48%",
  height: 40,
  borderRadius: 8,
  textTransform: "none",
  backgroundColor: "rgb(0, 113, 115)",
  color: "white",
  "&:hover": {
    backgroundColor: "rgb(0, 113, 115)",
    color: "white",
  },
}));

const Register = () => {
  const { setAlert } = useRoleState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    createUserWithEmailAndPassword(auth, email, password)
    .then((res)=>{
      setAlert({
        open: true,
        message: `Successfully registered! Welcome ${res.user.email}`,
        type: "success",
      });
      setError("");
    })
    .catch((error)=>{
      if (error.code === 'auth/invalid-email') {
        setError("Invalid email. Please try again.");
      } else if (error.code === 'auth/email-already-in-use') {
        setError("Email already in use.");
      } else if (error.code === 'auth/invalid-password') {
        setError("Invalid password. Must be a string of at least 6 characters");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.log(error.code);
      console.log(error.message);
    })
  };

  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container>
      <Logo src="/Esurgi-01.png" alt="Esurgi Logo" />
      <Form onSubmit={handleSubmit}>
        <Input
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          variant="outlined"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleShowPassword}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Input
          label="Confirm Password"
          variant="outlined"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        {error && <Typography color="error">{error}</Typography>}
        <ButtonGroup>
          <BackButtonStyled variant="contained" component={Link} to="/">
            Back
          </BackButtonStyled>
          <SubmitButton variant="contained" type="submit">
            Register
          </SubmitButton>
        </ButtonGroup>
      </Form>
    </Container>
  );
};

export default Register;
