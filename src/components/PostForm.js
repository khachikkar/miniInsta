import React, { useState, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { 
  TextField, 
  Button, 
  Paper, 
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

      const newPost = {
        content: content,
        image_url: imageUrl,
        author: {
          name: user.firstName || user.username,
          surname: user.lastName || '',
          avatar: user.imageUrl,
        },
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
    <Paper 
      sx={{ 
        p: 3, 
        mb: 3, 
        bgcolor: 'background.paper',
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        }
      }}
    >
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
    </Paper>
  );
}

export default PostForm;
