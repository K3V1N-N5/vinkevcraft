import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, getDocs, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Tambahkan untuk Firebase Storage
import { db, storage } from './firebase'; // Firebase Firestore dan Storage
import { Button, TextInput, Textarea } from 'flowbite-react'; // Flowbite components
import { useNavigate } from 'react-router-dom';

function ManagePosts() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    features: '',
    downloadLinks: '',
    carouselImages: '', // Untuk URL atau file gambar
    videoUrl: '',
  });
  const [imageFile, setImageFile] = useState(null); // State untuk menyimpan file gambar
  const [editingPostId, setEditingPostId] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      const postCollection = collection(db, "posts");
      const postSnapshot = await getDocs(postCollection);
      const postList = postSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(postList);
      setLoading(false);
    };

    fetchPosts();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageFileChange = (e) => {
    setImageFile(e.target.files[0]); // Menyimpan file gambar yang dipilih
  };

  const uploadImage = async () => {
    if (imageFile) {
      const imageRef = ref(storage, `images/${imageFile.name}`);
      const snapshot = await uploadBytes(imageRef, imageFile); // Upload gambar ke Firebase Storage
      const downloadURL = await getDownloadURL(snapshot.ref); // Dapatkan URL gambar dari Storage
      return downloadURL; // Mengembalikan URL gambar yang diupload
    }
    return form.carouselImages ? form.carouselImages : ''; // Jika URL link gambar diisi, kembalikan URL
  };

  // Fungsi untuk membuat post baru
  const handleCreate = async (e) => {
    e.preventDefault();
    const imageUrl = await uploadImage(); // Upload gambar atau gunakan URL yang diinput
    const newPost = {
      title: form.title,
      description: form.description,
      features: form.features.split(',').map(feature => feature.trim()),
      downloadLinks: form.downloadLinks.split(',').map(link => {
        const [text, url] = link.split('|').map(item => item.trim());
        return { text, url };
      }),
      carouselImages: imageUrl ? [imageUrl] : [], // Jika ada gambar yang diupload atau URL, gunakan itu
      videoUrl: form.videoUrl || '',
    };
    const docRef = await addDoc(collection(db, "posts"), newPost);
    setPosts([...posts, { id: docRef.id, ...newPost }]);
    resetForm();
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    const imageUrl = await uploadImage(); // Upload gambar atau gunakan URL yang diinput
    const postRef = doc(db, "posts", editingPostId);
    const updatedPost = {
      title: form.title,
      description: form.description,
      features: form.features.split(',').map(feature => feature.trim()),
      downloadLinks: form.downloadLinks.split(',').map(link => {
        const [text, url] = link.split('|').map(item => item.trim());
        return { text, url };
      }),
      carouselImages: imageUrl ? [imageUrl] : [],
      videoUrl: form.videoUrl || '',
    };
    await updateDoc(postRef, updatedPost);
    setPosts(posts.map(post => (post.id === editingPostId ? { id: post.id, ...updatedPost } : post)));
    resetForm();
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      features: '',
      downloadLinks: '',
      carouselImages: '',
      videoUrl: '',
    });
    setImageFile(null); // Reset file gambar
    setEditingPostId(null);
  };

  const handleEditClick = (post) => {
    setForm({
      title: post.title,
      description: post.description,
      features: post.features.join(', '),
      downloadLinks: post.downloadLinks.map(link => `${link.text}|${link.url}`).join(', '),
      carouselImages: post.carouselImages ? post.carouselImages.join(', ') : '',
      videoUrl: post.videoUrl || '',
    });
    setEditingPostId(post.id);
  };

  const handlePostClick = (postId) => {
    navigate(`/posts/${postId}`);
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
        
        {/* Input untuk URL atau Upload Gambar */}
        <TextInput
          type="text"
          placeholder="Image URL (optional)"
          name="carouselImages"
          value={form.carouselImages}
          onChange={handleChange}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageFileChange}
          className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none"
        />

        <TextInput
          type="text"
          placeholder="YouTube Video URL (optional)"
          name="videoUrl"
          value={form.videoUrl}
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
            onClick={() => handlePostClick(post.id)} 
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
