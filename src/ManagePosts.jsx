import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, getDocs, doc } from "firebase/firestore"; // Firestore methods
import { db } from './firebase'; // Firestore configuration
import { Button, TextInput, Textarea } from 'flowbite-react'; // Flowbite components
import { useNavigate } from 'react-router-dom'; // Untuk navigasi ke halaman PostPage

function ManagePosts() {
  const [posts, setPosts] = useState([]); // State untuk daftar post
  const [form, setForm] = useState({ // State untuk data form
    title: '',
    description: '',
    features: '',
    downloadLinks: '',
  });
  const [editingPostId, setEditingPostId] = useState(null); // State untuk tracking post yang sedang diedit
  const [loading, setLoading] = useState(true); // Loading state untuk memuat post dari Firestore
  const navigate = useNavigate(); // Digunakan untuk navigasi ke halaman detail post

  // Mengambil data post dari Firestore
  useEffect(() => {
    const fetchPosts = async () => {
      const postCollection = collection(db, "posts");
      const postSnapshot = await getDocs(postCollection);
      const postList = postSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postList);
      setLoading(false); // Set loading ke false setelah post diambil
    };

    fetchPosts();
  }, []);

  // Handle perubahan input form
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Fungsi untuk membuat post baru
  const handleCreate = async (e) => {
    e.preventDefault();
    const newPost = {
      title: form.title,
      description: form.description,
      features: form.features.split(',').map(feature => feature.trim()),
      downloadLinks: form.downloadLinks.split(',').map(link => {
        const [text, url] = link.split('|').map(item => item.trim());
        return { text, url };
      })
    };
    const docRef = await addDoc(collection(db, "posts"), newPost); // Menambahkan dokumen baru
    setPosts([...posts, { id: docRef.id, ...newPost }]); // Update list post
    resetForm(); // Reset form setelah create
  };

  // Fungsi untuk mengedit post
  const handleEdit = async (e) => {
    e.preventDefault();
    const postRef = doc(db, "posts", editingPostId);
    const updatedPost = {
      title: form.title,
      description: form.description,
      features: form.features.split(',').map(feature => feature.trim()),
      downloadLinks: form.downloadLinks.split(',').map(link => {
        const [text, url] = link.split('|').map(item => item.trim());
        return { text, url };
      })
    };
    await updateDoc(postRef, updatedPost); // Update dokumen
    setPosts(posts.map(post => (post.id === editingPostId ? { id: post.id, ...updatedPost } : post))); // Update list post
    resetForm(); // Reset form setelah edit
  };

  // Reset form untuk create post baru
  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      features: '',
      downloadLinks: '',
    });
    setEditingPostId(null); // Keluarkan dari mode edit
  };

  // Set form dengan data post yang akan diedit
  const handleEditClick = (post) => {
    setForm({
      title: post.title,
      description: post.description,
      features: post.features.join(', '),
      downloadLinks: post.downloadLinks.map(link => `${link.text}|${link.url}`).join(', '),
    });
    setEditingPostId(post.id); // Set ID post yang sedang diedit
  };

  // Fungsi untuk navigasi ke halaman post detail
  const handlePostClick = (postId) => {
    navigate(`/posts/${postId}`); // Navigasi ke halaman PostPage berdasarkan postId
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 dark:text-white dark:bg-[#1e1e1e] min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">{editingPostId ? 'Edit Post' : 'Create New Post'}</h1>

      <form onSubmit={editingPostId ? handleEdit : handleCreate} className="space-y-6 max-w-xl mx-auto">
        <TextInput
          type="text"
          placeholder="Post Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <Textarea
          name="description"
          placeholder="Post Description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          required
        />
        <TextInput
          type="text"
          placeholder="Features (separate by commas)"
          name="features"
          value={form.features}
          onChange={handleChange}
          required
        />
        <TextInput
          type="text"
          placeholder="Download Links (format: Text|https://link.com, pisahkan dengan koma)"
          name="downloadLinks"
          value={form.downloadLinks}
          onChange={handleChange}
        />
        <div className="flex justify-center space-x-4">
          <Button type="submit" pill color="green">
            {editingPostId ? 'Save Changes' : 'Create Post'}
          </Button>
          {editingPostId && (
            <Button pill color="red" onClick={resetForm}>
              Cancel Edit
            </Button>
          )}
        </div>
      </form>

      <h2 className="text-2xl font-bold mt-10 mb-4 text-center">Your Posts</h2>
      <ul className="list-disc space-y-4 max-w-xl mx-auto">
        {posts.map(post => (
          <li 
            key={post.id} 
            className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer"
            onClick={() => handlePostClick(post.id)} // Navigasi ke halaman PostPage ketika diklik
          >
            <div>
              <h3 className="text-xl font-bold">{post.title}</h3>
              <p>{post.description}</p>
            </div>
            <Button pill color="yellow" onClick={(e) => { e.stopPropagation(); handleEditClick(post); }}>
              Edit
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ManagePosts;
