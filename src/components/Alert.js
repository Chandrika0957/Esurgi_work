import { Snackbar } from '@mui/material';
import React from 'react'
import { useRoleState } from '../PatientContext'
import MuiAlert from '@mui/material/Alert';

const Alert = () => {
   const {alert, setAlert} = useRoleState();

   const handleClose = (event, reason) => {
      if (reason === 'clickaway') {
         return;
      }

      setAlert({open: false});
   };

   return (
   <Snackbar
      open={alert.open}
      autoHideDuration={3000}
      onClose={handleClose}
      >
      <MuiAlert
         onClose={handleClose}
         elevation={10}
         variant="filled"
         severity={alert.type}
      >
         {alert.message}
      </MuiAlert>
      </Snackbar>
   );
}

export default Alert