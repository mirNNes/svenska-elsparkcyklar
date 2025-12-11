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
} from "@mui/material";
import { Link, useLocation } from "react-router-dom";

const drawerWidth = 240;

export default function Layout({ children }) {
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:767px)");

  const menu = [
    { text: "Dashboard", path: "/" },
    { text: "Cyklar", path: "/bikes" },
    { text: "Användare", path: "/users" },
    { text: "Städer", path: "/cities" },
    { text: "Resor", path: "/rides" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      {/* Topbar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            "@media (min-width:768px)": {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            },
          }}
        >
          <Typography variant="h6" noWrap>
            Admin
          </Typography>

          {/* Mobil */}
          {isMobile && (
            <Box
              sx={{
                display: "flex",
                gap: 1,
                overflowX: "auto",
                width: "100%",
              }}
            >
              {menu.map((item) => (
                <ListItemButton
                  key={item.text}
                  component={Link}
                  to={item.path}
                  selected={isActive(item.path)}
                  sx={{
                    flex: "0 0 auto",
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 9999,
                    bgcolor: isActive(item.path)
                      ? "rgba(255,255,255,0.2)"
                      : "transparent",
                  }}
                >
                  <ListItemText
                    primary={item.text}
                    disableTypography
                    sx={{ fontSize: "0.875rem" }}
                  />
                </ListItemButton>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Desktop */}
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
                <ListItemText primary={item.text} />
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
          ...(isMobile
            ? { ml: 0 }
            : { ml: `${drawerWidth}px` }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
