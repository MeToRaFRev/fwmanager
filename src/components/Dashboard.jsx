// components/Dashboard.js
import React, { useState, useEffect, useMemo } from "react";
import { format, differenceInDays } from "date-fns";
import {
    Container,
    Box,
    Card,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    IconButton,
} from "@mui/material";
import { CheckCircle, XCircle } from "lucide-react";
import api from "../services/api";

export default function Dashboard({ user, refresh }) {
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [reviewNotes, setReviewNotes] = useState("");
    const [showReviewDialog, setShowReviewDialog] = useState(false);

    // States for filtering
    const [searchQuery, setSearchQuery] = useState("");
    // Use an array to hold selected statuses. Initially all are selected.
    const [statusFilters, setStatusFilters] = useState(["pending", "approved", "rejected"]);

    useEffect(() => {
        loadRequests();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refresh]);

    const loadRequests = async () => {
        try {
            const data = await api.getRequests(user.token);
            setRequests(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReview = async (status) => {
        try {
            await api.updateRequest(
                selectedRequest.id,
                { status, reviewer_notes: reviewNotes },
                user.token
            );
        } catch (err) {
            console.error(err);
        }
        setShowReviewDialog(false);
        setSelectedRequest(null);
        setReviewNotes("");
        loadRequests();
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "pending":
                return (
                    <Chip
                        label="Pending"
                        variant="outlined"
                        sx={{
                            backgroundColor: "#FFFBEB", // bg-yellow-50
                            color: "#B45309",          // text-yellow-700
                            borderColor: "#FEF3C7",     // border-yellow-200
                        }}
                    />
                );
            case "approved":
                return (
                    <Chip
                        label="Approved"
                        variant="outlined"
                        sx={{
                            backgroundColor: "#ECFDF5", // bg-green-50
                            color: "#047857",           // text-green-700
                            borderColor: "#BBF7D0",      // border-green-200
                        }}
                    />
                );
            case "rejected":
                return (
                    <Chip
                        label="Rejected"
                        variant="outlined"
                        sx={{
                            backgroundColor: "#FEF2F2", // bg-red-50
                            color: "#B91C1C",          // text-red-700
                            borderColor: "#FEE2E2",     // border-red-200
                        }}
                    />
                );
            default:
                return null;
        }
    };

    const formatDateRelative = (dateStr) => {
        const dateObj = new Date(dateStr);
        const diffDays = differenceInDays(new Date(), dateObj);
        const timeString = format(dateObj, "HH:mm");
        if (diffDays < 30) {
            return diffDays === 0
                ? `Today, ${timeString}`
                : `${diffDays} day${diffDays === 1 ? "" : "s"} ago, ${timeString}`;
        }
        return format(dateObj, "MMM d, yyyy, HH:mm");
    };

    // Toggle chip selection for status filtering
    const toggleStatusFilter = (status) => {
        if (statusFilters.includes(status)) {
            setStatusFilters(statusFilters.filter((s) => s !== status));
        } else {
            setStatusFilters([...statusFilters, status]);
        }
    };

    const getFilterChipSx = (status, active) => {
        if (status === "pending") {
            return active
                ? {
                      backgroundColor: "#fceba563", // bg-yellow-50
                      color: "#B45309",           // text-yellow-700
                      borderColor: "#FEF3C7",      // border-yellow-200
                  }
                : {
                    backgroundColor: "#4b4b4b3a",
                    color: "#979797",
                      borderColor: "#FEF3C7",
                  };
        } else if (status === "approved") {
            return active
                ? {
                      backgroundColor: "#ccfce6cc", // bg-green-50
                      color: "#047857",           // text-green-700
                      borderColor: "#BBF7D0",      // border-green-200
                  }
                : {
                    backgroundColor: "#4b4b4b3a",
                    color: "#979797",
                      borderColor: "#BBF7D0",
                  };
        } else if (status === "rejected") {
            return active
                ? {
                      backgroundColor: "#FEF2F2", // bg-red-50
                      color: "#B91C1C",           // text-red-700
                      borderColor: "#FEE2E2",      // border-red-200
                  }
                : {
                      backgroundColor: "#4b4b4b3a",
                      color: "#979797",
                      borderColor: "#FEE2E2",
                  };
        }
    };

    // Filter and sort requests
    const filteredAndSortedRequests = useMemo(() => {
        // Filter based on search query and status filters
        let filtered = requests.filter((r) => {
            const searchStr = (
                r.id +
                " " +
                r.requester_name +
                " " +
                r.source_ip +
                " " +
                r.destination_ip +
                " " +
                (r.description || "")
            ).toLowerCase();
            const matchesSearch = searchStr.includes(searchQuery.toLowerCase());
            // If no statuses are selected, no request is shown.
            const matchesStatus = statusFilters.includes(r.status.toLowerCase());
            return matchesSearch && matchesStatus;
        });

        // Sort: pending requests always on top; then sort by updatedAt (or createdAt) descending
        filtered.sort((a, b) => {
            if (a.status === "pending" && b.status !== "pending") return -1;
            if (a.status !== "pending" && b.status === "pending") return 1;
            const aTime = new Date(a.updatedAt || a.createdAt).getTime();
            const bTime = new Date(b.updatedAt || b.createdAt).getTime();
            return bTime - aTime;
        });

        return filtered;
    }, [requests, searchQuery, statusFilters]);

    return (
        <Box sx={{ py: 6, px: { xs: 2, sm: 4, lg: 8 } }}>
            <Container maxWidth="xl">
                {/* Filters */}
                <Box sx={{ display: "flex", flexDirection: "column", mb: 2, gap: 2 }}>
                    <TextField
                        label="Search"
                        placeholder="Search by name, IP, or description"
                        variant="outlined"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {/* Toggle chips for status filtering */}
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <Chip
                            label="Pending"
                            onClick={() => toggleStatusFilter("pending")}
                            sx={getFilterChipSx("pending", statusFilters.includes("pending"))}
                        />
                        <Chip
                            label="Approved"
                            onClick={() => toggleStatusFilter("approved")}
                            sx={getFilterChipSx("approved", statusFilters.includes("approved"))}
                        />
                        <Chip
                            label="Rejected"
                            onClick={() => toggleStatusFilter("rejected")}
                            sx={getFilterChipSx("rejected", statusFilters.includes("rejected"))}
                        />
                    </Box>
                </Box>

                <Card variant="outlined">
                    <Box sx={{ overflowX: "auto" }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Updated At</TableCell>
                                    <TableCell>Requester</TableCell>
                                    <TableCell>Source IP</TableCell>
                                    <TableCell>Destination IP</TableCell>
                                    <TableCell>Port/Protocol</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredAndSortedRequests.map((request) => (
                                    <TableRow key={request.id}>
                                        <TableCell>
                                            {formatDateRelative(request.updatedAt || request.createdAt)}
                                        </TableCell>
                                        <TableCell>
                                            <Box>
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {request.requester_name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {request.requester_email || ""}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>{request.source_ip}</TableCell>
                                        <TableCell>{request.destination_ip}</TableCell>
                                        <TableCell>
                                            {request.port}/{request.protocol}
                                        </TableCell>
                                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                                        <TableCell>
                                            {user.role === "admin" ? (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setShowReviewDialog(true);
                                                    }}
                                                >
                                                    {request.status === "pending" ? "Review" : "View"}
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setShowReviewDialog(true);
                                                    }}
                                                >
                                                    View
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {filteredAndSortedRequests.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            No requests found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Box>
                </Card>

                {/* Dialog for reviewing/viewing an existing request */}
                <Dialog
                    open={showReviewDialog}
                    onClose={() => setShowReviewDialog(false)}
                    fullWidth
                    maxWidth="sm"
                >
                    <DialogTitle sx={{ m: 0, p: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                                {user.role === "admin" && selectedRequest?.status === "pending"
                                    ? "Review Firewall Rule Request"
                                    : "View Firewall Rule Request"}
                            </Typography>
                            <IconButton onClick={() => setShowReviewDialog(false)}>
                                <XCircle size={20} />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers>
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Source IP"
                                    value={selectedRequest?.source_ip || ""}
                                    fullWidth
                                    disabled
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Destination IP"
                                    value={selectedRequest?.destination_ip || ""}
                                    fullWidth
                                    disabled
                                    variant="outlined"
                                />
                            </Grid>
                        </Grid>
                        <TextField
                            label="Port/Protocol"
                            value={`${selectedRequest?.port || ""}/${selectedRequest?.protocol || ""}`}
                            fullWidth
                            disabled
                            variant="outlined"
                            margin="normal"
                        />
                        <TextField
                            label="Business Justification"
                            value={selectedRequest?.description || ""}
                            fullWidth
                            disabled
                            multiline
                            rows={3}
                            variant="outlined"
                            margin="normal"
                        />
                        <TextField
                            label="Review Notes"
                            value={reviewNotes}
                            onChange={(e) => setReviewNotes(e.target.value)}
                            placeholder="Add your review notes here..."
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            margin="normal"
                            disabled={user.role !== "admin" || selectedRequest?.status !== "pending"}
                        />
                    </DialogContent>
                    {user.role === "admin" && selectedRequest?.status === "pending" && (
                        <DialogActions>
                            <Button
                                variant="outlined"
                                onClick={() => handleReview("rejected")}
                                sx={{
                                    backgroundColor: "#FEE2E2",
                                    color: "#B91C1C",
                                    borderColor: "#FCA5A5",
                                }}
                                startIcon={<XCircle size={16} />}
                            >
                                Reject
                            </Button>
                            <Button
                                variant="contained"
                                onClick={() => handleReview("approved")}
                                sx={{ backgroundColor: "#065F46", "&:hover": { backgroundColor: "#064e3b" } }}
                                startIcon={<CheckCircle size={16} />}
                            >
                                Approve
                            </Button>
                        </DialogActions>
                    )}
                </Dialog>
            </Container>
        </Box>
    );
}
