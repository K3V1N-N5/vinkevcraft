import React, { useEffect, useState } from 'react';
import { Button, Carousel, TextInput } from "flowbite-react";
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import { db, auth } from './firebase'; // Import Firebase config
import { doc, getDoc, addDoc, collection, getDocs } from "firebase/firestore"; // Firestore
import { format } from 'date-fns'; // Untuk format waktu komentar
import AuthPage from './AuthPage'; // Import AuthPage untuk login

function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [showAuthPage, setShowAuthPage] = useState(false); // State untuk menampilkan AuthPage
  const navigate = useNavigate();

  // Mengambil data post dan komentar dari Firestore
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, "posts", postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          setPost(postSnap.data());
        } else {
          navigate('*'); // Arahkan ke halaman NotFound jika post tidak ditemukan
        }
      } catch (error) {
        setError("Gagal memuat data. Silakan coba lagi nanti.");
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const commentsRef = collection(db, "posts", postId, "comments");
        const commentsSnap = await getDocs(commentsRef);
        setComments(commentsSnap.docs.map((doc) => doc.data()));
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };

    fetchPost();
    fetchComments();
  }, [postId, navigate]);

  const handleCommentSubmit = async () => {
    if (comment.trim() !== '' && auth.currentUser) {
      await addDoc(collection(db, "posts", postId, "comments"), {
        text: comment,
        user: auth.currentUser.email,
        createdAt: new Date(),
      });
      setComment(''); // Reset komentar setelah submit
    }
  };

  // Jika user belum login dan menekan tombol login, tampilkan halaman AuthPage
  const handleLoginClick = () => {
    setShowAuthPage(true);
  };

  // Setelah login berhasil, tutup halaman AuthPage
  const handleLoginSuccess = () => {
    setShowAuthPage(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1e1e1e] dark:bg-[#1e1e1e]">
        <div className="loader">Loading...</div>
        <style jsx>{`
          .loader {
            border: 4px solid rgba(255, 255, 255, 0.3);
            border-left-color: #fff;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1e1e1e] dark:bg-[#1e1e1e]">
        <p className="text-white text-lg">{error}</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1e1e1e] dark:bg-[#1e1e1e]">
        <p className="text-white text-lg">Postingan tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 dark:text-white dark:bg-[#1e1e1e] bg-white min-h-screen flex flex-col justify-center">
      <h1 className="text-3xl font-bold mt-4 mb-6 text-center text-gray-800 dark:text-white">{post.title}</h1>

      {/* Jika showAuthPage true, tampilkan halaman AuthPage */}
      {showAuthPage ? (
        <AuthPage onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
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
            {auth.currentUser ? (
              <div>
                <TextInput
                  type="text"
                  placeholder="Tambahkan komentar"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mb-4 dark:bg-gray-700 dark:text-white text-gray-900"
                />
                <Button
                  onClick={handleCommentSubmit}
                  disabled={!comment.trim()}
                  color="blue"
                  className="w-full"
                >
                  Kirim Komentar
                </Button>
              </div>
            ) : (
              <p className="text-gray-800 dark:text-gray-300">
                <Button color="blue" pill onClick={handleLoginClick}>
                  Login untuk meninggalkan komentar
                </Button>
              </p>
            )}

            {/* Daftar Komentar */}
            <div className="mt-6">
              {comments.length > 0 ? (
                comments.map((comment, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-300 dark:border-gray-700 py-4"
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {comment.user}
                      <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                        {format(comment.createdAt.toDate(), 'PPPp')}
                      </span>
                    </p>
                    <p className="text-gray-800 dark:text-gray-300 mt-1">
                      {comment.text}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-800 dark:text-gray-300">Belum ada komentar.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default PostPage;
