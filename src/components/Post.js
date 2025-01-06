import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardMedia, 
  CardActions,
  Avatar, 
  Typography,
  IconButton,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../supabaseClient';

function Post({ post }) {
  const { user } = useUser();
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [likedPosts, setLikedPosts] = useState([]);

  const handleLike = async () => {
    if (!user) return;
    if (likedPosts.includes(post.id)) {
      console.log('You have already liked this post.');
      return; // Prevent liking again
    }

    const newLikeCount = likeCount + 1;
    setLikeCount(newLikeCount); // Optimistic update

    console.log(post.id);
    try {
      const { error } = await supabase
        .from('posts')
        .update({ likes: newLikeCount })
        .eq('id', post.id);

      if (error) {
        console.error('Error updating likes:', error.message); // More detailed error
        // Optionally revert the optimistic update if there's an error
        setLikeCount(likeCount); // Revert if needed
        return;
      }
      // Update the likedPosts state
      setLikedPosts([...likedPosts, post.id]); // Add the post ID to the likedPosts array
    } catch (error) {
      console.error('Error:', error.message); // More detailed error
      setLikeCount(likeCount); // Revert if needed
    }
  };

  const author = post.author || {};
  const formattedDate = post.created_at 
    ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
    : '';

  return (
    <Card 
      sx={{ 
        mb: 3, 
        borderRadius: 3,
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        transition: 'all 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
        }
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            src={author.avatar}
            sx={{ 
              width: { xs: 40, sm: 50 }, 
              height: { xs: 40, sm: 50 },
              border: '2px solid',
              borderColor: 'primary.main'
            }}
          >
            {author.name ? author.name[0] : '?'}
          </Avatar>
        }
        title={
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {author.name} {author.surname}
          </Typography>
        }
        subheader={
          formattedDate && (
            <Typography variant="body2" color="text.secondary">
              {formattedDate}
            </Typography>
          )
        }
      />
      
      {post.image_url && (
        <CardMedia
          component="img"
          image={post.image_url}
          alt="Post image"
          sx={{ 
            maxHeight: '500px',
            objectFit: 'contain',
            bgcolor: '#f5f5f5'
          }}
        />
      )}
      
      <CardContent>
        <Typography 
          variant="body1" 
          sx={{ 
            whiteSpace: 'pre-wrap',
            lineHeight: 1.6 
          }}
        >
          {post.content || ''}
        </Typography>
      </CardContent>

      <CardActions disableSpacing>
        <IconButton 
          onClick={handleLike}
          disabled={!user}
          sx={{
            color: likedPosts.includes(post.id) ? 'error.main' : 'action.active',
            '&:hover': {
              color: 'error.main',
            },
            transition: 'all 0.2s',
          }}
        >
          <FavoriteBorderIcon />
        </IconButton>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ ml: 1 }}
        >
          {likeCount} {likeCount === 1 ? 'like' : 'likes'}
        </Typography>
      </CardActions>
    </Card>
  );
}

export default Post;
