import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db, storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Button, TextInput, Textarea, FileInput, Select } from 'flowbite-react';
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
    imageUrls: '',
    videoUrl: '',
    category: 'All',
    thumbnail: '',
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgresses, setUploadProgresses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddingOrEditing, setIsAddingOrEditing] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

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
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviews]);
    setUploadProgresses([...uploadProgresses, ...newFiles.map(() => 0)]);
  };

  const handleThumbnailFileChange = (e) => {
    const file = e.target.files[0];
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = (index) => {
    const updatedFiles = imageFiles.filter((_, i) => i !== index);
    const updatedPreviews = previewImages.filter((_, i) => i !== index);
    const updatedProgresses = uploadProgresses.filter((_, i) => i !== index);
    setImageFiles(updatedFiles);
    setPreviewImages(updatedPreviews);
    setUploadProgresses(updatedProgresses);
  };

  const handleRemoveUploadedImage = async (index) => {
    const imageUrl = form.carouselImages[index];
    const imageRef = ref(storage, imageUrl);

    try {
      await deleteObject(imageRef);
      const updatedImages = form.carouselImages.filter((_, i) => i !== index);
      setForm({ ...form, carouselImages: updatedImages });
    } catch (error) {
      setError(`Error deleting image: ${error.message}`);
    }
  };

  const handleRemoveUrlImage = (index) => {
    const updatedUrls = form.imageUrls.split('\n').filter((_, i) => i !== index).join('\n');
    setForm({ ...form, imageUrls: updatedUrls });
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
    setForm({ ...form, thumbnail: '' });
  };

  const uploadImages = async () => {
    if (imageFiles.length === 0) {
      return [];
    }

    const imageUrls = [];
    setUploading(true);

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
              setUploadProgresses((prevProgresses) => {
                const updatedProgresses = [...prevProgresses];
                updatedProgresses[i] = progress;
                return updatedProgresses;
              });
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
              }
              resolve();
            }
          );
        });
      } catch (error) {
        setError('Image upload failed. Please try again.');
        return [];
      }
    }
    return imageUrls;
  };

  const uploadThumbnail = async () => {
    if (!thumbnailFile) return '';

    const thumbnailRef = ref(storage, `thumbnails/${thumbnailFile.name}`);
    const uploadTask = uploadBytesResumable(thumbnailRef, thumbnailFile);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Thumbnail upload progress:', progress);
        },
        (error) => {
          setError(`Error uploading thumbnail: ${error.message}`);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError(null);

    const imageUrls = await uploadImages();
    const thumbnailUrl = await uploadThumbnail();
    if (imageFiles.length > 0 && imageUrls.length === 0) {
      setError('Image upload failed, please try again.');
      return;
    }

    const newPost = {
      title: form.title,
      description: form.description,
      features: form.features ? form.features.split('\n').map(feature => `- ${feature.trim()}`) : [],
      downloadLinks: form.downloadLinks ? form.downloadLinks.split('\n').map(link => {
        const [text, url] = link.split('|').map(item => item.trim());
        return { text, url };
      }) : [],
      carouselImages: [...form.carouselImages, ...imageUrls],
      imageUrls: form.imageUrls.split('\n'),
      videoUrl: form.videoUrl || '',
      category: form.category,
      thumbnail: thumbnailUrl,
    };

    try {
      await addDoc(collection(db, 'posts'), newPost);
      setPosts([...posts, newPost]);
      resetForm();
    } catch (error) {
      setError(`Error creating post: ${error.message}`);
    }
  };

  const handleEditPost = async (e) => {
    e.preventDefault();
    setError(null);
    const imageUrls = await uploadImages();
    const thumbnailUrl = await uploadThumbnail();

    const updatedPost = {
      title: form.title,
      description: form.description,
      features: form.features ? form.features.split('\n').map(feature => `- ${feature.trim()}`) : [],
      downloadLinks: form.downloadLinks ? form.downloadLinks.split('\n').map(link => {
        const [text, url] = link.split('|').map(item => item.trim());
        return { text, url };
      }) : [],
      carouselImages: [...form.carouselImages, ...imageUrls],
      imageUrls: form.imageUrls.split('\n'),
      videoUrl: form.videoUrl || '',
      category: form.category,
      thumbnail: thumbnailUrl || form.thumbnail,
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

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      features: '',
      downloadLinks: '',
      carouselImages: [],
      imageUrls: '',
      videoUrl: '',
      category: 'All',
      thumbnail: '',
    });
    setImageFiles([]);
    setPreviewImages([]);
    setEditingPostId(null);
    setIsAddingOrEditing(false);
    setUploadProgresses([]);
    setThumbnailFile(null);
    setThumbnailPreview('');
  };

  const handleEditClick = (post) => {
    setForm({
      title: post.title,
      description: post.description,
      features: post.features ? post.features.join('\n') : '',
      downloadLinks: post.downloadLinks ? post.downloadLinks.map(link => `${link.text}|${link.url}`).join('\n') : '',
      carouselImages: post.carouselImages || [],
      imageUrls: post.imageUrls.join('\n'),
      videoUrl: post.videoUrl || '',
      category: post.category || 'All',
      thumbnail: post.thumbnail || '',
    });
    setPreviewImages([]);
    setImageFiles([]);
    setEditingPostId(post.id);
    setIsAddingOrEditing(true);
    setThumbnailPreview(post.thumbnail || '');
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setPosts(posts.filter(post => post.id !== postId));
    } catch (error) {
      setError(`Error deleting post: ${error.message}`);
    }
  };

  const handleNavigateToPost = (postId) => {
    navigate(`/post/${postId}`);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-white shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Your Posts</h1>
        <Button color="red" onClick={() => signOut(auth)}>Logout</Button>
      </header>

      <main className="flex-grow p-4">
        {!isAddingOrEditing && (
          <div className="text-center mb-6">
            <Button color="green" onClick={() => setIsAddingOrEditing(true)}>Add Post</Button>
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
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <Textarea
              name="description"
              placeholder="Post Description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <Textarea
              name="features"
              placeholder="Features (tulis ke bawah, gunakan '-' untuk bullet points)"
              value={form.features}
              onChange={handleChange}
              rows={4}
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <Textarea
              name="downloadLinks"
              placeholder="Download Links (format: Text|https://link.com, tulis ke bawah)"
              value={form.downloadLinks}
              onChange={handleChange}
              rows={4}
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <TextInput
              type="text"
              placeholder="Video URL"
              name="videoUrl"
              value={form.videoUrl}
              onChange={handleChange}
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />

            <Select
              id="category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="All">All</option>
              <option value="Resource Pack">Resource Pack</option>
              <option value="Addon">Addon</option>
              <option value="Mod">Mod</option>
              <option value="Map">Map</option>
            </Select>

            <FileInput
              name="thumbnail"
              label="Upload Thumbnail"
              onChange={handleThumbnailFileChange}
              accept="image/*"
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />

            <FileInput
              name="carouselImages"
              multiple
              onChange={handleImageFileChange}
              accept="image/*"
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />

            <Textarea
              name="imageUrls"
              placeholder="Edit Image URLs (tulis kebawah untuk multiple links)"
              value={form.imageUrls}
              onChange={handleChange}
              rows={4}
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />

            {/* Integrated Image and Thumbnail View */}
            <div className="flex flex-wrap gap-4">
              {/* Thumbnail Preview or Uploaded */}
              {thumbnailPreview && (
                <div className="relative w-32 h-32">
                  <img src={thumbnailPreview} alt="Thumbnail Preview" className="w-full h-full object-cover rounded" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                    onClick={handleRemoveThumbnail}
                  >
                    &times;
                  </button>
                  <span className="absolute bottom-0 left-0 bg-black text-white text-xs px-1 py-0.5 rounded">Thumbnail</span>
                </div>
              )}
              {form.thumbnail && !thumbnailPreview && (
                <div className="relative w-32 h-32">
                  <img src={form.thumbnail} alt="Uploaded Thumbnail" className="w-full h-full object-cover rounded" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                    onClick={handleRemoveThumbnail}
                  >
                    &times;
                  </button>
                  <span className="absolute bottom-0 left-0 bg-black text-white text-xs px-1 py-0.5 rounded">Thumbnail</span>
                </div>
              )}

              {/* Preview Images */}
              {previewImages.map((image, index) => (
                <div key={index} className="relative w-32 h-32">
                  <img src={image} alt={`Preview ${index}`} className="w-full h-full object-cover rounded" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                    onClick={() => handleRemoveImage(index)}
                  >
                    &times;
                  </button>
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
                      <p className="text-white text-lg font-bold">{Math.round(uploadProgresses[index])}%</p>
                    </div>
                  )}
                  <span className="absolute bottom-0 left-0 bg-black text-white text-xs px-1 py-0.5 rounded">Preview Image</span>
                </div>
              ))}

              {/* Uploaded Carousel Images */}
              {form.carouselImages.map((imageUrl, index) => (
                <div key={index} className="relative w-32 h-32">
                  <img src={imageUrl} alt={`Uploaded ${index}`} className="w-full h-full object-cover rounded" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                    onClick={() => handleRemoveUploadedImage(index)}
                  >
                    &times;
                  </button>
                  <span className="absolute bottom-0 left-0 bg-black text-white text-xs px-1 py-0.5 rounded">Uploaded Image</span>
                </div>
              ))}

              {/* External URL Images */}
              {form.imageUrls.split('\n').map((imageUrl, index) => (
                <div key={index} className="relative w-32 h-32">
                  <img src={imageUrl} alt={`URL ${index}`} className="w-full h-full object-cover rounded" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                    onClick={() => handleRemoveUrlImage(index)}
                  >
                    &times;
                  </button>
                  <span className="absolute bottom-0 left-0 bg-black text-white text-xs px-1 py-0.5 rounded">External URL</span>
                </div>
              ))}
            </div>

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
            <h2 className="text-2xl font-bold mt-10 mb-4 text-center text-gray-900 dark:text-white">Your Posts</h2>
            <ul className="list-disc space-y-4 max-w-xl mx-auto text-gray-900 dark:text-white">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer"
                  onClick={() => handleNavigateToPost(post.id)}
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
