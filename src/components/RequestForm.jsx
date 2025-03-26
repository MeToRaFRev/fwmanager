// RequestForm.js
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  TextField,
  Button,
  Alert,
  AlertTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import { AlertCircle, CheckCircle, Globe } from "lucide-react";
import api from "../services/api";

// Regex for validating IP addresses and URLs
const ipRegex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}(\/([1-9]|[1-2]\d|3[0-2]))?$/;
const urlRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}$/;

const isValidIp = (value) => ipRegex.test(value);

export default function RequestForm({ user, onSuccess }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  // Watch values for the source and destination fields
  const sourceIpValue = watch("source_ip", "");
  const destinationIpValue = watch("destination_ip", "");

  // Handler that calls nslookup and updates the field with the resolved IP
  const handleNslookup = async (field) => {
    let domain = "";
    if (field === "source_ip") {
      domain = sourceIpValue;
    } else if (field === "destination_ip") {
      domain = destinationIpValue;
    }
    try {
      const res = await api.nslookup(domain);
      // Assume the API returns an object: { ip: "resolved-ip-address" }
      const ip = res.ip;
      setValue(field, ip);
    } catch (err) {
      console.error("NSLookup failed", err);
    }
  };

  const onSubmit = async (data) => {
    try {
      await api.createRequest(data, user.token);
      setSubmitted(true);
      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
      <TextField
        fullWidth
        label="Source IP"
        placeholder="e.g. 192.168.1.0/24 or example.com"
        margin="normal"
        {...register("source_ip", {
          required: "Source IP is required",
          validate: (value) => {
            if (isValidIp(value)) return true;
            return urlRegex.test(value) || "Please enter a valid IP address or URL";
          },
        })}
        error={Boolean(errors.source_ip)}
        helperText={errors.source_ip ? errors.source_ip.message : ""}
        InputProps={{
          endAdornment:
            !isValidIp(sourceIpValue) && sourceIpValue ? (
              <IconButton onClick={() => handleNslookup("source_ip")}>
                <Globe size={20} />
              </IconButton>
            ) : null,
        }}
      />

      <TextField
        fullWidth
        label="Destination IP"
        placeholder="e.g. 10.0.0.1 or example.com"
        margin="normal"
        {...register("destination_ip", {
          required: "Destination IP is required",
          validate: (value) => {
            if (isValidIp(value)) return true;
            return urlRegex.test(value) || "Please enter a valid destination IP or URL";
          },
        })}
        error={Boolean(errors.destination_ip)}
        helperText={errors.destination_ip ? errors.destination_ip.message : ""}
        InputProps={{
          endAdornment:
            !isValidIp(destinationIpValue) && destinationIpValue ? (
              <IconButton onClick={() => handleNslookup("destination_ip")}>
                <Globe size={20} />
              </IconButton>
            ) : null,
        }}
      />

      <TextField
        fullWidth
        label="Port"
        placeholder="e.g. 80 or 8000-8080"
        margin="normal"
        {...register("port", {
          required: "Port is required",
          validate: (value) => {
            const singlePortRegex = /^[0-9]{1,5}$/;
            const portRangeRegex = /^[0-9]{1,5}-[0-9]{1,5}$/;
            if (singlePortRegex.test(value) || portRangeRegex.test(value)) {
              return true;
            }
            return "Port must be a number or a valid range (e.g. 80 or 8000-8080)";
          },
        })}
        error={Boolean(errors.port)}
        helperText={errors.port ? errors.port.message : ""}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel id="protocol-label">Protocol</InputLabel>
        <Select
          labelId="protocol-label"
          label="Protocol"
          defaultValue="TCP"
          {...register("protocol", { required: "Protocol is required" })}
        >
          <MenuItem value="TCP">TCP</MenuItem>
          <MenuItem value="UDP">UDP</MenuItem>
          <MenuItem value="ICMP">ICMP</MenuItem>
        </Select>
      </FormControl>

      <TextField
        fullWidth
        label="Business Justification"
        placeholder="Please explain why this rule is needed"
        multiline
        rows={4}
        margin="normal"
        {...register("description", {
          required: "Business justification is required",
          minLength: {
            value: 5,
            message: "Justification must be at least 5 characters long",
          },
        })}
        error={Boolean(errors.description)}
        helperText={errors.description ? errors.description.message : ""}
      />

      <TextField
        fullWidth
        label="Username"
        value={user.username}
        disabled
        margin="normal"
        {...register("requester_name", { required: "Username is required" })}
        error={Boolean(errors.requester_name)}
        helperText={errors.requester_name ? errors.requester_name.message : ""}
      />

      <Button type="submit" variant="contained" fullWidth sx={{ mt: 3, mb: 2 }}>
        Submit Request
      </Button>

      {submitted && (
        <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircle size={20} />}>
          <AlertTitle>Success!</AlertTitle>
          Your firewall rule request has been submitted for review.
        </Alert>
      )}
      {error && (
        <Alert severity="error" icon={<AlertCircle size={20} />} sx={{ mb: 2, whiteSpace: "pre-line" }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
