import React from 'react';
import Post from './Post';

const PostList = ({ posts }) => {
    console.log('PostList posts:', posts);
    return (
        <div>
            {posts.map((post, index) => (
                <Post key={index} post={post} />
            ))}
        </div>
    );
};

export default PostList;
