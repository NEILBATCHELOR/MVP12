import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, CardActions, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Divider, Chip, Grid, Paper } from '@mui/material';
import { InvestorDocument, InvestorDocumentStatus } from '@/types/centralModels';

interface DocumentReviewProps {
  document: InvestorDocument;
  onApprove: (document: InvestorDocument) => void;
  onReject: (document: InvestorDocument, reason: string) => void;
}

export const DocumentReview: React.FC<DocumentReviewProps> = ({
  document,
  onApprove,
  onReject,
}) => {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  const handleApprove = () => {
    onApprove(document);
  };

  const handleRejectDialogOpen = () => {
    setRejectDialogOpen(true);
  };

  const handleRejectDialogClose = () => {
    setRejectDialogOpen(false);
    setRejectionReason('');
    setError('');
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    
    onReject(document, rejectionReason);
    handleRejectDialogClose();
  };

  const formatDate = (date: Date | string | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusChip = (status: InvestorDocumentStatus) => {
    switch (status) {
      case InvestorDocumentStatus.APPROVED:
        return <Chip label="Approved" color="success" />;
      case InvestorDocumentStatus.REJECTED:
        return <Chip label="Rejected" color="error" />;
      case InvestorDocumentStatus.PENDING:
        return <Chip label="Pending" color="warning" />;
      case InvestorDocumentStatus.EXPIRED:
        return <Chip label="Expired" color="error" />;
      case InvestorDocumentStatus.REQUIRES_UPDATE:
        return <Chip label="Update Required" color="info" />;
      default:
        return <Chip label={status} />;
    }
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" component="h2">
                {document.name}
              </Typography>
              {getStatusChip(document.status)}
            </Box>
            <Typography color="textSecondary" gutterBottom>
              {document.description || 'No description available'}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Document Type
            </Typography>
            <Typography variant="body1" gutterBottom>
              {document.documentType}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Uploaded On
            </Typography>
            <Typography variant="body1" gutterBottom>
              {formatDate(document.createdAt)}
            </Typography>
          </Grid>

          {document.reviewedBy && (
            <>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Reviewed By
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {document.reviewedBy}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Reviewed On
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formatDate(document.reviewedAt)}
                </Typography>
              </Grid>
            </>
          )}

          {document.expiresAt && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="textSecondary">
                Expires On
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formatDate(document.expiresAt)}
              </Typography>
            </Grid>
          )}

          {document.status === InvestorDocumentStatus.REJECTED && document.rejectionReason && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="error">
                Rejection Reason
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: '#fff5f5' }}>
                <Typography variant="body2">
                  {document.rejectionReason}
                </Typography>
              </Paper>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box mt={2}>
              <Paper variant="outlined" sx={{ p: 1, height: 400, overflow: 'auto' }}>
                {document.documentUrl.toLowerCase().endsWith('.pdf') ? (
                  <iframe 
                    src={document.documentUrl} 
                    width="100%" 
                    height="100%" 
                    title={document.name} 
                    style={{ border: 'none' }}
                  />
                ) : (
                  <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <img 
                      src={document.documentUrl} 
                      alt={document.name} 
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
                    />
                  </Box>
                )}
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </CardContent>

      {document.status === InvestorDocumentStatus.PENDING && (
        <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
          <Button 
            variant="outlined" 
            color="error" 
            onClick={handleRejectDialogOpen}
          >
            Reject
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleApprove}
          >
            Approve
          </Button>
        </CardActions>
      )}

      <Dialog open={rejectDialogOpen} onClose={handleRejectDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Reject Document</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" paragraph>
            Please provide a reason for rejecting this document. This information will be shared with the investor.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            id="rejection-reason"
            label="Rejection Reason"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            error={!!error}
            helperText={error}
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRejectDialogClose} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleReject} color="error" variant="contained">
            Confirm Rejection
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}; 