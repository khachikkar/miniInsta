import React from 'react';
import { SignIn } from "@clerk/clerk-react";
import { Box, Container, Paper } from '@mui/material';

const SignInPage = () => {
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
          <SignIn routing="path" afterSignInUrl="/" />
        </Paper>
      </Box>
    </Container>
  );
};

export default SignInPage;
