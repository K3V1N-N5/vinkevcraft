import React, { useEffect, useState } from 'react';
import { Button, Carousel, TextInput } from "flowbite-react";
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import { db, auth } from './firebase'; // Import Firebase config
import { doc, getDoc, addDoc, collection, getDocs } from "firebase/firestore"; // Import Firestore methods
import AuthPage from './AuthPage'; // Import AuthPage yang menggabungkan login dan register

function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();

  // Mengambil data post dari Firestore
  useEffect(() => {
    const fetchPost = async () => {
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);

      if (postSnap.exists()) {
        setPost(postSnap.data());
      } else {
        navigate('*'); // Arahkan ke halaman NotFound jika post tidak ditemukan
      }
      setLoading(false);
    };

    const fetchComments = async () => {
      const commentsRef = collection(db, "posts", postId, "comments");
      const commentsSnap = await getDocs(commentsRef);
      setComments(commentsSnap.docs.map(doc => doc.data()));
    };

    fetchPost();
    fetchComments();
  }, [postId, navigate]);

  const handleCommentSubmit = async () => {
    if (comment.trim() !== '' && auth.currentUser) {
      await addDoc(collection(db, "posts", postId, "comments"), {
        text: comment,
        user: auth.currentUser.email,
        createdAt: new Date()
      });
      setComment(''); // Reset komentar setelah submit
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p>Loading...</p>
      </div>
    );
  }

  // Jika user belum login, tampilkan AuthPage untuk login/register
  if (!auth.currentUser) {
    return <AuthPage />;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 dark:text-white dark:bg-[#1e1e1e] bg-white min-h-screen flex flex-col justify-center">
      <h1 className="text-3xl font-bold mt-4 mb-6 text-center text-gray-800 dark:text-white">{post.title}</h1>

      {/* Video Section */}
      {post.videoUrl && (
        <div className="relative w-full pt-[56.25%] mx-auto max-w-4xl mb-8">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={post.videoUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={post.title}
          />
        </div>
      )}

      {/* Carousel */}
      {post.carouselImages && post.carouselImages.length > 0 && (
        <div className="relative w-full max-w-4xl mx-auto mb-8">
          <Carousel
            slideInterval={3000}
            leftControl={
              <div className="bg-black bg-opacity-30 hover:bg-opacity-60 p-2 rounded-full">
                <HiArrowLeft size={35} className="text-white" />
              </div>
            }
            rightControl={
              <div className="bg-black bg-opacity-30 hover:bg-opacity-60 p-2 rounded-full">
                <HiArrowRight size={35} className="text-white" />
              </div>
            }
            className="rounded-lg"
          >
            {post.carouselImages.map((image, index) => (
              <div key={index} className="relative w-full aspect-video">
                <img
                  src={image}
                  alt={`Carousel image ${index + 1}`}
                  className="object-cover w-full h-full rounded-lg"
                />
              </div>
            ))}
          </Carousel>
          <p className="text-base text-gray-800 dark:text-gray-300 mt-4 text-center">
            Beberapa gambar terkait project ini.
          </p>
        </div>
      )}

      {/* Deskripsi */}
      {post.description && (
        <section className="mb-8 mt-4">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Deskripsi</h2>
          <p className="text-gray-800 dark:text-gray-300">{post.description}</p>
        </section>
      )}

      {/* Komentar */}
      <section className="mb-8 mt-4">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Komentar</h2>
        {/* Formulir Komentar */}
        <div>
          <TextInput
            type="text"
            placeholder="Tambahkan komentar"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mb-4 dark:bg-gray-700 dark:text-white text-gray-900"
          />
          <Button onClick={handleCommentSubmit} disabled={!comment.trim()} color="blue" className="w-full">
            Kirim Komentar
          </Button>
        </div>
        {/* Daftar Komentar */}
        <div className="mt-6">
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={index} className="border-b border-gray-300 dark:border-gray-700 py-4">
                <p className="font-semibold text-gray-900 dark:text-white">{comment.user}</p>
                <p className="text-gray-800 dark:text-gray-300">{comment.text}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-800 dark:text-gray-300">Belum ada komentar.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default PostPage;
