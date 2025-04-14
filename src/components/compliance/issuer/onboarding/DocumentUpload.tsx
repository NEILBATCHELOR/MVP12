import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Alert,
} from "@mui/material";
import {
  Description as DescriptionIcon,
  FileUpload as FileUploadIcon,
  CloudUpload as CloudUploadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useIssuerOnboarding } from "./IssuerOnboardingContext";

const DocumentUpload: React.FC = () => {
  const { state, uploadDocument, nextStep, prevStep } = useIssuerOnboarding();
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDocumentSelect = (documentId: string) => {
    setSelectedDocumentId(documentId);
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && selectedDocumentId) {
      uploadDocument(selectedDocumentId, files[0]);
      setSelectedDocumentId(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case "uploaded":
        return <Chip label="Uploaded" color="success" size="small" icon={<CheckCircleIcon />} />;
      case "pending_review":
        return <Chip label="Pending Review" color="warning" size="small" icon={<WarningIcon />} />;
      case "verified":
        return <Chip label="Verified" color="info" size="small" icon={<CheckCircleIcon />} />;
      default:
        return <Chip label="Not Uploaded" color="default" size="small" />;
    }
  };

  const requiredDocsUploaded = state.documents
    .filter(doc => doc.required)
    .every(doc => doc.status !== "not_uploaded");

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Document Upload
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Provide essential information about your organization and upload required documents
      </Typography>

      {!requiredDocsUploaded && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Please upload all required documents to proceed.
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Certificate of Incorporation
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Chip label="Required" color="error" size="small" sx={{ mr: 1 }} />
                {getStatusChip(state.documents.find(d => d.id === "cert-incorp")?.status || "not_uploaded")}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Official document confirming the company's legal formation
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => handleDocumentSelect("cert-incorp")}
                fullWidth
              >
                {state.documents.find(d => d.id === "cert-incorp")?.status === "not_uploaded" ? "Upload Document" : "Replace Document"}
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Articles of Association
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Chip label="Required" color="error" size="small" sx={{ mr: 1 }} />
                {getStatusChip(state.documents.find(d => d.id === "articles")?.status || "not_uploaded")}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Document outlining the company's rules and regulations
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => handleDocumentSelect("articles")}
                fullWidth
              >
                {state.documents.find(d => d.id === "articles")?.status === "not_uploaded" ? "Upload Document" : "Replace Document"}
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                List of Directors
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Chip label="Required" color="error" size="small" sx={{ mr: 1 }} />
                {getStatusChip(state.documents.find(d => d.id === "directors")?.status || "not_uploaded")}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Official register of all company directors
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => handleDocumentSelect("directors")}
                fullWidth
              >
                {state.documents.find(d => d.id === "directors")?.status === "not_uploaded" ? "Upload Document" : "Replace Document"}
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Shareholder Register
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Chip label="Required" color="error" size="small" sx={{ mr: 1 }} />
                {getStatusChip(state.documents.find(d => d.id === "shareholders")?.status || "not_uploaded")}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Official register of all company shareholders
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => handleDocumentSelect("shareholders")}
                fullWidth
              >
                {state.documents.find(d => d.id === "shareholders")?.status === "not_uploaded" ? "Upload Document" : "Replace Document"}
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Latest Financial Statements
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                {getStatusChip(state.documents.find(d => d.id === "financial")?.status || "not_uploaded")}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Recent financial reports (balance sheet, income statement, etc.)
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => handleDocumentSelect("financial")}
                fullWidth
              >
                {state.documents.find(d => d.id === "financial")?.status === "not_uploaded" ? "Upload Document" : "Replace Document"}
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 3, height: "100%" }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Regulatory Status Documentation
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                {getStatusChip(state.documents.find(d => d.id === "regulatory")?.status || "not_uploaded")}
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Documentation confirming regulatory status or exemptions
              </Typography>
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => handleDocumentSelect("regulatory")}
                fullWidth
              >
                {state.documents.find(d => d.id === "regulatory")?.status === "not_uploaded" ? "Upload Document" : "Replace Document"}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 4, p: 3, backgroundColor: "#f9f9f9", borderRadius: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <FileUploadIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="subtitle1" fontWeight="bold">
            Document Upload Area
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select a document type first
        </Typography>
        
        <Box 
          sx={{ 
            border: '2px dashed #ccc', 
            borderRadius: 1, 
            p: 4, 
            textAlign: 'center',
            backgroundColor: '#fff'
          }}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
            accept=".pdf,.jpg,.png"
          />
          <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" gutterBottom>
            No file selected
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Accepted formats: PDF, JPG, PNG
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button
          variant="outlined"
          onClick={prevStep}
          sx={{ py: 1.5, px: 4 }}
        >
          Save & Exit
        </Button>
        <Button
          variant="contained"
          color="primary"
          size="large"
          sx={{ py: 1.5, px: 4, fontWeight: "bold" }}
          onClick={nextStep}
          disabled={!requiredDocsUploaded}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
};

export default DocumentUpload;