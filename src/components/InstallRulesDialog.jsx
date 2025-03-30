// InstallRulesDialog.jsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

export default function InstallRulesDialog({
  open,
  onClose,
  requests,
  onInstall,
  loading,
}) {
  // Local state for filtering and selection
  const [filterText, setFilterText] = useState("");
  const [selectionModel, setSelectionModel] = useState([]);

  // Only show approved requests and then filter based on filterText.
  const filteredRequests = requests
    .filter((request) => request.status === "approved")
    .filter((request) =>
      Object.values(request).some((val) =>
        String(val).toLowerCase().includes(filterText.toLowerCase())
      )
    );

  // Define DataGrid columns with a renderCell for status
  const columns = [
    { field: "id", headerName: "ID", width: 300 },
    { field: "requester_name", headerName: "Requester", flex: 1 },
    { field: "source_ip", headerName: "Source IP", flex: 1 },
    { field: "destination_ip", headerName: "Destination IP", flex: 1 },
    { field: "port", headerName: "Port", flex: 1 },
    { field: "protocol", headerName: "Protocol", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => {
        // Ensure the status is capitalized
        const status = params.value;
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : "";
      },
    },
  ];

  // When installing, filter the requests based on the selected IDs
  const handleInstall = () => {
    const selectedRequests = requests.filter((req) =>
      selectionModel.includes(req.id)
    );
    onInstall(selectedRequests);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xl">
      <DialogTitle>Install Selected Rules</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="Search requests..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          margin="normal"
        />
        <div style={{ height: 500, width: "100%" }}>
          <DataGrid
            rows={filteredRequests}
            columns={columns}
            checkboxSelection
            onRowSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
            rowSelectionModel={selectionModel}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleInstall}
          disabled={loading || selectionModel.length === 0}
        >
          {loading ? <CircularProgress size={24} /> : "Install Selected Rules"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
