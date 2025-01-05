import React, { useState, useRef, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  Box, 
  Container, 
  Card, 
  CardContent, 
  CardHeader, 
  Avatar, 
  Typography, 
  Grid,
  TextField,
  Button,
  Paper,
  IconButton,
  CardMedia,
  CircularProgress,
  Snackbar,
  Alert,
  AppBar,
  Toolbar,
  Stack
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabaseClient';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#2196f3',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function Navbar() {
  return (
    <AppBar position="fixed" sx={{ bgcolor: 'white', boxShadow: 1 }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              fontFamily: 'monospace',
              letterSpacing: '.2rem'
            }}
          >
            KHinsta
          </Typography>
          
          <Stack direction="row" spacing={2}>
            <Button 
              variant="outlined" 
              color="primary"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold'
              }}
            >
              Sign In
            </Button>
            <Button 
              variant="contained" 
              color="primary"
              sx={{ 
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 'bold'
              }}
            >
              Sign Up
            </Button>
          </Stack>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

function PostForm({ onAddPost }) {
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadImage = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await supabase.storage
        .from('post-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('post-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !selectedImage) return;

    setIsLoading(true);
    setError(null);

    try {
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage);
      }

      const newPost = {
        id: Date.now(),
        author: {
          name: 'You',
          surname: '',
          avatar: null,
        },
        content: content,
        image_url: imageUrl,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('posts')
        .insert([newPost])
        .select();

      if (error) throw error;

      onAddPost(data[0]);
      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3, bgcolor: 'white' }}>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          sx={{ mb: 2 }}
          disabled={isLoading}
        />
        
        {imagePreview && (
          <Box sx={{ position: 'relative', mb: 2 }}>
            <img 
              src={imagePreview} 
              alt="Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '200px', 
                objectFit: 'cover',
                borderRadius: '4px'
              }} 
            />
            <IconButton
              onClick={handleRemoveImage}
              disabled={isLoading}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.7)'
                }
              }}
            >
              ✕
            </IconButton>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageSelect}
            ref={fileInputRef}
            disabled={isLoading}
          />
          <Button 
            onClick={() => fileInputRef.current.click()}
            variant="outlined"
            disabled={isLoading}
            sx={{ 
              borderStyle: 'dashed',
              '&:hover': { bgcolor: 'primary.50' }
            }}
          >
            📷 Add Photo
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={(!content.trim() && !selectedImage) || isLoading}
            sx={{ 
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Post'}
          </Button>
        </Box>
      </form>
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
}

function Post({ post }) {
  const timestamp = new Date(post.created_at).toLocaleString();

  return (
    <Card sx={{ mb: 2, boxShadow: 3, '&:hover': { boxShadow: 6 } }}>
      <CardHeader
        avatar={
          <Avatar
            sx={{ 
              width: 50, 
              height: 50,
              bgcolor: post.author.name === 'You' ? 'secondary.main' : 'primary.main'
            }}
          >
            {post.author.name[0]}
          </Avatar>
        }
        title={`${post.author.name} ${post.author.surname}`}
        subheader={timestamp}
        sx={{ 
          bgcolor: 'primary.light',
          color: 'white',
          '& .MuiCardHeader-subheader': { color: 'rgba(255,255,255,0.7)' }
        }}
      />
      {post.image_url && (
        <CardMedia
          component="img"
          image={post.image_url}
          alt="Post image"
          sx={{ 
            maxHeight: '400px',
            objectFit: 'contain',
            bgcolor: '#f5f5f5'
          }}
        />
      )}
      <CardContent>
        <Typography variant="body1">
          {post.content}
        </Typography>
      </CardContent>
    </Card>
  );
}

function App() {
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
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPost = (newPost) => {
    setPosts([newPost, ...posts]);
  };

  return (
    <ThemeProvider theme={theme}>
      <Navbar />
      <Box sx={{ 
        bgcolor: 'background.default', 
        minHeight: '100vh', 
        pt: { xs: 10, sm: 12 }, 
        pb: 4,
        px: 2
      }}>
        <Container maxWidth="md">
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ mb: 4, bgcolor: 'primary.main', color: 'white', p: 2 }}>
                <Grid container alignItems="center" spacing={2}>
                  <Grid item>
                    <Avatar
                      sx={{ 
                        width: 80, 
                        height: 80,
                        bgcolor: 'secondary.main'
                      }}
                    >
                      U
                    </Avatar>
                  </Grid>
                  <Grid item>
                    <Typography variant="h5">Your Profile</Typography>
                    <Typography variant="subtitle1">Welcome back!</Typography>
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
                <Alert severity="error">{error}</Alert>
              ) : (
                posts.map((post) => (
                  <Post key={post.id} post={post} />
                ))
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
