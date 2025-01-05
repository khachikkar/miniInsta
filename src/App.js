import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { 
  ClerkProvider, 
  SignedIn, 
  SignedOut, 
  RedirectToSignIn 
} from '@clerk/clerk-react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Container, Box, CircularProgress, Alert, Typography } from '@mui/material';
import { supabase } from './supabaseClient';
import Navbar from './components/Navbar';
import Profile from './components/Profile/Profile';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';
import PostForm from './components/PostForm';
import Post from './components/Post';

if (!process.env.REACT_APP_CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk publishable key');
}

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Fetching posts...');
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Fetch error:', error);
        throw error;
      }

      console.log('Raw posts data:', data);

      if (!data) {
        console.log('No data returned from Supabase');
        setPosts([]);
        return;
      }

      setPosts(data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleAddPost = async (newPost) => {
    console.log('Adding new post:', newPost);
    setPosts(prevPosts => [newPost, ...prevPosts]);
    // Refresh posts to ensure we have the latest data
    fetchPosts();
  };

  const renderPosts = () => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      );
    }

    if (!posts || posts.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            No posts yet. Be the first to share something!
          </Typography>
        </Box>
      );
    }

    return posts.map(post => {
      console.log('Rendering post:', post);
      return <Post key={post.id} post={post} />;
    });
  };

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100' }}>
            <Navbar />
            <Container 
              maxWidth="md" 
              sx={{ 
                pt: { xs: 10, sm: 11 }, // Increased top padding to account for fixed navbar
                pb: 4,
                px: { xs: 2, sm: 3 } 
              }}
            >
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      <SignedIn>
                        <PostForm onAddPost={handleAddPost} />
                        {renderPosts()}
                      </SignedIn>
                      <SignedOut>
                        <RedirectToSignIn />
                      </SignedOut>
                    </>
                  }
                />
                <Route
                  path="/sign-in/*"
                  element={<SignIn routing="path" path="/sign-in" />}
                />
                <Route
                  path="/sign-up/*"
                  element={<SignUp routing="path" path="/sign-up" />}
                />
                <Route
                  path="/profile"
                  element={
                    <>
                      <SignedIn>
                        <Profile />
                      </SignedIn>
                      <SignedOut>
                        <RedirectToSignIn />
                      </SignedOut>
                    </>
                  }
                />
              </Routes>
            </Container>
          </Box>
        </Router>
      </ThemeProvider>
    </ClerkProvider>
  );
}

export default App;
