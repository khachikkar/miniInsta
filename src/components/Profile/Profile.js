import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { 
  Container, 
  Box, 
  Grid, 
  Avatar, 
  Typography, 
  Paper,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { supabase } from '../../supabaseClient';
import EditIcon from '@mui/icons-material/Edit';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

const StatCard = ({ title, value }) => (
  <Card 
    sx={{ 
      textAlign: 'center',
      height: '100%',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: (theme) => theme.shadows[4],
      },
    }}
  >
    <CardContent>
      <Typography variant="h4" color="primary" gutterBottom>
        {value}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        {title}
      </Typography>
    </CardContent>
  </Card>
);

function Profile() {
  const { user } = useUser();
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchUserStats();
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Get post count - using author->id instead of user_id
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select('id, author')
        .eq('author->id', user.id);

      if (postsError) throw postsError;

      // Get followers count
      const { data: followers, error: followersError } = await supabase
        .from('followers')
        .select('follower_id')
        .eq('following_id', user.id);

      if (followersError) throw followersError;

      // Get following count
      const { data: following, error: followingError } = await supabase
        .from('followers')
        .select('following_id')
        .eq('follower_id', user.id);

      if (followingError) throw followingError;

      setStats({
        posts: posts?.length || 0,
        followers: followers?.length || 0,
        following: following?.length || 0,
      });
    } catch (err) {
      console.error('Error fetching user stats:', err);
      setError('Failed to load user statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await supabase
          .from('followers')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', user.id);
      } else {
        await supabase
          .from('followers')
          .insert([
            { follower_id: user.id, following_id: user.id }
          ]);
      }
      setIsFollowing(!isFollowing);
      fetchUserStats();
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper 
        elevation={3} 
        sx={{ 
          mt: 4, 
          p: { xs: 2, sm: 4 },
          borderRadius: 3,
          bgcolor: 'background.paper',
        }}
      >
        <Grid container spacing={4}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Box display="flex" alignItems="center" flexDirection={{ xs: 'column', sm: 'row' }}>
              <Avatar
                src={user?.imageUrl}
                sx={{
                  width: { xs: 120, sm: 150 },
                  height: { xs: 120, sm: 150 },
                  border: '4px solid',
                  borderColor: 'primary.main',
                  boxShadow: 3,
                  mb: { xs: 2, sm: 0 },
                  mr: { sm: 4 },
                }}
              >
                {user?.firstName?.[0] || user?.username?.[0]}
              </Avatar>
              <Box flex={1}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Typography variant="h4" component="h1" gutterBottom>
                    {user?.firstName} {user?.lastName}
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={isFollowing ? <PersonRemoveIcon /> : <PersonAddIcon />}
                    onClick={handleFollow}
                    color={isFollowing ? "error" : "primary"}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                </Box>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  {user?.emailAddresses?.[0]?.emailAddress}
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<EditIcon />}
                  sx={{ mt: 1 }}
                >
                  Edit Profile
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* Stats Grid */}
          <Grid item xs={12}>
            <Divider sx={{ my: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <StatCard title="Posts" value={stats.posts} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard title="Followers" value={stats.followers} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <StatCard title="Following" value={stats.following} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}

export default Profile;
