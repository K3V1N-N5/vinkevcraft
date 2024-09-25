import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db, storage } from './firebase';
import { Button, TextInput, Textarea } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';

function ManagePosts() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    features: '',
    downloadLinks: '',
    carouselImages: [],
    videoUrl: '',
  });
  const [user, setUser] = useState(null); // Untuk pengguna yang terautentikasi
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false);
  const navigate = useNavigate();

  // Cek status login pengguna
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Ambil post setelah user login
  useEffect(() => {
    if (user) {
      const fetchPosts = async () => {
        const postCollection = collection(db, 'posts');
        const postSnapshot = await getDocs(postCollection);
        const postList = postSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPosts(postList);
      };

      fetchPosts();
    }
  }, [user]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const handleAddPostClick = () => {
    resetForm();
    setIsAddingOrEditing(true); 
  };

  const handleEditClick = (post) => {
    setForm({
      title: post.title,
      description: post.description,
      features: post.features.join(', '),
      downloadLinks: post.downloadLinks.map(link => `${link.text}|${link.url}`).join(', '),
      carouselImages: post.carouselImages ? post.carouselImages : [],
      videoUrl: post.videoUrl || '',
    });
    setIsAddingOrEditing(true);
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      features: '',
      downloadLinks: '',
      carouselImages: [],
      videoUrl: '',
    });
    setIsAddingOrEditing(false);
  };

  const handlePostClick = (postId) => {
    navigate(`/posts/${postId}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">Loading...</div>;
  }

  if (!user) {
    return <Login onLogin={() => setUser(auth.currentUser)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Header dengan tombol Logout */}
      <header className="p-4 bg-gray-200 dark:bg-gray-800 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Your Posts</h1>
        <Button color="red" onClick={handleLogout}>
          Logout
        </Button>
      </header>

      {/* Konten Utama */}
      <main className="flex-grow p-4">
        {/* Tombol untuk menambahkan post baru */}
        {!isAddingOrEditing && (
          <div className="text-center mb-6">
            <Button color="green" onClick={handleAddPostClick}>
              Add Post
            </Button>
          </div>
        )}

        {/* Form untuk membuat atau mengedit post */}
        {isAddingOrEditing && (
          <form className="space-y-6 max-w-xl mx-auto">
            <TextInput
              type="text"
              placeholder="Post Title"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="bg-white dark:bg-gray-700 dark:text-white text-gray-900"
            />
            <Textarea
              name="description"
              placeholder="Post Description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
              className="bg-white dark:bg-gray-700 dark:text-white text-gray-900"
            />
            <TextInput
              type="text"
              placeholder="Features (separate by commas, optional)"
              name="features"
              value={form.features}
              onChange={handleChange}
              className="bg-white dark:bg-gray-700 dark:text-white text-gray-900"
            />
            <TextInput
              type="text"
              placeholder="Download Links (format: Text|https://link.com, pisahkan dengan koma, optional)"
              name="downloadLinks"
              value={form.downloadLinks}
              onChange={handleChange}
              className="bg-white dark:bg-gray-700 dark:text-white text-gray-900"
            />
            <TextInput
              type="text"
              placeholder="YouTube Video URL (optional)"
              name="videoUrl"
              value={form.videoUrl}
              onChange={handleChange}
              className="bg-white dark:bg-gray-700 dark:text-white text-gray-900"
            />
            <div className="flex justify-center space-x-4">
              <Button type="submit" pill color="green">
                Save Post
              </Button>
              <Button pill color="red" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Daftar post */}
        {!isAddingOrEditing && (
          <>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-center">Your Posts</h2>
            <ul className="list-disc space-y-4 max-w-xl mx-auto">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer"
                  onClick={() => handlePostClick(post.id)}
                >
                  <div>
                    <h3 className="text-xl font-bold">{post.title}</h3>
                    <p>{post.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button pill color="yellow" onClick={(e) => { e.stopPropagation(); handleEditClick(post); }}>
                      Edit
                    </Button>
                    <Button pill color="red" onClick={(e) => { e.stopPropagation(); console.log('Delete Post'); }}>
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}

export default ManagePosts;
