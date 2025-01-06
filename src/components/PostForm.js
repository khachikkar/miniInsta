import React, { useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { 
  TextField, 
  Button, 
  Card, 
  CardContent, 
  Box, 
  IconButton, 
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../supabaseClient';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';

function PostForm({ onAddPost }) {
  const { user } = useUser();
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

      // Create the post object
      const post = {
        content: content.trim(),
        image_url: imageUrl,
        author: {
          name: user.firstName || user.username,
          surname: user.lastName || '',
          avatar: user.imageUrl
        },
        likes: 0,
        liked_by: [],
        created_at: new Date().toISOString()
      };

      console.log('User data:', {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        imageUrl: user.imageUrl,
        email: user.emailAddresses[0].emailAddress
      });
      console.log('Creating post:', post);

      // Insert into Supabase
      const { data, error } = await supabase
        .from('posts')
        .insert([post])
        .select();

      if (error) {
        console.error('Error creating post:', error);
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned after creating post');
      }

      console.log('Post created successfully:', data[0]);
      onAddPost(data[0]);
      
      // Reset form
      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setError(error.message || 'Failed to create post');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card 
      sx={{ 
        mb: 4,
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover fieldset': {
                  borderColor: 'primary.main',
                },
              }
            }}
            disabled={isLoading}
          />
          
          {imagePreview && (
            <Box sx={{ position: 'relative', mb: 2 }}>
              <img 
                src={imagePreview} 
                alt="Preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '300px', 
                  objectFit: 'cover',
                  borderRadius: '8px'
                }} 
              />
              <IconButton
                onClick={handleRemoveImage}
                disabled={isLoading}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'rgba(0,0,0,0.8)'
                  }
                }}
              >
                <CloseIcon />
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
              startIcon={<AddPhotoAlternateIcon />}
              sx={{ 
                borderStyle: 'dashed',
                '&:hover': { 
                  borderStyle: 'dashed',
                  bgcolor: 'primary.50' 
                }
              }}
            >
              Add Photo
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={(!content.trim() && !selectedImage) || isLoading}
              sx={{ 
                px: 4,
                '&:hover': { 
                  bgcolor: 'primary.dark',
                  transform: 'translateY(-1px)'
                }
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
          <Alert 
            severity="error" 
            onClose={() => setError(null)}
            sx={{ width: '100%' }}
          >
            {error}
          </Alert>
        </Snackbar>
      </CardContent>
    </Card>
  );
}

export default PostForm;
