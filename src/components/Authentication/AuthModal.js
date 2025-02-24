import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  styled,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useNavigate, Link } from "react-router-dom";
import { useRoleState } from "../../PatientContext";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase";
import { FcGoogle } from "react-icons/fc";
import { signInWithEmailAndPassword } from 'firebase/auth';

// Styled components
const Container = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "100vh",
  backgroundColor: "white",
});

const Logo = styled("img")(({ theme }) => ({
  width: 100,
  marginBottom: theme.spacing(4),
}));

const Form = styled("form")({
  width: "100%",
  maxWidth: 400,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

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

const ButtonStyled = styled(Button)(({ theme }) => ({
  width: "48%",
  height: 40,
  borderRadius: 8,
  textTransform: "none",
}));

const RegisterButton = styled(ButtonStyled)(({ theme }) => ({
  backgroundColor: "rgb(230, 245, 245)",
  color: "rgb(0, 113, 115)",
  "&:hover": {
    backgroundColor: "rgb(230, 245, 245)",
    color: "rgb(0, 113, 115)",
  },
}));

const SignInButton = styled(ButtonStyled)(({ theme }) => ({
  backgroundColor: "rgb(0, 113, 115)",
  color: "white",
  "&:hover": {
    backgroundColor: "rgb(0, 113, 115)",
    color: "white",
  },
}));

const ForgotPassword = styled(Typography)(({ theme }) => ({
  alignSelf: "flex-end",
  marginTop: theme.spacing(1),
  color: "grey",
  textDecoration: "none",
  fontSize: "0.8rem",
}));

const SocialLogin = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  marginTop: theme.spacing(4),
  gap: theme.spacing(2),
}));

const GoogleButton = styled(Button)(({ theme }) => ({
  border: "1px solid #ddd",
  borderRadius: "50%",
  height: 62.5,
  cursor: "pointer",
  outline: "none",
  "&:hover": {
    backgroundColor: "#f1f1f1",
  },
}));

const ErrorMessage = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  color: theme.palette.error.main,
}));

export default function AuthModal() {
  const navigate = useNavigate();
  const { setAlert } = useRoleState();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const googleProvider = new GoogleAuthProvider();

  const signInWithGoogle = () => {
    signInWithPopup(auth, googleProvider)
      .then((res) => {
        setAlert({
          open: true,
          message: `Sign up successful! Welcome ${res.user.email}`,
          type: "success",
        });
        navigate("/homepage");
      })
      .catch((error) => {
        setAlert({
          open: true,
          message: error.message,
          type: "error",
        });
      });
  };

  // const handleSignIn = () => {
  //   if (
  //     (email === "test_user@myesurgi.com" && password === "Test_password") ||
  //     (email === "dyllen@esurgi.net" && password === "One_Piece") ||
  //     (email === "pttestuser@esurgi.net" && password === "Test_password")
  //   ) {
  //     navigate("/homepage");
  //   } else {
  //     setError("Invalid email or password");
  //   }
  // };
  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
  
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/homepage");
    } catch (err) {
      if (err.code === 'auth/wrong-password') {
        setError("Incorrect password. Please try again.");
      } else if (err.code === 'auth/user-not-found') {
        setError("No user found with this email.");
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
      console.log("Sign-in error:", err.message);
    }
  };
  
  const handleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Container>
      <Logo src="/Esurgi-01.png" alt="Esurgi Logo" />
      <Form onSubmit={(e) => e.preventDefault()}>
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
        {error && <ErrorMessage>{error}</ErrorMessage>}
        <ButtonGroup>
          <RegisterButton variant="contained" component={Link} to="/register">
            Register
          </RegisterButton>
          <SignInButton variant="contained" onClick={handleSignIn}>
            Sign In
          </SignInButton>
        </ButtonGroup>
        <ForgotPassword component={Link} to="/forgot-password">
          Forgot Password?
        </ForgotPassword>
      </Form>
      <Typography sx={{ marginTop: 3, color: "grey", fontSize: "0.8rem" }}>
        Or, continue with:
      </Typography>
      <SocialLogin>
        <GoogleButton onClick={signInWithGoogle} aria-label="Google Sign-In" role="button">
          <FcGoogle size={28} />
        </GoogleButton>
      </SocialLogin>
    </Container>
  );
}