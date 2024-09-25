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
  const [form, setForm] = useState({ title: '', description: '', features: '', downloadLinks: '', carouselImages: [], imageUrls: [], videoUrl: '', category: 'All', thumbnail: '' });
  const [imageFiles, setImageFiles] = useState([]), [previewImages, setPreviewImages] = useState([]);
  const [uploading, setUploading] = useState(false), [uploadProgresses, setUploadProgresses] = useState([]);
  const [user, setUser] = useState(null), [loading, setLoading] = useState(true);
  const [error, setError] = useState(null), [isAddingOrEditing, setIsAddingOrEditing] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null), [thumbnailFile, setThumbnailFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => onAuthStateChanged(auth, (user) => { setUser(user); setLoading(false); }), []);

  useEffect(() => {
    user && getDocs(collection(db, 'posts')).then(snapshot => setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
  }, [user]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e, setFiles, setPreviews) => {
    const newFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...newFiles]);
    setPreviews(prev => [...prev, ...newFiles.map(file => URL.createObjectURL(file))]);
    setUploadProgresses(prev => [...prev, ...newFiles.map(() => 0)]);
  };

  const handleRemoveImage = (index, setFiles, setPreviews) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setUploadProgresses(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files, folder) => {
    const urls = [];
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i], refPath = ref(storage, `${folder}/${file.name}`);
      const uploadTask = uploadBytesResumable(refPath, file);
      await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          snapshot => setUploadProgresses(prev => { const updated = [...prev]; updated[i] = (snapshot.bytesTransferred / snapshot.totalBytes) * 100; return updated; }),
          reject,
          async () => {
            urls.push(await getDownloadURL(uploadTask.snapshot.ref));
            resolve();
          }
        );
      });
    }
    setUploading(false);
    return urls;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const imageUrls = await uploadFiles(imageFiles, 'images'), thumbnailUrl = await uploadFiles([thumbnailFile], 'thumbnails');
    const newPost = { ...form, carouselImages: [...form.carouselImages, ...imageUrls], thumbnail: thumbnailUrl[0] || form.thumbnail };
    try {
      editingPostId ? await updateDoc(doc(db, 'posts', editingPostId), newPost) : await addDoc(collection(db, 'posts'), newPost);
      setPosts(editingPostId ? posts.map(post => post.id === editingPostId ? { id: post.id, ...newPost } : post) : [...posts, newPost]);
      resetForm();
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
  };

  const resetForm = () => {
    setForm({ title: '', description: '', features: '', downloadLinks: '', carouselImages: [], imageUrls: [], videoUrl: '', category: 'All', thumbnail: '' });
    setImageFiles([]); setPreviewImages([]); setUploadProgresses([]); setThumbnailFile(null);
    setEditingPostId(null); setIsAddingOrEditing(false);
  };

  if (loading) return <div>Loading...</div>;
  if (!user) return <Login />;

  return (
    <div>
      <header>
        <h1>Manage Your Posts</h1>
        <Button onClick={() => signOut(auth)}>Logout</Button>
      </header>
      <main>
        {isAddingOrEditing ? (
          <form onSubmit={handleSubmit}>
            <TextInput name="title" value={form.title} onChange={handleChange} required />
            <Textarea name="description" value={form.description} onChange={handleChange} required />
            <Textarea name="features" value={form.features} onChange={handleChange} />
            <Textarea name="downloadLinks" value={form.downloadLinks} onChange={handleChange} />
            <TextInput name="videoUrl" value={form.videoUrl} onChange={handleChange} />
            <Select name="category" value={form.category} onChange={handleChange}>
              <option value="All">All</option>
              <option value="Resource Pack">Resource Pack</option>
              <option value="Addon">Addon</option>
              <option value="Mod">Mod</option>
              <option value="Map">Map</option>
            </Select>
            <FileInput onChange={e => handleFileChange(e, setImageFiles, setPreviewImages)} multiple />
            <FileInput onChange={e => handleFileChange(e, setThumbnailFile, setPreviewImages)} />
            {previewImages.map((img, i) => (
              <div key={i}>
                <img src={img} alt="preview" />
                <button type="button" onClick={() => handleRemoveImage(i, setImageFiles, setPreviewImages)}>&times;</button>
              </div>
            ))}
            <Button type="submit">{editingPostId ? 'Save' : 'Create'}</Button>
            <Button onClick={resetForm}>Cancel</Button>
          </form>
        ) : (
          <>
            <Button onClick={() => setIsAddingOrEditing(true)}>Add Post</Button>
            <ul>
              {posts.map(post => (
                <li key={post.id} onClick={() => navigate(`/post/${post.id}`)}>
                  <h3>{post.title}</h3>
                  <Button onClick={() => { setForm(post); setIsAddingOrEditing(true); }}>Edit</Button>
                  <Button onClick={() => deleteDoc(doc(db, 'posts', post.id))}>Delete</Button>
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
