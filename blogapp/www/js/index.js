const API_BASE = "https://ejikeblog.page.gd/wp-json/wp/v2";
const POSTS_URL = API_BASE + "/posts";
const MEDIA_URL = API_BASE + "/media";

// ⚠️ IMPORTANT: Use Application Password (not normal password)
const USERNAME = "root";
const APP_PASSWORD = "fcC2f4e6gSZ6YGRf9j7Jvu5M";

const AUTH_TOKEN = "Basic " + btoa(USERNAME + ":" + APP_PASSWORD);

// ------------------------
// LOAD POSTS
// ------------------------
function loadPosts() {
    fetch(POSTS_URL)
        .then(response => response.json())
        .then(data => {
            const postsDiv = document.getElementById("posts");
            postsDiv.innerHTML = "";

            data.forEach(post => {
                postsDiv.innerHTML += `
                    <div class="post">
                        <h3>${post.title.rendered}</h3>
                        <div>${post.excerpt.rendered}</div>
                    </div>
                `;
            });
        })
        .catch(err => {
            console.error("Error loading posts:", err);
            alert("Failed to load posts");
        });
}

// ------------------------
// UPLOAD IMAGE
// ------------------------
function uploadImage(file) {
    const formData = new FormData();
    formData.append("file", file);

    return fetch(MEDIA_URL, {
        method: "POST",
        headers: {
            "Authorization": AUTH_TOKEN
        },
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Image upload failed");
        }
        return response.json();
    });
}

// ------------------------
// CREATE POST WITH IMAGE
// ------------------------
function createPost() {

    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const imageFile = document.getElementById("image").files[0];

    if (!title || !content) {
        alert("Please enter title and content");
        return;
    }

    // If image selected → upload first
    if (imageFile) {

        uploadImage(imageFile)
        .then(media => {

            // After image uploads, create post
            return fetch(POSTS_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": AUTH_TOKEN
                },
                body: JSON.stringify({
                    title: title,
                    content: content,
                    status: "publish",
                    featured_media: media.id
                })
            });

        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Post creation failed");
            }
            return response.json();
        })
        .then(() => {
            alert("Post with image created!");
            loadPosts();
        })
        .catch(err => {
            console.error("Error:", err);
            alert("Failed to create post");
        });

    } else {

        // No image selected → create normal post
        fetch(POSTS_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": AUTH_TOKEN
            },
            body: JSON.stringify({
                title: title,
                content: content,
                status: "publish"
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Post creation failed");
            }
            return response.json();
        })
        .then(() => {
            alert("Post created!");
            loadPosts();
        })
        .catch(err => {
            console.error("Error creating post:", err);
            alert("Failed to create post");
        });
    }
}

// Load posts on page open
document.addEventListener("DOMContentLoaded", loadPosts);