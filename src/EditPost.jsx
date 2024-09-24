import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Navigate untuk redirect
import { doc, getDoc, updateDoc } from "firebase/firestore"; // Import Firestore methods
import { db } from './firebase'; // Import Firestore configuration
import { Button, TextInput, Textarea } from 'flowbite-react'; // Flowbite UI components
import { HiSave, HiX } from "react-icons/hi"; // Icons for save and cancel

function EditPost() {
  const { postId } = useParams(); // Ambil postId dari URL
  const navigate = useNavigate(); // Untuk redirect ke halaman lain
  const [loading, setLoading] = useState(true); // State untuk loading
  const [form, setForm] = useState({ // State untuk data form
    title: '',
    description: '',
    features: '',
    downloadLinks: '',
  });

  // Fetch data post dari Firestore saat komponen di-mount
  useEffect(() => {
    const fetchPost = async () => {
      const postRef = doc(db, "posts", postId); // Referensi ke dokumen di Firestore
      const postSnap = await getDoc(postRef); // Ambil dokumen dari Firestore

      if (postSnap.exists()) {
        const postData = postSnap.data();
        setForm({
          title: postData.title,
          description: postData.description,
          features: postData.features.join(', '), // Convert fitur array menjadi string
          downloadLinks: postData.downloadLinks.map(link => link.text).join(', '), // Convert downloadLinks menjadi string
        });
      } else {
        navigate('*'); // Arahkan ke NotFound jika post tidak ditemukan
      }
      setLoading(false); // Set loading ke false setelah data diambil
    };

    fetchPost();
  }, [postId, navigate]);

  // Handle perubahan input form
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Submit perubahan ke Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const postRef = doc(db, "posts", postId); // Referensi ke dokumen Firestore

    // Buat object post yang diperbarui
    const updatedPost = {
      title: form.title,
      description: form.description,
      features: form.features.split(',').map(feature => feature.trim()), // Convert string ke array
      downloadLinks: form.downloadLinks.split(',').map(link => ({ text: link.trim(), url: '#' })) // URL bisa di-custom
    };

    // Update dokumen di Firestore
    await updateDoc(postRef, updatedPost);

    // Redirect kembali ke halaman post setelah update
    navigate(`/post/${postId}`);
  };

  if (loading) {
    return <div>Loading...</div>; // Tampilkan loading jika data sedang diambil
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 dark:text-white dark:bg-[#1e1e1e] min-h-screen flex flex-col justify-center">
      <h1 className="text-3xl font-bold mb-6 text-center">Edit Post</h1>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
        {/* Input untuk judul */}
        <TextInput
          type="text"
          placeholder="Post Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
        />
        
        {/* Input untuk deskripsi */}
        <Textarea
          name="description"
          placeholder="Post Description"
          value={form.description}
          onChange={handleChange}
          rows={4}
          required
        />
        
        {/* Input untuk fitur utama */}
        <TextInput
          type="text"
          placeholder="Features (pisahkan dengan koma)"
          name="features"
          value={form.features}
          onChange={handleChange}
          required
        />
        
        {/* Input untuk download links */}
        <TextInput
          type="text"
          placeholder="Download Links (pisahkan dengan koma)"
          name="downloadLinks"
          value={form.downloadLinks}
          onChange={handleChange}
        />
        
        {/* Tombol untuk submit dan cancel */}
        <div className="flex justify-center space-x-4">
          <Button type="submit" pill color="green" icon={HiSave}>Save</Button>
          <Button pill color="red" onClick={() => navigate(`/post/${postId}`)} icon={HiX}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}

export default EditPost;
