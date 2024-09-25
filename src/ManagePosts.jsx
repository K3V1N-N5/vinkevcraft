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
    imageUrls: [],
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
  const navigate = useNavigate();

  // Listener untuk status autentikasi user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Fetch posts setelah user login
  useEffect(() => {
    if (user) {
      const fetchPosts = async () => {
        try {
          const postSnapshot = await getDocs(collection(db, 'posts'));
          const postList = postSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setPosts(postList);
        } catch (err) {
          setError(`Error fetching posts: ${err.message}`);
        }
      };
      fetchPosts();
    }
  }, [user]);

  // Mengubah nilai dalam form
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Mengelola file gambar yang diunggah
  const handleFileChange = (e, setFiles, setPreviews) => {
    const files = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((file) => URL.createObjectURL(file))]);
    setUploadProgresses((prev) => [...prev, ...files.map(() => 0)]);
  };

  // Upload file ke Firebase Storage
  const uploadFiles = async (files, folder) => {
    if (!files.length) return [];
    setUploading(true);

    const urls = await Promise.all(
      files.map((file, i) => {
        return new Promise((resolve, reject) => {
          const fileRef = ref(storage, `${folder}/${file.name}`);
          const uploadTask = uploadBytesResumable(fileRef, file);

          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgresses((prev) => {
                const updated = [...prev];
                updated[i] = progress;
                return updated;
              });
            },
            (err) => {
              setError(`Upload failed: ${err.message}`);
              setUploading(false);
              reject(err);
            },
            async () => {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            }
          );
        });
      })
    );

    setUploading(false);
    return urls;
  };

  // Fungsi untuk menghapus gambar dari storage
  const handleRemoveUploadedImage = async (index) => {
    const imageUrl = form.carouselImages[index];
    const imageRef = ref(storage, imageUrl);

    try {
      await deleteObject(imageRef); // Menghapus dari Firebase Storage
      setForm((prev) => ({
        ...prev,
        carouselImages: prev.carouselImages.filter((_, i) => i !== index),
      }));
    } catch (error) {
      setError(`Error deleting image: ${error.message}`);
    }
  };

  // Reset form setelah create/edit
  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      features: '',
      downloadLinks: '',
      carouselImages: [],
      imageUrls: [],
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
  };

  // Fungsi create post atau update post
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Reset error sebelum submit

    try {
      const imageUrls = await uploadFiles(imageFiles, 'images');
      const thumbnailUrl = (await uploadFiles([thumbnailFile], 'thumbnails'))[0] || form.thumbnail;

      const newPost = {
        ...form,
        carouselImages: [...form.carouselImages, ...imageUrls],
        thumbnail: thumbnailUrl,
      };

      if (editingPostId) {
        const postRef = doc(db, 'posts', editingPostId);
        await updateDoc(postRef, newPost);
        setPosts((prev) =>
          prev.map((post) => (post.id === editingPostId ? { id: post.id, ...newPost } : post))
        );
      } else {
        const postRef = await addDoc(collection(db, 'posts'), newPost);
        setPosts((prev) => [...prev, { id: postRef.id, ...newPost }]);
      }

      resetForm();
    } catch (err) {
      setError(`Error creating/updating post: ${err.message}`);
    }
  };

  const handleEditClick = (post) => {
    setForm({
      title: post.title,
      description: post.description,
      features: post.features ? post.features.join('\n') : '',
      downloadLinks: post.downloadLinks
        ? post.downloadLinks.map((link) => `${link.text}|${link.url}`).join('\n')
        : '',
      carouselImages: post.carouselImages || [],
      imageUrls: post.imageUrls || [],
      videoUrl: post.videoUrl || '',
      category: post.category || 'All',
      thumbnail: post.thumbnail || '',
    });
    setPreviewImages([]);
    setImageFiles([]);
    setEditingPostId(post.id);
    setIsAddingOrEditing(true);
  };

  const handleDeletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setPosts((prev) => prev.filter((post) => post.id !== postId));
    } catch (error) {
      setError(`Error deleting post: ${error.message}`);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <Login />;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-white shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Your Posts</h1>
        <Button color="red" onClick={() => signOut(auth)}>
          Logout
        </Button>
      </header>
      <main className="flex-grow p-4">
        {!isAddingOrEditing && (
          <div className="text-center mb-6">
            <Button color="green" onClick={() => setIsAddingOrEditing(true)}>
              Add Post
            </Button>
          </div>
        )}

        {isAddingOrEditing && (
          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
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
              placeholder="Features (bullet points)"
              value={form.features}
              onChange={handleChange}
              rows={4}
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <Textarea
              name="downloadLinks"
              placeholder="Download Links (Text|https://link.com)"
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
              onChange={(e) => setThumbnailFile(e.target.files[0])}
              accept="image/*"
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <FileInput
              name="carouselImages"
              multiple
              onChange={(e) => handleFileChange(e, setImageFiles, setPreviewImages)}
              accept="image/*"
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <div className="flex space-x-4">
              {previewImages.map((image, index) => (
                <div key={index} className="relative">
                  <img src={image} alt={`Preview ${index}`} className="w-32 h-32 object-cover" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                    onClick={() => handleRemoveImage(index, setImageFiles, setPreviewImages)}
                  >
                    &times;
                  </button>
                  {uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <p className="text-white text-lg font-bold">{Math.round(uploadProgresses[index])}%</p>
                    </div>
                  )}
                </div>
              ))}
              {form.carouselImages.map((imageUrl, index) => (
                <div key={index} className="relative">
                  <img src={imageUrl} alt={`Uploaded ${index}`} className="w-32 h-32 object-cover" />
                  <button
                    type="button"
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full"
                    onClick={() => handleRemoveUploadedImage(index)}
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-4">
              <Button type="submit" pill color="green">
                {editingPostId ? 'Save Changes' : 'Create Post'}
              </Button>
              <Button pill color="red" onClick={resetForm}>
                Cancel
              </Button>
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
                  onClick={() => navigate(`/post/${post.id}`)}
                >
                  <div>
                    <h3 className="text-xl font-bold">{post.title}</h3>
                    <p>{post.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      pill
                      color="yellow"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(post);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      pill
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePost(post.id);
                      }}
                    >
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
