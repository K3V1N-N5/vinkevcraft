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

  useEffect(() => onAuthStateChanged(auth, user => { setUser(user); setLoading(false); }), []);

  useEffect(() => {
    user && getDocs(collection(db, 'posts')).then(snapshot => setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))));
  }, [user]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileChange = (e, setFiles, setPreviews) => {
    const files = Array.from(e.target.files);
    setFiles(prev => [...prev, ...files]);
    setPreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
    setUploadProgresses(prev => [...prev, ...files.map(() => 0)]);
  };

  const handleRemoveImage = (index, setFiles, setPreviews) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setUploadProgresses(prev => prev.filter((_, i) => i !== index));
  };

  const uploadFiles = async (files, folder) => {
    setUploading(true);
    const urls = await Promise.all(files.map(async (file, i) => {
      const uploadTask = uploadBytesResumable(ref(storage, `${folder}/${file.name}`), file);
      return new Promise((resolve, reject) => {
        uploadTask.on('state_changed', 
          snapshot => setUploadProgresses(prev => { const updated = [...prev]; updated[i] = (snapshot.bytesTransferred / snapshot.totalBytes) * 100; return updated; }),
          reject,
          async () => resolve(await getDownloadURL(uploadTask.snapshot.ref))
        );
      });
    }));
    setUploading(false);
    return urls;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const imageUrls = await uploadFiles(imageFiles, 'images');
    const thumbnailUrl = (await uploadFiles([thumbnailFile], 'thumbnails'))[0] || form.thumbnail;
    const newPost = { ...form, carouselImages: [...form.carouselImages, ...imageUrls], thumbnail: thumbnailUrl };
    try {
      const postRef = editingPostId ? doc(db, 'posts', editingPostId) : collection(db, 'posts');
      editingPostId ? await updateDoc(postRef, newPost) : await addDoc(postRef, newPost);
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

  const handleEditClick = post => {
    setForm({
      title: post.title, description: post.description, features: post.features.join('\n') || '',
      downloadLinks: post.downloadLinks.map(link => `${link.text}|${link.url}`).join('\n') || '',
      carouselImages: post.carouselImages, imageUrls: post.imageUrls || [], videoUrl: post.videoUrl || '',
      category: post.category || 'All', thumbnail: post.thumbnail || ''
    });
    setEditingPostId(post.id); setIsAddingOrEditing(true);
  };

  const handleDeletePost = async postId => {
    try {
      await deleteDoc(doc(db, 'posts', postId));
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      setError(`Error deleting post: ${err.message}`);
    }
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
                  <Button onClick={() => handleEditClick(post)}>Edit</Button>
                  <Button onClick={() => handleDeletePost(post.id)}>Delete</Button>
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
