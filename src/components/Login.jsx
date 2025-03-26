// components/Login.js
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Link,
  InputAdornment,
  Alert,
} from "@mui/material";
import { Shield, KeyRound, User as UserIcon } from "lucide-react";
import api from "../services/api";

export default function Login({ setUser, setPage }) {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");

  const onSubmit = async (data) => {
    try {
      const { token } = await api.login(data.username, data.password);
      const userData = await api.verify(token);
      setUser({ ...userData, token });
      localStorage.setItem("token", token);
      setPage(userData.role === "admin" ? "admin" : "user");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "95vh",
        backgroundColor: "#f9fafb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 4,
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 400, p: 3 }}>
        <CardContent>
          <Box sx={{ textAlign: "center", mb: 3 }}>
            <Shield size={48} color="#2563EB" />
            <Typography variant="h5" component="h2" sx={{ mt: 2, fontWeight: "bold" }}>
              Sign in to Firewall Manager
            </Typography>
          </Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              id="username"
              name="username"
              type="text"
              label="Username"
              placeholder="Enter your username"
              autoComplete="username"
              required
              margin="normal"
              {...register("username")}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <UserIcon size={20} color="#9CA3AF" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              margin="normal"
              {...register("password")}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <KeyRound size={20} color="#9CA3AF" />
                  </InputAdornment>
                ),
              }}
            />
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mt: 2,
              }}
            >
              <FormControlLabel control={<Checkbox color="primary" />} label="Remember me" />
              <Link
                href="#"
                underline="hover"
                sx={{ fontSize: "0.875rem", fontWeight: 500, color: "#2563EB" }}
              >
                Forgot your password?
              </Link>
            </Box>
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
              Sign in
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
