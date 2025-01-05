import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardMedia, 
  Avatar, 
  Typography,
  Box,
} from '@mui/material';
import formatDistanceToNow from 'date-fns/formatDistanceToNow';

function Post({ post }) {
  if (!post) {
    console.log('No post data provided');
    return null;
  }

  const author = post.author || {};
  
  console.log('Rendering post:', {
    id: post.id,
    content: post.content,
    author: post.author,
    created_at: post.created_at
  });

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
        sx={{ 
          bgcolor: 'primary.light',
          color: 'white',
          '& .MuiCardHeader-subheader': { 
            color: 'rgba(255,255,255,0.7)' 
          }
        }}
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
    </Card>
  );
}

export default Post;
