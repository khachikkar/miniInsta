import React from 'react';

const Post = ({ post }) => {
    return (
        <div className="post">
            <p>{post.content}</p>
            {post.image && <img src={post.image} alt="Post" />}
        </div>
    );
};

export default Post;
