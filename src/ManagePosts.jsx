import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db, storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
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
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [user, setUser] = useState(null);
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

  // Ambil data post setelah user login
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

  const handleImageFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setImageFiles([...imageFiles, ...newFiles]);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviews]);
  };

  const handleRemoveImage = (index, isUploaded = false) => {
    if (isUploaded) {
      const updatedImages = form.carouselImages.filter((_, i) => i !== index);
      setForm({ ...form, carouselImages: updatedImages });
    } else {
      const updatedFiles = imageFiles.filter((_, i) => i !== index);
      const updatedPreviews = previewImages.filter((_, i) => i !== index);
      setImageFiles(updatedFiles);
      setPreviewImages(updatedPreviews);
    }
  };

  const deleteImage = async (imageUrl) => {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) {
      return [];
    }

    const imageUrls = [];
    setUploading(true);
    setUploadProgress(0);

    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i];
      const imageRef = ref(storage, `images/${imageFile.name}`);

      try {
        const uploadTask = uploadBytesResumable(imageRef, imageFile);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(progress);
            },
            (error) => {
              setError(`Error uploading image: ${error.message}`);
              setUploading(false);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              imageUrls.push(downloadURL);
              if (i === imageFiles.length - 1) {
                setUploading(false);
                setUploadProgress(0);
              }
              resolve();
            }
          );
        });
      } catch (error) {
        console.error('Image upload failed:', error);
        setError('Image upload failed. Please try again.');
        return [];
      }
    }

    return imageUrls;
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
    setEditingPostId(post.id);
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
    setImageFiles([]);
    setPreviewImages([]);
    setEditingPostId(null);
    setIsAddingOrEditing(false);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError(null);
    const imageUrls = await uploadImages();
    if (imageFiles.length > 0 && imageUrls.length === 0) {
      setError('Image upload failed, please try again.');
      return;
    }
    const newPost = {
      title: form.title,
      description: form.description,
      features: form.features.split(',').map(feature => feature.trim()),
      downloadLinks: form.downloadLinks.split(',').map(link => {
        const [text, url] = link.split('|').map(item => item.trim());
        return { text, url };
      }),
      carouselImages: imageUrls,
      videoUrl: form.videoUrl,
    };

    try {
      const docRef = await addDoc(collection(db, 'posts'), newPost);
      setPosts([...posts, { id: docRef.id, ...newPost }]);
      resetForm();
    } catch (error) {
      setError(`Error creating post: ${error.message}`);
    }
  };

  const handleEditPost = async (e) => {
    e.preventDefault();
    setError(null);
    const imageUrls = await uploadImages();
    if (imageFiles.length > 0 && imageUrls.length === 0) {
      setError('Image upload failed, please try again.');
      return;
    }
    const updatedPost = {
      title: form.title,
      description: form.description,
      features: form.features.split(',').map(feature => feature.trim()),
      downloadLinks: form.downloadLinks.split(',').map(link => {
        const [text, url] = link.split('|').map(item => item.trim());
        return { text, url };
      }),
      carouselImages: [...form.carouselImages, ...imageUrls],
      videoUrl: form.videoUrl,
    };

    try {
      const postRef = doc(db, 'posts', editingPostId);
      await updateDoc(postRef, updatedPost);
      setPosts(posts.map(post => (post.id === editingPostId ? { id: post.id, ...updatedPost } : post)));
      resetForm();
    } catch (error) {
      setError(`Error updating post: ${error.message}`);
    }
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      setError(`Error deleting post: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">Loading...</div>;
  }

  if (!user) {
    return <Login onLogin={() => setUser(auth.currentUser)} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <header className="p-4 bg-gray-200 dark:bg-gray-800 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Your Posts</h1>
        <Button color="red" onClick={handleLogout}>Logout</Button>
      </header>

      <main className="flex-grow p-4">
        {!isAddingOrEditing && (
          <div className="text-center mb-6">
            <Button color="green" onClick={handleAddPostClick}>Add Post</Button>
          </div>
        )}

        {isAddingOrEditing && (
          <form onSubmit={editingPostId ? handleEditPost : handleCreatePost} className="space-y-6 max-w-xl mx-auto">
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

            <label className="block text-sm font-medium text-gray-700 dark:text-white">Upload Images (optional)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageFileChange}
              className="block w-full text-sm text-gray-900 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-300 cursor-pointer focus:outline-none"
            />

            <div className="flex flex-wrap gap-4 mt-4">
              {previewImages.map((src, index) => (
                <div key={index} className="relative">
                  <img src={src} alt={`Preview ${index}`} className="h-20 w-20 object-cover rounded-lg shadow-md" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    X
                  </button>
                </div>
              ))}
            </div>

            {form.carouselImages.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-4">
                {form.carouselImages.map((src, index) => (
                  <div key={index} className="relative">
                    <img src={src} alt={`Uploaded ${index}`} className="h-20 w-20 object-cover rounded-lg shadow-md" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index, true)}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}

            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }} />
                <p className="text-sm mt-1">{Math.round(uploadProgress)}% uploaded</p>
              </div>
            )}

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
                {editingPostId ? 'Save Changes' : 'Create Post'}
              </Button>
              <Button pill color="red" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        )}

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
                    <Button pill color="red" onClick={(e) => { e.stopPropagation(); handleDeletePost(post.id); }}>
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
