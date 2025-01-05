import React from 'react';
import { SignUp } from "@clerk/clerk-react";
import { Box, Container, Paper } from '@mui/material';

const SignUpPage = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        py: 4 
      }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            width: '100%',
            borderRadius: 2,
            bgcolor: 'white'
          }}
        >
          <SignUp routing="path" afterSignUpUrl="/" />
        </Paper>
      </Box>
    </Container>
  );
};

export default SignUpPage;
