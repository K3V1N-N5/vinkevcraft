import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db, storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Button, TextInput, Textarea, FileInput, Select } from 'flowbite-react'; // Tambahkan Select dari Flowbite
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
    category: 'All', // Tambahkan kategori di form
    thumbnail: '', // Thumbnail untuk post
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
  const [imageLink, setImageLink] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null); // Tambahkan state untuk thumbnail
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
    setThumbnailFile(e.target.files[0]); // Set file thumbnail
  };

  const handleRemoveImage = (index, isUploaded = false, isUrl = false) => {
    if (isUploaded) {
      const updatedImages = form.carouselImages.filter((_, i) => i !== index);
      setForm({ ...form, carouselImages: updatedImages });
    } else if (isUrl) {
      const updatedUrls = form.imageUrls.filter((_, i) => i !== index);
      setForm({ ...form, imageUrls: updatedUrls });
    } else {
      const updatedFiles = imageFiles.filter((_, i) => i !== index);
      const updatedPreviews = previewImages.filter((_, i) => i !== index);
      const updatedProgresses = uploadProgresses.filter((_, i) => i !== index);
      setImageFiles(updatedFiles);
      setPreviewImages(updatedPreviews);
      setUploadProgresses(updatedProgresses);
    }
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
        console.error('Image upload failed:', error);
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
    const thumbnailUrl = await uploadThumbnail(); // Upload thumbnail
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
      imageUrls: form.imageUrls,
      videoUrl: form.videoUrl || '',
      category: form.category, // Simpan kategori
      thumbnail: thumbnailUrl, // Simpan URL thumbnail
    };

    try {
      await addDoc(collection(db, 'posts'), newPost);
      setPosts([...posts, newPost]);
      resetForm();
    } catch (error) {
      setError(`Error creating post: ${error.message}`);
    }
  };

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      features: '',
      downloadLinks: '',
      carouselImages: [],
      imageUrls: [],
      videoUrl: '',
      category: 'All', // Reset kategori ke default
      thumbnail: '',
    });
    setImageFiles([]);
    setPreviewImages([]);
    setEditingPostId(null);
    setIsAddingOrEditing(false);
    setImageLink('');
    setUploadProgresses([]);
    setThumbnailFile(null); // Reset thumbnail file
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

            {/* Dropdown Kategori */}
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

            {/* Thumbnail Input */}
            <FileInput
              name="thumbnail"
              label="Upload Thumbnail"
              onChange={handleThumbnailFileChange}
              accept="image/*"
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />

            {/* Carousel Images */}
            <FileInput
              name="carouselImages"
              multiple
              onChange={handleImageFileChange}
              accept="image/*"
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />

            {/* Submit & Cancel Buttons */}
            <div className="flex justify-center space-x-4">
              <Button type="submit" pill color="green">
                {editingPostId ? 'Save Changes' : 'Create Post'}
              </Button>
              <Button pill color="red" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        )}

        {/* Tampilkan post yang ada */}
        {!isAddingOrEditing && (
          <>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-center text-gray-900 dark:text-white">Your Posts</h2>
            <ul className="list-disc space-y-4 max-w-xl mx-auto text-gray-900 dark:text-white">
              {posts.map((post) => (
                <li
                  key={post.id}
                  className="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-md cursor-pointer"
                >
                  <div>
                    <h3 className="text-xl font-bold">{post.title}</h3>
                    <p>{post.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button pill color="yellow">Edit</Button>
                    <Button pill color="red">Delete</Button>
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
