import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { observer } from 'mobx-react-lite';
import { Box, Container, Grid, Card, Typography, Avatar, CircularProgress, Alert } from '@mui/material';
import Navbar from './components/Navbar';
import PostForm from './components/PostForm';
import Post from './components/Post';
import SignInPage from './components/Auth/SignIn';
import SignUpPage from './components/Auth/SignUp';
import { useUser } from '@clerk/clerk-react';
import { supabase } from './supabaseClient';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#2196f3',
      light: '#64b5f6',
      dark: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 12px 0 rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
console.log('Clerk Key:', clerkPubKey);

const HomePage = observer(() => {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPosts(data || []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPost = async (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <>
      <Navbar />
      <Box 
        sx={{ 
          bgcolor: 'background.default', 
          minHeight: '100vh',
          pt: { xs: 10, sm: 12 }, 
          pb: 4,
          px: { xs: 2, sm: 3 }
        }}
      >
        <Container maxWidth="md">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card 
                sx={{ 
                  mb: 4, 
                  bgcolor: 'primary.main', 
                  color: 'white', 
                  p: { xs: 2, sm: 3 },
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  }
                }}
              >
                <Grid container alignItems="center" spacing={2}>
                  <Grid item>
                    <Avatar
                      src={user?.imageUrl}
                      sx={{ 
                        width: { xs: 60, sm: 80 }, 
                        height: { xs: 60, sm: 80 },
                        border: '3px solid white'
                      }}
                    >
                      {user?.firstName?.[0] || user?.username?.[0]}
                    </Avatar>
                  </Grid>
                  <Grid item>
                    <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                      {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username}
                    </Typography>
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        opacity: 0.9,
                        mt: 0.5
                      }}
                    >
                      Welcome back!
                    </Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <PostForm onAddPost={handleAddPost} />
            </Grid>
            <Grid item xs={12}>
              {isLoading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert 
                  severity="error"
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiAlert-message': { 
                      fontSize: '1rem' 
                    }
                  }}
                >
                  {error}
                </Alert>
              ) : posts.length === 0 ? (
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    color: 'text.secondary'
                  }}
                >
                  <Typography variant="h6">
                    No posts yet. Be the first to share something!
                  </Typography>
                </Box>
              ) : (
                posts.map((post) => (
                  <Post key={post.id} post={post} />
                ))
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
});

function App() {
  if (!clerkPubKey) {
    console.log('Environment variables:', process.env);
    return 'Missing Publishable Key';
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ThemeProvider theme={theme}>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <SignedIn>
                    <HomePage />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />
            <Route 
              path="/sign-in/*" 
              element={<SignInPage />} 
            />
            <Route 
              path="/sign-up/*" 
              element={<SignUpPage />} 
            />
          </Routes>
        </Router>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default observer(App);
