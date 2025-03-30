// App.js
import React, { useState, useEffect } from "react";
import { Shield, LogOut, LogIn, Plus, XCircle } from "lucide-react";
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Chip,
} from "@mui/material";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import RequestForm from "./components/RequestForm";
import api from "./services/api";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      api
        .verify(token)
        .then((userData) => {
          setUser({ ...userData, token });
        })
        .catch(() => {
          localStorage.removeItem("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
  };

  if (loading) return null;

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <AppBar position="static" elevation={1} sx={{ backgroundColor: "#fff", color: "inherit" }}>
        <Container maxWidth="lg">
          <Toolbar sx={{ justifyContent: "space-between", height: 64 }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Shield size={32} color="#2563EB" />
              <Typography variant="h6" sx={{ ml: 2, fontWeight: "bold", color: "#000" }}>
                Firewall Manager
              </Typography>
              {user?.username && <Chip label={user?.username} color="primary" sx={{ ml: 2 }} />}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {user && (
                <IconButton onClick={() => setShowRequestDialog(true)}>
                  <Plus size={20} />
                </IconButton>
              )}
              {user ? (
                <Button
                  onClick={handleLogout}
                  startIcon={<LogOut size={20} />}
                  variant="text"
                  sx={{ textTransform: "none" }}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  onClick={() => {}}
                  startIcon={<LogIn size={20} />}
                  variant="outlined"
                  sx={{ textTransform: "none" }}
                >
                  Sign In
                </Button>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      {user ? <Dashboard user={user} refresh={refresh} /> : <Login setUser={setUser} />}
      <Dialog
        open={showRequestDialog}
        onClose={() => setShowRequestDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              Submit Firewall Rule Request
            </Typography>
            <IconButton
              onClick={() => setShowRequestDialog(false)}
              sx={{ position: "absolute", top: 8, right: 8 }}
            >
              <XCircle size={20} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <RequestForm user={user} onSuccess={() => {
            setShowRequestDialog(false)
            setRefresh((prev) => !prev);
            }} />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
