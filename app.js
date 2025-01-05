document.getElementById('postForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const content = document.getElementById('postContent').value;
    const image = document.getElementById('postImage').files[0];
    const formData = new FormData();
    formData.append('content', content);
    formData.append('image', image);

    await fetch('/api/posts', {
        method: 'POST',
        body: formData,
    });

    document.getElementById('postContent').value = '';
    document.getElementById('postImage').value = '';
    loadPosts();
});

async function loadPosts() {
    const response = await fetch('/api/posts');
    const posts = await response.json();
    const postsContainer = document.getElementById('postsContainer');
    postsContainer.innerHTML = '';
    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.innerHTML = `<p>${post.content}</p><img src="${post.image}" alt="Post Image">`;
        postsContainer.appendChild(postDiv);
    });
}

loadPosts();
