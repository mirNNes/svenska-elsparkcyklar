import React, { useEffect, useState, useRef } from "react";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  AppBar,
  Typography,
  useMediaQuery,
  Button,
  Tabs,
  Tab,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { io } from 'socket.io-client';

const drawerWidth = 240;
export const BikeUpdatesContext = React.createContext({});

export default function Layout({ children, onLogout, accessToken, user }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:767px)");
  // true om man står på /login-sidan
  const isLogin = location.pathname === "/login";

  const [bikeUpdates, setBikeUpdates] = useState({});
  const socketRef = useRef(null);

  const menu = [
    { text: "Dashboard", path: "/" },
    { text: "Cyklar", path: "/bikes" },
    { text: "Användare", path: "/users" },
    { text: "Städer", path: "/cities" },
    { text: "Resor", path: "/rides" },
  ];

  const isActive = (path) => location.pathname === path;
  const currentIndex = menu.findIndex((item) => item.path === location.pathname);
  const tabValue = currentIndex === -1 ? 0 : currentIndex;

  useEffect(() => {
    // Koppla inte upp socket förrän man är inloggade
    if (!accessToken || isLogin) return;

    // Ta bort /api från VITE_API_URL för att få ren backend-bas-URL
    const API_BASE = import.meta.env.VITE_API_URL.replace('/api', '');
    socketRef.current = io(API_BASE, {
      // Skicka med JWT-token som auth-info till Socket.IO-servern
      auth: { token: accessToken }
    });

  socketRef.current.on("bike-batch-update", (payload) => {
    if (!payload || !Array.isArray(payload.bikes)) return;

    setBikeUpdates(prev => {
      const next = { ...prev };

      for (const bike of payload.bikes) {
        if (bike?.id == null) continue;
        next[bike.id] = bike;
      }

      return next;
    });
  });

    return () => {
      if (socketRef.current) {
        socketRef.current.off("bike-batch-update");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [accessToken, isLogin]);

  if (isLogin) {
    return <Box sx={{ minHeight: "100vh" }}>{children}</Box>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      {/* Topbar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            gap: 1,
            background: "linear-gradient(135deg, #192590, #5e95f8)",
            "@media (min-width:768px)": {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            },
          }}
        >
          {/* Rad 1: Admin + Logga ut */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Typography
              variant="h6"
              noWrap
              sx={{
                flexShrink: 0,
                maxWidth: "60%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontSize: "1.5rem",
              }}
            >
              Admin {user?.email ? `(${user.email})` : ''}
            </Typography>

            {onLogout && (
              <Button
                color="inherit"
                size="small"
                onClick={onLogout}
                sx={{
                  whiteSpace: "nowrap",
                  fontSize: "1rem",
                  textTransform: "none",
                  backgroundColor: "transparent",
                  "&:hover": {
                    backgroundColor: "transparent",
                    transform: "scale(1.1)",
                  },
                }}
              >
                Logga ut
              </Button>
            )}
          </Box>

          {/* Rad 2: Tabs-meny på mobil */}
          {isMobile && (
            <Tabs
              value={tabValue}
              onChange={(_, newIndex) => navigate(menu[newIndex].path)}
              variant="scrollable"
              scrollButtons
              allowScrollButtonsMobile
              aria-label="Admin navigation"
              textColor="inherit"
              indicatorColor="secondary"
              sx={{
                minHeight: 40,
                "& .MuiTabs-indicator": {
                  background: "linear-gradient(135deg, #192590, #5e95f8)",
                },
                "& .MuiTab-root": {
                  fontSize: "0.85rem",
                  textTransform: "none",
                  minHeight: 40,
                  paddingX: 1.5,
                },
                "& .MuiTab-root.Mui-selected": {
                  color: "inherit",
                  backgroundColor: "transparent",
                },
                "& .MuiTab-root:hover": {
                  backgroundColor: "transparent",
                },
              }}
            >
              {menu.map((item) => (
                <Tab key={item.path} label={item.text} />
              ))}
            </Tabs>
          )}
        </Toolbar>
      </AppBar>

      {/* Desktop-sidebar */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          <Toolbar />
          <List>
            {menu.map((item) => (
              <ListItemButton
                key={item.text}
                component={Link}
                to={item.path}
                selected={isActive(item.path)}
                sx={{
                  "&.Mui-selected": {
                    bgcolor: "rgba(0,0,0,0.08)",
                  },
                }}
              >
                <ListItemText
                  primary={item.text}
                  disableTypography
                  sx={{ fontSize: "1.1rem" }}
                />
              </ListItemButton>
            ))}
          </List>
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          overflow: "auto",
        }}
      >
        {/* Gör socket-uppdateringar tillgängliga för alla sidor */}
        <BikeUpdatesContext.Provider value={bikeUpdates}>
          {React.Children.map(children, child =>
            React.cloneElement(child, { bikeUpdates })
          )}
        </BikeUpdatesContext.Provider>
      </Box>
    </Box>
  );
}
