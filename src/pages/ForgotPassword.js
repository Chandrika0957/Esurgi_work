import React, { useState } from "react";
import { Button, TextField, Typography, Container } from "@mui/material";
import { useRoleState } from "../PatientContext";
import { styled } from "@mui/material/styles";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import { sendPasswordResetEmail } from 'firebase/auth';

// Styled components
const ContainerStyled = styled(Container)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  backgroundColor: "white",
}));

const FormStyled = styled("form")({
  width: "100%",
  maxWidth: 400,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const InputStyled = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  width: "100%",
  "& .MuiOutlinedInput-root": {
    borderRadius: 8,
  },
}));

const ButtonStyled = styled(Button)(({ theme }) => ({
  width: "100%",
  height: 40,
  borderRadius: 8,
  textTransform: "none",
  marginTop: theme.spacing(2),
  backgroundColor: "rgb(0, 113, 115)",
  color: "white",
  "&:hover": {
    backgroundColor: "rgb(0, 113, 115)",
    color: "white",
  },
}));

const BackButtonStyled = styled(Button)(({ theme }) => ({
  width: "100%",
  height: 40,
  borderRadius: 8,
  textTransform: "none",
  marginTop: theme.spacing(2),
  backgroundColor: "rgb(230, 245, 245)",
  color: "rgb(0, 113, 115)",
  "&:hover": {
    backgroundColor: "rgb(230, 245, 245)",
    color: "rgb(0, 113, 115)",
  },
}));

const Title = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(3),
  fontSize: "1.6rem",
  fontWeight: "bold",
  textAlign: "center",
  color: "black",
}));

const Subtitle = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(6),
  fontSize: "1rem",
  color: "black",
  textAlign: "center",
}));

const ForgotPassword = () => {
  const { setAlert } = useRoleState();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    sendPasswordResetEmail(auth, email)
    .then(() => {
      setAlert({
        open: true,
        message: `An email has been sent to ${email} with instructions for resetting your password`,
        type: "success",
      });
      setError("");
    })
    .catch((error)=>{
      if (error.code === 'auth/invalid-email') {
        setError("Invalid email. Please try again.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.log(error.code);
      console.log(error.message);
    })
  };

  return (
    <ContainerStyled>
      <Title variant="h4">Forgot Your Password?</Title>
      <Subtitle variant="subtitle1">
        Enter your email to reset your password.
      </Subtitle>
      <FormStyled onSubmit={handleSubmit}>
        <InputStyled
          label="Email"
          variant="outlined"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <Typography color="error">{error}</Typography>}
        <ButtonStyled variant="contained" type="submit">
          Reset Password
        </ButtonStyled>
        <BackButtonStyled variant="contained" component={Link} to="/">
          Back
        </BackButtonStyled>
      </FormStyled>
    </ContainerStyled>
  );
};

export default ForgotPassword;
