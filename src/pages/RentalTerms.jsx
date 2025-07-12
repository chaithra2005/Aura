import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const termsText = `Camera Rental Terms and Conditions\n\n1. Acceptance of Terms\nBy using ApertureAura.in ("Platform"), you agree to comply with these Rental Terms ("Terms"). These Terms govern all camera rentals, listings, and transactions on the Platform.\n\n2. Scope of Service\nRenters: Users may rent cameras for specified dates.\nOwners: Users may list their cameras for rent.\nAll transactions are subject to Karnataka state laws.\n\n3. Booking and Payment\nBooking: Renters must select exact rental start/end dates.\nPayment: Full payment is due at booking.\nSecurity Deposit: A refundable deposit may be required (refunded within 7 days post-return, minus deductions for damages/late fees).\n\n4. Owner Responsibilities\nFor Listing Cameras:\nAccuracy: Provide truthful descriptions, working condition, and defects.\nAvailability: Ensure the camera is available for selected dates.\nTransfer: Hand over the camera in clean, functional condition with accessories.\n\n5. Renter Responsibilities\nDuring Rental:\nUse: Use equipment solely for personal/non-commercial purposes.\nCare: Protect equipment from damage, theft, or loss.\nReturn: Return equipment on the agreed date, time, and location.\n\n6. Damages & Repairs\nLiability: Renters are fully liable for any damage, loss, or theft.\nRepair Costs: Renters must pay 100% of repair/replacement costs (determined by Platform-approved technicians).\nReport: Damage must be reported within 2 hours of return.\n\n7. Late Returns\nPenalties:\n1–24 hours late: 150% of daily rental rate.\n>24 hours late: 200% daily rate + legal action for theft.\nExtensions: Must request >24 hours before return; subject to approval and extra fees.\n\n8. Cancellations\nRenters:\n48 hours before rental: Full refund.\n<48 hours: 50% refund.\nOwners:\nCancelling a confirmed booking: 20% penalty of rental value.\n\n9. Governing Law & Disputes\nGoverned by Karnataka state laws.\nDisputes will be resolved in courts of Karnataka.\nPlatform acts as an intermediary; disputes between renters/owners must be settled directly.\n\n10. Intellectual Property\nAll content (logos, text, interfaces) is owned by ApertureAura and protected under copyright law.\nUnauthorized use will result in legal action.\n\n11. Limitation of Liability\nThe Platform is not liable for:\nEquipment malfunction during rental.\nIndirect damages (e.g., lost photos, business interruptions).\nUser disputes or third-party actions.\n\n12. Termination\nWe may suspend/terminate accounts for:\nFraud, misuse, or breach of these Terms.\nIllegal activities.\n\n13. General\nModifications: Terms may be updated; users will be notified.\nForce Majeure: Not liable for delays/cancellations due to events beyond control (e.g., natural disasters).\nContact: Queries? Email jitheshdas08@gmail.com.\n\n© 2025 ApertureAura. All Rights Reserved.\nBy using this Platform, you acknowledge reading and agreeing to these Terms.`;

const RentalTerms = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e0e7ef 0%, #f5f7fa 100%)',
        p: { xs: 1, sm: 4 },
      }}
    >
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{
          position: 'absolute',
          top: { xs: 12, sm: 24 },
          left: { xs: 12, sm: 32 },
          zIndex: 10,
          fontWeight: 700,
          bgcolor: 'rgba(255,255,255,0.85)',
          boxShadow: 1,
          borderRadius: 2,
          textTransform: 'none',
          color: '#222',
          '&:hover': { bgcolor: '#f5f5f5' }
        }}
      >
        Back
      </Button>
      <Paper
        elevation={6}
        sx={{
          maxWidth: 800,
          width: '100%',
          p: { xs: 2, sm: 6 },
          borderRadius: 4,
          background: 'rgba(255,255,255,0.95)',
          overflowY: 'auto',
          maxHeight: '90vh',
        }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom align="center">
          Camera Rental Terms and Conditions
        </Typography>
        <Box sx={{ whiteSpace: 'pre-line', mt: 3 }}>
          {termsText}
        </Box>
      </Paper>
    </Box>
  );
};

export default RentalTerms; 