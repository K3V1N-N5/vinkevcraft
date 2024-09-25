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
    if (user) {
      const fetchPosts = async () => {
        const postSnapshot = await getDocs(collection(db, 'posts'));
        const postList = postSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPosts(postList);
      };
      fetchPosts();
    }
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

  const handleRemoveUploadedImage = async index => {
    const imageRef = ref(storage, form.carouselImages[index]);
    try {
      await deleteObject(imageRef);
      setForm(prev => ({ ...prev, carouselImages: prev.carouselImages.filter((_, i) => i !== index) }));
    } catch (err) {
      setError(`Error deleting image: ${err.message}`);
    }
  };

  const handleRemoveUrlImage = index => {
    setForm(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) }));
  };

  const uploadFiles = async (files, folder) => {
    if (!files.length) return []; // Tambahkan pengecekan jika tidak ada file
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
    setError(null);  // Pastikan error selalu di-reset setiap kali submit

    try {
      // Upload gambar carousel dan thumbnail
      const imageUrls = await uploadFiles(imageFiles, 'images');
      const thumbnailUrl = (await uploadFiles([thumbnailFile], 'thumbnails'))[0] || form.thumbnail;

      // Buat data post baru
      const newPost = { 
        ...form, 
        carouselImages: [...form.carouselImages, ...imageUrls], 
        thumbnail: thumbnailUrl 
      };

      if (editingPostId) {
        // Jika sedang mengedit post, perbarui data post
        const postRef = doc(db, 'posts', editingPostId);
        await updateDoc(postRef, newPost);
        setPosts(posts.map(post => post.id === editingPostId ? { id: post.id, ...newPost } : post));
      } else {
        // Jika membuat post baru, tambahkan data post
        const postRef = await addDoc(collection(db, 'posts'), newPost);
        setPosts([...posts, { id: postRef.id, ...newPost }]);
      }

      resetForm();  // Reset form setelah berhasil
    } catch (err) {
      setError(`Error submitting post: ${err.message}`);
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Login />;

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
        {isAddingOrEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
            <TextInput type="text" name="title" placeholder="Post Title" value={form.title} onChange={handleChange} required />
            <Textarea name="description" placeholder="Post Description" value={form.description} onChange={handleChange} rows={4} required />
            <Textarea name="features" placeholder="Features (bullet points)" value={form.features} onChange={handleChange} rows={4} />
            <Textarea name="downloadLinks" placeholder="Download Links (Text|https://link.com)" value={form.downloadLinks} onChange={handleChange} rows={4} />
            <TextInput type="text" name="videoUrl" placeholder="Video URL" value={form.videoUrl} onChange={handleChange} />
            <Select id="category" name="category" value={form.category} onChange={handleChange}>
              <option value="All">All</option>
              <option value="Resource Pack">Resource Pack</option>
              <option value="Addon">Addon</option>
              <option value="Mod">Mod</option>
              <option value="Map">Map</option>
            </Select>
            <FileInput name="thumbnail" label="Upload Thumbnail" onChange={e => setThumbnailFile(e.target.files[0])} accept="image/*" />
            <FileInput name="carouselImages" multiple onChange={e => handleFileChange(e, setImageFiles, setPreviewImages)} accept="image/*" />
            <div className="flex space-x-4">
              {previewImages.map((image, index) => (
                <div key={index} className="relative">
                  <img src={image} alt={`Preview ${index}`} className="w-32 h-32 object-cover" />
                  <button type="button" className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full" onClick={() => handleRemoveImage(index, setImageFiles, setPreviewImages)}>&times;</button>
                  {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"><p className="text-white text-lg font-bold">{Math.round(uploadProgresses[index])}%</p></div>}
                </div>
              ))}
              {form.carouselImages.map((imageUrl, index) => (
                <div key={index} className="relative">
                  <img src={imageUrl} alt={`Uploaded ${index}`} className="w-32 h-32 object-cover" />
                  <button type="button" className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full" onClick={() => handleRemoveUploadedImage(index)}>&times;</button>
                </div>
              ))}
              {form.imageUrls.map((imageUrl, index) => (
                <div key={index} className="relative">
                  <img src={imageUrl} alt={`URL ${index}`} className="w-32 h-32 object-cover" />
                  <button type="button" className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full" onClick={() => handleRemoveUrlImage(index)}>&times;</button>
                </div>
              ))}
            </div>
            <div className="flex justify-center space-x-4">
              <Button type="submit" pill color="green">{editingPostId ? 'Save Changes' : 'Create Post'}</Button>
              <Button pill color="red" onClick={resetForm}>Cancel</Button>
            </div>
          </form>
        ) : (
          <>
            <h2 className="text-2xl font-bold mt-10 mb-4 text-center">Your Posts</h2>
            <ul className="list-disc space-y-4 max-w-xl mx-auto">
              {posts.map(post => (
                <li key={post.id} className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md cursor-pointer" onClick={() => navigate(`/post/${post.id}`)}>
                  <div>
                    <h3 className="text-xl font-bold">{post.title}</h3>
                    <p>{post.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button pill color="yellow" onClick={e => { e.stopPropagation(); handleEditClick(post); }}>Edit</Button>
                    <Button pill color="red" onClick={e => { e.stopPropagation(); handleDeletePost(post.id); }}>Delete</Button>
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
