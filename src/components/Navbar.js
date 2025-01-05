import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk, useUser, SignedIn, SignedOut } from '@clerk/clerk-react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Stack,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Box,
} from '@mui/material';

function Navbar() {
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    await signOut();
    handleClose();
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        bgcolor: 'white', 
        boxShadow: '0 2px 12px 0 rgba(0,0,0,0.1)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar 
          sx={{ 
            justifyContent: 'space-between',
            minHeight: { xs: '64px', sm: '72px' }
          }}
        >
          <Typography
            variant="h5"
            component="div"
            onClick={() => navigate('/')}
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              fontFamily: 'monospace',
              letterSpacing: '.2rem',
              cursor: 'pointer',
              fontSize: { xs: '1.5rem', sm: '1.8rem' },
              '&:hover': {
                color: 'primary.dark',
              }
            }}
          >
            KHinsta
          </Typography>
          
          <SignedIn>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton
                onClick={handleMenu}
                sx={{ 
                  p: 0.5,
                  border: '2px solid',
                  borderColor: 'primary.light',
                  '&:hover': {
                    borderColor: 'primary.main',
                  }
                }}
              >
                <Avatar
                  src={user?.imageUrl}
                  alt={user?.username}
                  sx={{ 
                    width: { xs: 36, sm: 40 }, 
                    height: { xs: 36, sm: 40 }
                  }}
                >
                  {user?.firstName?.[0] || user?.username?.[0]}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    mt: 1.5,
                    borderRadius: 2,
                    minWidth: 150,
                  }
                }}
              >
                <MenuItem 
                  onClick={handleSignOut}
                  sx={{ 
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'primary.light',
                      color: 'white',
                    }
                  }}
                >
                  Sign Out
                </MenuItem>
              </Menu>
            </Box>
          </SignedIn>
          
          <SignedOut>
            <Stack 
              direction="row" 
              spacing={{ xs: 1, sm: 2 }}
              sx={{ 
                '& .MuiButton-root': {
                  px: { xs: 2, sm: 3 },
                  py: { xs: 0.8, sm: 1 },
                }
              }}
            >
              <Button 
                variant="outlined" 
                color="primary"
                onClick={() => navigate('/sign-in')}
                sx={{ 
                  '&:hover': {
                    bgcolor: 'primary.light',
                    color: 'white',
                    borderColor: 'primary.light',
                  }
                }}
              >
                Sign In
              </Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => navigate('/sign-up')}
                sx={{ 
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  }
                }}
              >
                Sign Up
              </Button>
            </Stack>
          </SignedOut>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
