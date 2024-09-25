import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from './firebase';
import { Button, TextInput, Textarea, Progress } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';

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
  const [imageFiles, setImageFiles] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postCollection = collection(db, "posts");
        const postSnapshot = await getDocs(postCollection);
        const postList = postSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(postList);
      } catch (err) {
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
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
    setImageFiles([...imageFiles, ...e.target.files]); 
  };

  const uploadImages = async () => {
    const imageUrls = [];
    setUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < imageFiles.length; i++) {
        const imageFile = imageFiles[i];
        const imageRef = ref(storage, `images/${imageFile.name}`);
        const uploadTask = uploadBytesResumable(imageRef, imageFile);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              imageUrls.push(downloadURL);
              resolve();
            }
          );
        });
      }
    } catch (error) {
      setError(`Error uploading image: ${error.message}`);
      setUploading(false);
      return [];
    }

    setUploading(false);
    setUploadProgress(0);
    return imageUrls; 
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);

    const imageUrls = await uploadImages(); 
    if (imageUrls.length === 0 && imageFiles.length > 0) {
      setError("Image upload failed, please try again.");
      return;
    }

    const newPost = {
      title: form.title,
      description: form.description,
      features: form.features ? form.features.split(',').map(feature => feature.trim()) : [],
      downloadLinks: form.downloadLinks ? form.downloadLinks.split(',').map(link => {
        const [text, url] = link.split('|').map(item => item.trim());
        return { text, url };
      }) : [],
      carouselImages: [...form.carouselImages, ...imageUrls],
      videoUrl: form.videoUrl || '',
    };

    try {
      const docRef = await addDoc(collection(db, "posts"), newPost);
      setPosts([...posts, { id: docRef.id, ...newPost }]);
      resetForm();
    } catch (error) {
      setError(`Error creating post: ${error.message}`);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setError(null);

    const imageUrls = await uploadImages(); 
    if (imageUrls.length === 0 && imageFiles.length > 0) {
      setError("Image upload failed, please try again.");
      return;
    }

    const postRef = doc(db, "posts", editingPostId);
    const updatedPost = {
      ...form,
      features: form.features.split(',').map(f => f.trim()),
      downloadLinks: form.downloadLinks.split(',').map(link => {
        const [text, url] = link.split('|').map(item => item.trim());
        return { text, url };
      }),
      carouselImages: [...form.carouselImages, ...imageUrls],
    };

    try {
      await updateDoc(postRef, updatedPost);
      setPosts(posts.map(post => (post.id === editingPostId ? { id: post.id, ...updatedPost } : post)));
      resetForm();
    } catch (error) {
      setError(`Error updating post: ${error.message}`);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await deleteDoc(doc(db, "posts", postId));
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      setError(`Error deleting post: ${error.message}`);
    }
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
    setImageFiles([]);
    setEditingPostId(null);
  };

  const handleEditClick = (post) => {
    setForm({
      ...post,
      features: post.features.join(', '),
      downloadLinks: post.downloadLinks.map(link => `${link.text}|${link.url}`).join(', '),
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

      {error && <div className="text-red-500 mb-4 text-center">{error}</div>}

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
          placeholder="Features (separate by commas, optional)"
          name="features"
          value={form.features}
          onChange={handleChange}
        />
        <TextInput
          type="text"
          placeholder="Download Links (format: Text|https://link.com, pisahkan dengan koma, optional)"
          name="downloadLinks"
          value={form.downloadLinks}
          onChange={handleChange}
        />
        
        <label className="block text-sm font-medium text-gray-700">Upload Images (optional)</label>
        <TextInput
          type="text"
          placeholder="Image URLs (optional, separate by commas)"
          name="carouselImages"
          value={form.carouselImages.join(', ')}
          onChange={(e) => setForm({ ...form, carouselImages: e.target.value.split(',').map(url => url.trim()) })}
        />
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageFileChange}
          className="block w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 cursor-pointer focus:outline-none"
        />

        {uploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            />
            <p className="text-sm mt-1">{Math.round(uploadProgress)}% uploaded</p>
          </div>
        )}

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
            <div className="flex space-x-2">
              <Button pill color="yellow" onClick={(e) => { e.stopPropagation(); handleEditClick(post); }}>
                Edit
              </Button>
              <Button pill color="red" onClick={(e) => { e.stopPropagation(); handleDelete(post.id); }}>
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ManagePosts;
