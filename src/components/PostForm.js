import React, { useState } from 'react';

const PostForm = ({ addPost }) => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (content && image) {
            addPost({ content, image });
            setContent('');
            setImage(null);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                required
            />
            <input
                type="file"
                onChange={(e) => setImage(URL.createObjectURL(e.target.files[0]))}
                required
            />
            <button type="submit">Post</button>
        </form>
    );
};

export default PostForm;
