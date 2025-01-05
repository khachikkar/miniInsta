import React, { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useUser } from '@clerk/clerk-react';
import { 
  Box, 
  Container, 
  Card, 
  CardContent, 
  CardHeader, 
  Avatar, 
  Typography, 
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import Navbar from './Navbar';
import PostForm from './PostForm';
import Post from './Post';

const Home = observer(({ postStore }) => {
  const { user } = useUser();

  useEffect(() => {
    postStore.fetchPosts();
  }, [postStore]);

  const handleAddPost = async (newPost) => {
    const postWithUser = {
      ...newPost,
      author: {
        name: user.firstName || user.username,
        surname: user.lastName || '',
        avatar: user.imageUrl,
      }
    };
    await postStore.addPost(postWithUser);
  };

  return (
    <>
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
                      src={user.imageUrl}
                      sx={{ 
                        width: 80, 
                        height: 80,
                      }}
                    >
                      {user.firstName?.[0] || user.username?.[0]}
                    </Avatar>
                  </Grid>
                  <Grid item>
                    <Typography variant="h5">
                      {user.firstName ? `${user.firstName} ${user.lastName || ''}` : user.username}
                    </Typography>
                    <Typography variant="subtitle1">Welcome back!</Typography>
                  </Grid>
                </Grid>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <PostForm onAddPost={handleAddPost} />
            </Grid>
            <Grid item xs={12}>
              {postStore.isLoading ? (
                <Box display="flex" justifyContent="center" p={3}>
                  <CircularProgress />
                </Box>
              ) : postStore.error ? (
                <Alert severity="error">{postStore.error}</Alert>
              ) : (
                postStore.posts.map((post) => (
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

export default Home;
