import React from "react";
import {
  AppBar,
  Container,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  styled,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { useRoleState } from "../PatientContext";
import UserSidebar from "./Authentication/UserSidebar";

const navdrawerSymbol = `${process.env.PUBLIC_URL}/navdrawersymbol.png`;
const BiostabilizerLogo = `${process.env.PUBLIC_URL}/EsurgiIcon.png`;

// Styled components using MUI's `styled` utility
const TitleTypography = styled(Typography)(({ theme }) => ({
  flex: 1,
  color: "rgb(0,113,115)",
  fontFamily: "Montserrat",
  fontWeight: "bold",
  textAlign: "center",
}));

const NavDrawer = styled(Drawer)(({ theme }) => ({
  "& .MuiPaper-root": {
    width: 240,
    backgroundColor: "#007173",
    color: "#fff",
  },
}));

const NavDrawerImage = styled("img")(({ theme }) => ({
  width: "100%",
  height: 160,
  objectFit: "contain",
  marginBottom: theme.spacing(2),
}));

const Header = () => {
  const navigate = useNavigate();
  const { user } = useRoleState();
  const [navDrawerOpen, setNavDrawerOpen] = React.useState(false);

  const handleNavDrawerOpen = () => {
    setNavDrawerOpen(true);
  };

  const handleNavDrawerClose = () => {
    setNavDrawerOpen(false);
  };

  const pages = [
    { label: "Homepage", path: "/homepage" },
    { label: "Exercises", path: "/exercises" },
    { label: "Patients", path: "/patients/:id" },
    { label: "Calendar", path: "/calendar" },
    { label: "Biostabilizer", path: "/biostabilizer" },
    { label: "My Account", path: "/my-account" },
    { label: "Order Biostabilizer for Patient Home Use", path: "/cpt" },
    { label: "Settings", path: "/settings" },
    { label: "Appointment", path: "/appointment" },
  ];

  return (
    <ThemeProvider
      theme={createTheme({
        palette: { primary: { main: "#fff" }, mode: "dark" },
      })}
    >
      <AppBar color="transparent" position="static">
        <Container maxWidth={false}>
          <Toolbar>
            <IconButton edge="start" onClick={handleNavDrawerOpen}>
              <img src={navdrawerSymbol} alt="Nav Drawer Symbol" />
            </IconButton>
            <TitleTypography variant="h6">
              <span
                onClick={() => navigate("/homepage")}
                style={{ cursor: "pointer" }}
              >
                Esurgi Biostabilizer
              </span>
            </TitleTypography>
            {user && <UserSidebar />}
          </Toolbar>
        </Container>
      </AppBar>
      <NavDrawer
        anchor="left"
        open={navDrawerOpen}
        onClose={handleNavDrawerClose}
      >
        <List>
          <ListItem>
            <NavDrawerImage src={BiostabilizerLogo} alt="Biostabilizer Logo" />
          </ListItem>
          {pages.map((page) => (
            <ListItem key={page.label} button component={Link} to={page.path}>
              <ListItemText primary={page.label} />
            </ListItem>
          ))}
        </List>
      </NavDrawer>
    </ThemeProvider>
  );
};

export default Header;