import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  Divider,
  Tabs,
  Tab,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  Alert,
} from "@mui/material";
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Gavel as GavelIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  ShieldOutlined as ShieldIcon,
} from "@mui/icons-material";
import { useIssuerOnboarding } from "./IssuerOnboardingContext";
import { COUNTRIES, JURISDICTIONS } from "../../../../utils/constants";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`compliance-tabpanel-${index}`}
      aria-labelledby={`compliance-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ComplianceDueDiligence: React.FC = () => {
  const { state, updateCompliance, nextStep, prevStep } = useIssuerOnboarding();
  const [tabValue, setTabValue] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateCompliance({ [name]: value });
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    updateCompliance({ [name]: checked });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Form validation
    const newErrors: Record<string, string> = {};
    
    if (!state.compliance.jurisdiction) {
      newErrors.jurisdiction = "Regulatory jurisdiction is required";
    }
    
    if (!state.compliance.riskDisclosureStatement) {
      newErrors.riskDisclosureStatement = "Risk disclosure statement is required";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTabValue(1); // Switch to the tab with errors
      return;
    }
    
    // If validation passes, proceed to next step
    nextStep();
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h6" gutterBottom>
        Compliance & Due Diligence
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Provide regulatory compliance information and complete due diligence requirements
      </Typography>

      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="compliance tabs"
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            "& .MuiTab-root": {
              py: 2,
            },
          }}
        >
          <Tab 
            label="Business Owners & UBO" 
            icon={<PersonIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Regulatory Information" 
            icon={<GavelIcon />} 
            iconPosition="start"
          />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: 2 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Business Owners & Ultimate Beneficial Owners
              </Typography>
              
              <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      John Smith
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      DOB: 1980-05-15
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Document: Passport
                    </Typography>
                  </Box>
                  <Box sx={{ ml: "auto", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                    <Typography variant="body2" color="text.secondary">
                      Nationality: United States
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: <Chip label="Uploaded" color="success" size="small" icon={<CheckCircleIcon />} />
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              
              <Paper variant="outlined" sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Add New Owner
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      Full Name
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="Enter full name"
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      Date of Birth
                    </Typography>
                    <TextField
                      fullWidth
                      type="date"
                      defaultValue="2025-04-04"
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      Nationality
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      placeholder="Select nationality"
                      variant="outlined"
                      size="small"
                    >
                      {COUNTRIES.map((country) => (
                        <MenuItem key={country.code} value={country.name}>
                          {country.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                      ID Document Type
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      value="Passport"
                      variant="outlined"
                      size="small"
                    >
                      <MenuItem value="Passport">Passport</MenuItem>
                      <MenuItem value="National ID">National ID</MenuItem>
                      <MenuItem value="Driver's License">Driver's License</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
                
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 3 }}
                >
                  Add Owner
                </Button>
              </Paper>
              
              <Box sx={{ mt: 4, p: 3, border: "1px dashed #ccc", borderRadius: 1, textAlign: "center" }}>
                <Typography variant="body2" gutterBottom>
                  Select an owner first
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No file selected
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Accepted formats: PDF, JPG, PNG
                </Typography>
                
                <Button
                  variant="contained"
                  color="primary"
                  disabled
                  sx={{ mt: 2 }}
                >
                  Upload Document
                </Button>
              </Box>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Regulatory Jurisdiction
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    id="jurisdiction"
                    name="jurisdiction"
                    value={state.compliance.jurisdiction}
                    onChange={handleChange}
                    error={!!errors.jurisdiction}
                    helperText={errors.jurisdiction}
                    variant="outlined"
                    placeholder="Select jurisdiction"
                    sx={{ mb: 3 }}
                  >
                    {JURISDICTIONS.map((jurisdiction) => (
                      <MenuItem key={jurisdiction.value} value={jurisdiction.value}>
                        {jurisdiction.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <ShieldIcon color="warning" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Issuer Risk Classification
                    </Typography>
                  </Box>
                  
                  <Card variant="outlined" sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" color="warning.main">
                        Medium Risk
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Based on the information provided and our automated risk assessment.
                      </Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    SPV Risk Disclosure Statement
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Provide a detailed statement outlining the risks associated with your SPV. This will be shared with potential investors.
                  </Typography>
                  <TextField
                    fullWidth
                    id="riskDisclosureStatement"
                    name="riskDisclosureStatement"
                    placeholder="Provide a comprehensive risk disclosure statement for your SPV..."
                    value={state.compliance.riskDisclosureStatement}
                    onChange={handleChange}
                    error={!!errors.riskDisclosureStatement}
                    helperText={errors.riskDisclosureStatement || "Provide a detailed statement outlining the risks associated with your SPV. This will be shared with potential investors."}
                    variant="outlined"
                    multiline
                    rows={6}
                    sx={{ mb: 3 }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button
          variant="outlined"
          onClick={prevStep}
          sx={{ py: 1.5, px: 4 }}
        >
          Save & Exit
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          sx={{ py: 1.5, px: 4, fontWeight: "bold" }}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
};

export default ComplianceDueDiligence;