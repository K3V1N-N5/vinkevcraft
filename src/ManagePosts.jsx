import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, getDocs, doc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db, storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Button, TextInput, Textarea, FileInput, Select } from 'flowbite-react';
import { useNavigate } from 'react-router-dom';
import Login from './Login';

const initialFormState = {
  title: '',
  description: '',
  features: '',
  downloadLinks: '',
  carouselImages: [],
  imageUrls: [],
  videoUrl: '',
  category: 'All',
  thumbnail: '',
};

function ManagePosts() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(initialFormState);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgresses, setUploadProgresses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingPostId, setEditingPostId] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
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
        const postSnapshot = await getDocs(collection(db, 'posts'));
        setPosts(postSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      };
      fetchPosts();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...newFiles]);
    setPreviewImages((prev) => [...prev, ...newFiles.map(URL.createObjectURL)]);
    setUploadProgresses((prev) => [...prev, ...newFiles.map(() => 0)]);
  };

  const handleRemove = (setter) => (index) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files, path) => {
    const urls = [];
    for (let i = 0; i < files.length; i++) {
      const fileRef = ref(storage, `${path}/${files[i].name}`);
      const uploadTask = uploadBytesResumable(fileRef, files[i]);
      await new Promise((resolve, reject) => {
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
          (error) => {
            setError(`Error uploading: ${error.message}`);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            urls.push(downloadURL);
            resolve();
          }
        );
      });
    }
    return urls;
  };

  const handleCreateOrUpdatePost = async (e, isEdit) => {
    e.preventDefault();
    setError(null);

    const imageUrls = await uploadFiles(imageFiles, 'images');
    const thumbnailUrl = thumbnailFile ? await uploadFiles([thumbnailFile], 'thumbnails') : '';

    const newPost = {
      ...form,
      features: form.features.split('\n').map((feature) => `- ${feature.trim()}`),
      downloadLinks: form.downloadLinks.split('\n').map((link) => {
        const [text, url] = link.split('|').map(item => item.trim());
        return { text, url };
      }),
      carouselImages: [...form.carouselImages, ...imageUrls],
      thumbnail: thumbnailUrl || form.thumbnail,
    };

    try {
      const action = isEdit ? updateDoc(doc(db, 'posts', editingPostId), newPost) : addDoc(collection(db, 'posts'), newPost);
      await action;
      setPosts((prev) => isEdit ? prev.map(post => (post.id === editingPostId ? { id: post.id, ...newPost } : post)) : [...prev, newPost]);
      resetForm();
    } catch (error) {
      setError(`Error ${isEdit ? 'updating' : 'creating'} post: ${error.message}`);
    }
  };

  const resetForm = () => {
    setForm(initialFormState);
    setImageFiles([]);
    setPreviewImages([]);
    setEditingPostId(null);
    setUploadProgresses([]);
    setThumbnailFile(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Login />;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-gray-200 dark:bg-gray-900 text-gray-900 dark:text-white shadow-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manage Your Posts</h1>
        <Button color="red" onClick={() => signOut(auth)}>Logout</Button>
      </header>

      <main className="flex-grow p-4">
        <div className="text-center mb-6">
          <Button color="green" onClick={() => resetForm()}>Add Post</Button>
        </div>

        <form onSubmit={(e) => handleCreateOrUpdatePost(e, Boolean(editingPostId))} className="space-y-6 max-w-xl mx-auto">
          <TextInput {...{ type: 'text', placeholder: 'Post Title', name: 'title', value: form.title, onChange: handleChange, required: true }} />
          <Textarea {...{ name: 'description', placeholder: 'Post Description', value: form.description, onChange: handleChange, rows: 4, required: true }} />
          <Textarea {...{ name: 'features', placeholder: 'Features', value: form.features, onChange: handleChange, rows: 4 }} />
          <Textarea {...{ name: 'downloadLinks', placeholder: 'Download Links', value: form.downloadLinks, onChange: handleChange, rows: 4 }} />
          <TextInput {...{ type: 'text', placeholder: 'Video URL', name: 'videoUrl', value: form.videoUrl, onChange: handleChange }} />
          <Select {...{ name: 'category', value: form.category, onChange: handleChange, required: true }}>
            <option value="All">All</option>
            <option value="Resource Pack">Resource Pack</option>
            <option value="Addon">Addon</option>
            <option value="Mod">Mod</option>
            <option value="Map">Map</option>
          </Select>
          <FileInput {...{ name: 'thumbnail', label: 'Upload Thumbnail', onChange: (e) => setThumbnailFile(e.target.files[0]), accept: 'image/*' }} />
          <FileInput {...{ name: 'carouselImages', multiple: true, onChange: handleImageFileChange, accept: 'image/*' }} />

          <div className="flex space-x-4">
            {previewImages.map((image, index) => (
              <ImagePreview key={index} src={image} onRemove={handleRemove(setPreviewImages)(index)} uploadProgress={uploading ? uploadProgresses[index] : undefined} />
            ))}
            {form.carouselImages.map((url, index) => (
              <ImagePreview key={index} src={url} onRemove={handleRemove(setForm)((prev) => ({ ...prev, carouselImages: prev.carouselImages.filter((_, i) => i !== index) })))} />
            ))}
            {form.imageUrls.map((url, index) => (
              <ImagePreview key={index} src={url} onRemove={handleRemove(setForm)((prev) => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) })))} />
            ))}
          </div>

          <div className="flex justify-center space-x-4">
            <Button type="submit" pill color="green">{editingPostId ? 'Save Changes' : 'Create Post'}</Button>
            <Button pill color="red" onClick={resetForm}>Cancel</Button>
          </div>
        </form>

        <h2 className="text-2xl font-bold mt-10 mb-4 text-center">Your Posts</h2>
        <ul className="list-disc space-y-2">
          {posts.map((post) => (
            <li key={post.id} className="flex justify-between items-center">
              <span>{post.title}</span>
              <div className="flex space-x-2">
                <Button color="yellow" onClick={() => { setEditingPostId(post.id); setForm({ ...post, features: post.features.join('\n'), downloadLinks: post.downloadLinks.map(link => `${link.text} | ${link.url}`).join('\n') }); }}>Edit</Button>
                <Button color="red" onClick={() => handleRemovePost(post.id)}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}

const ImagePreview = ({ src, onRemove, uploadProgress }) => (
  <div className="relative">
    <img src={src} alt="preview" className="w-32 h-32 object-cover rounded-md shadow-md" />
    {uploadProgress >= 0 && (
      <div className="absolute top-0 left-0 right-0 bg-blue-500 h-1" style={{ width: `${uploadProgress}%` }} />
    )}
    <Button onClick={onRemove} color="red" className="absolute top-0 right-0">Remove</Button>
  </div>
);

export default ManagePosts;
