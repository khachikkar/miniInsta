const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;
const posts = [];

app.use(express.static('public'));
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

app.post('/api/posts', upload.single('image'), (req, res) => {
    const newPost = {
        content: req.body.content,
        image: `/images/${req.file.filename}`
    };
    posts.push(newPost);
    res.status(201).send();
});

app.get('/api/posts', (req, res) => {
    res.json(posts);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
