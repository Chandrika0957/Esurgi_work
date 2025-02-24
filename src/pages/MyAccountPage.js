import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Typography,
  Button,
  CircularProgress,
  styled,
} from "@mui/material";
import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/database";
import "firebase/compat/storage";
import firebaseConfig from "../config/firebaseConfig";
import Header from "../components/Header";

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const MyAccountContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  width: "100%",
  gap: "20px",
});

const TitleTypography = styled(Typography)(({ theme }) => ({
  color: "rgb(0,113,115)",
  fontFamily: "Montserrat",
  fontWeight: "bold",
}));

const InfoTypography = styled(Typography)(({ theme }) => ({
  color: "#000",
  fontFamily: "Montserrat",
  fontWeight: "bold",
}));

const TextFieldContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  margin: "20px 0px"
});

const TextFieldLabel = styled("div")({
  fontWeight: "bold",
  color: "black",
  fontSize: "20px",
});

const AccountButtonGroup = styled("div")({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  gap: "30px",
  margin: "20px 0px",
});

const AccountButton = styled("Button")({
  width: "25%",
  height: 40,
  borderRadius: 8,
  fontFamily: "Montserrat",
  backgroundColor: "rgb(0, 113, 115)",
  color: "white",
  cursor: "pointer",
});

const ProfilePictureContainer = styled("div")({
  display: "flex",
  justifyContent: "center",
});

const ProfilePictureImage = styled("img")({
  width: "200px",
  height: "200px",
  border: "2px solid black",
  borderRadius: "50%",
});

const LoadingSpinner = (props) => <CircularProgress {...props} sx={{ m: 3 }} />;

const MyAccountPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [error, setError] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const getCurrentUser = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return () => getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const db = firebase.database();
        const usersRef = db.ref("users");

        const snapshot = await usersRef.once("value");
        const users = snapshot.val();
        const userData = users[currentUser.uid];
        if (userData) {
          setUserInfo(userData);
          setPhone(userData?.phone);
          setAddress(userData?.address);
          setProfilePictureUrl(userData?.profilePicture);
        } else {
          setError("User data not found");
        }
        setLoading(false);
      } catch (error) {
        setError("Error fetching user data");
        setLoading(false);
      }
    };

    fetchUserInfo();
    return () => {
      const db = firebase.database();
      const usersRef = db.ref("users");
      usersRef.off();
    };
  }, [currentUser]);

  const handleNewInformation = async () => {
    try {
      const updatedData = {
        phone: phone || "",
        address: address || "",
      };
      const db = firebase.database();
      const userRef = db.ref(`users/${currentUser.uid}`);

      await userRef.update(updatedData);
      setEditing(false);
      setError(null);
    } catch (error) {
      console.error("Error updating user info:", error);
      setError(error.message);
    }
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePictureUrl(reader.result);
      reader.readAsDataURL(file);

      setLoading(true);
      const storageRef = firebase.storage().ref();
      const userImageRef = storageRef.child(
        `profilePictures/${currentUser.uid}/${file.name}`
      );

      try {
        await userImageRef.put(file);
        const imageUrl = await userImageRef.getDownloadURL();
        await firebase.database().ref(`users/${currentUser.uid}`).update({
          profilePicture: imageUrl,
        });
      } catch (error) {
        console.error("Error uploading image: ", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <MyAccountContainer>
        <Header />
        <TitleTypography variant="h5">My Account</TitleTypography>

        <div>
          <InfoTypography variant="h6">
            Name: {userInfo?.firstName} {userInfo?.lastName}
          </InfoTypography>
          <InfoTypography variant="h6">Email: {userInfo?.email}</InfoTypography>
          {editing ? (
            <div>
              <TextFieldContainer>
                <TextFieldLabel>Enter New Phone Number:</TextFieldLabel>
                <TextField
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  fullWidth
                  variant="outlined"
                />
              </TextFieldContainer>

              <TextFieldContainer>
                <TextFieldLabel>Enter New Address:</TextFieldLabel>
                <TextField
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  fullWidth
                  variant="outlined"
                />
              </TextFieldContainer>


            </div>
          ) : (
            <div>
              <InfoTypography variant="h6">
                Phone Number: {phone}
              </InfoTypography>
              <InfoTypography variant="h6">Address: {address}</InfoTypography>
            </div>
          )}
          <InfoTypography variant="h6">
            User Type:
            {userInfo?.userType === "PT" ? "Physical Therapist" : "Patient"}
          </InfoTypography>
          <InfoTypography variant="h6">
            User Id(Test Mode): {userInfo?.userID}
          </InfoTypography>
          {editing ? (
            <AccountButtonGroup>
              <AccountButton variant="contained" onClick={handleNewInformation}>
                Save
              </AccountButton>
              <AccountButton
                variant="outlined"
                onClick={() => setEditing(false)}
              >
                Cancel
              </AccountButton>
            </AccountButtonGroup>
          ) : (
            <div>
              <AccountButtonGroup>
                <AccountButton
                  variant="contained"
                  onClick={() => setEditing(true)}
                >
                  Edit Information
                </AccountButton>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                <AccountButton
                  variant="contained"
                  color="primary"
                  onClick={handleButtonClick}
                >
                  Upload Picture
                </AccountButton>
              </AccountButtonGroup>

              {profilePictureUrl && (
                <ProfilePictureContainer>
                  <ProfilePictureImage src={profilePictureUrl} alt="Logo" />
                </ProfilePictureContainer>
              )}
            </div>
          )}
        </div>
      </MyAccountContainer>
    </>
  );
};

export default MyAccountPage;
