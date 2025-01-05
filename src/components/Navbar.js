import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

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
            minHeight: { xs: '64px', sm: '72px' },
          }}
        >
          <Typography
            variant="h5"
            component={RouterLink}
            to="/"
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              fontFamily: 'monospace',
              letterSpacing: '.2rem',
              cursor: 'pointer',
              fontSize: { xs: '1.5rem', sm: '1.8rem' },
              '&:hover': {
                color: 'primary.dark',
              },
            }}
          >
            KHinsta
          </Typography>

          <SignedIn>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                component={RouterLink}
                to="/"
                startIcon={<HomeIcon />}
                sx={{
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'action.hover',
                  },
                }}
              >
                Home
              </Button>

              <IconButton
                onClick={handleMenu}
                sx={{
                  p: 0.5,
                  border: '2px solid',
                  borderColor: 'primary.light',
                  '&:hover': {
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Avatar
                  src={user?.imageUrl}
                  alt={user?.username}
                  sx={{
                    width: { xs: 36, sm: 40 },
                    height: { xs: 36, sm: 40 },
                    border: '2px solid',
                    borderColor: 'primary.main',
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
                  },
                }}
              >
                <MenuItem
                  component={RouterLink}
                  to="/profile"
                  onClick={handleClose}
                >
                  <ListItemIcon>
                    <AccountCircleIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Profile</ListItemText>
                </MenuItem>

                <MenuItem onClick={handleSignOut}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Sign Out</ListItemText>
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
                },
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
                  },
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
                  },
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
