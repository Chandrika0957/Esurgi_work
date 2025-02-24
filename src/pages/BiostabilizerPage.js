import React, { useState, useEffect } from "react";
import { Typography, Button, CircularProgress, styled } from "@mui/material";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import firebaseConfig from "../config/firebaseConfig";
import Header from "../components/Header";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const DeviceContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
});

const DeviceStatus = styled("div")({
  display: "flex",
  alignItems: "center",
  margin: "50px",
});

const DevicesList = styled("div")({
  display: "flex",
  flexDirection: "column",
  marginTop: "20px",
  gap: "20px",
  width: "50%",
});

const DeviceItem = styled("div")({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "10px",
  border: "2px solid #ccc",
  borderRadius: "5px",
  width: "100%",
});

const TitleTypography = styled(Typography)(({ theme }) => ({
   color: "rgb(0,113,115)",
   fontFamily: "Montserrat",
   fontWeight: "bold",
 }));

const DeviceNameypography = styled(Typography)(({ theme }) => ({
   color: "rgb(0,113,115)",
   fontFamily: "Montserrat",
   fontWeight: "bold",
 }));

 const ConnectButton = styled("Button")({
  width: "25%",
  height: 40,
  borderRadius: 8,
  fontFamily: "Montserrat",
  backgroundColor: "rgb(0, 113, 115)",
  color: "white",
  cursor: "pointer",
});

 const ErrorTypography = styled(Typography)(({ theme }) => ({
   color: "red",
   marginTop: "20px",
 }));

const LoadingSpinner = (props) => <CircularProgress {...props} sx={{ m: 3 }} />;

const BiostabilizerPage = () => {
  const [deviceConnected, setDeviceConnected] = useState(false);
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const db = firebase.database();
        const devicesRef = db.ref("devices");
        const snapshot = await devicesRef.once("value");
        const devicesData = snapshot.val();

        if (devicesData) {
          const deviceList = Object.entries(devicesData).map(([id, data]) => ({
            id,
            ...data,
          }));
          setDevices(deviceList);
        } else {
          setDevices([]);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching devices:", error);
        setError("Failed to load devices");
        setLoading(false);
      }
    };

    fetchDevices();
    return () => {
      const db = firebase.database();
      const devicesRef = db.ref("devices");
      devicesRef.off();
    };
  }, []);

  const handleConnect = (deviceName) => {
    console.log(`User wants to connect to ${deviceName}`);
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  return (
    <>
      <DeviceContainer>
        <Header />
        <DeviceStatus>
          {deviceConnected ? (
            <Typography variant="h6" color="green">Device connected (✓)</Typography>
          ) : (
            <Typography variant="h6" color="red">
              Device not connected (X)
            </Typography>
          )}
        </DeviceStatus>
        <TitleTypography variant="h5">
          Available Devices
        </TitleTypography>
        {error ? (
          <ErrorTypography>{error}</ErrorTypography>
        ) : (
          <DevicesList>
            {devices.length > 0 ? (
              devices.map((device) => (
                <DeviceItem key={device.id}>
                  <DeviceNameypography>{device.name}</DeviceNameypography>
                  <ConnectButton
                    variant="contained"
                    onClick={() => handleConnect(device.name)}
                  >
                    Connect
                  </ConnectButton>
                </DeviceItem>
              ))
            ) : (
              <Typography>No devices available.</Typography>
            )}
          </DevicesList>
        )}
      </DeviceContainer>
    </>
  );
};

export default BiostabilizerPage;
