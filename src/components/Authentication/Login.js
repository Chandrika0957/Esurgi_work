import { Box, Button, TextField } from '@mui/material';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react'
import { useRoleState } from '../../PatientContext';
import { auth } from '../../firebase';

const Login = ({ handleClose }) => {
   const [ email, setEmail ] = useState("");
   const [ password, setPassword ] = useState("");

   const { setAlert } = useRoleState();

   const handleSubmit = async () => {
      if (!email || !password) {
          setAlert({
              open: true,
              message: "Please fill out every field",
              type: "error"
          });
          return;
      }
  
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
          setAlert({
              open: true,
              message: "Please enter a valid email address",
              type: "error"
          });
          return;
      }
  
      try {
          const result = await signInWithEmailAndPassword(auth, email, password);
          console.log("jecekcmekc")
  
          setAlert({
              open: true,
              message: `Login successful! Welcome ${result.user.email}`,
              type: "success",
          });
  
          handleClose();
  
      } catch (error) {
          setAlert({
              open: true,
              message: error.message,
              type: "error",
          });
      }
  };
  

   return (
      <Box
         p={3}
         style={{ display: "flex", flexDirection: "column", gap: "20px"}}>
         <TextField
            variant="outlined"
            type="email"
            label="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
         />
         <TextField
            variant="outlined"
            type="password"
            label="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
         />
         <Button
            variant="contained"
            size="large"
            style= {{ backgroundColor: "rgb(0,113,115)"}}
            onClick={handleSubmit}
            >
            Login
         </Button>
      </Box>
   )
}

export default Login