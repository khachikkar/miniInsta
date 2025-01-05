import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { 
  Container, 
  Box, 
  Paper, 
  Avatar, 
  Typography,
  Button,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

function Profile() {
  const { user } = useUser();

  if (!user) return null;

  return (
    <Container maxWidth="sm">
      <Box sx={{ pt: { xs: 8, sm: 10 }, pb: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: { xs: 3, sm: 4 },
            borderRadius: 3,
            bgcolor: 'background.paper',
            textAlign: 'center',
          }}
        >
          <Avatar
            src={user?.imageUrl}
            sx={{
              width: 150,
              height: 150,
              mx: 'auto',
              mb: 3,
              border: '4px solid',
              borderColor: 'primary.main',
              boxShadow: 3,
            }}
          >
            {user?.firstName?.[0] || user?.username?.[0]}
          </Avatar>

          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 600,
              mb: 0.5
            }}
          >
            {user?.firstName} {user?.lastName}
          </Typography>

          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            {user?.emailAddresses?.[0]?.emailAddress}
          </Typography>

          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            sx={{ 
              px: 4,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'primary.50',
              }
            }}
          >
            Edit Profile
          </Button>
        </Paper>
      </Box>
    </Container>
  );
}

export default Profile;
