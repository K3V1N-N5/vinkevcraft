import React, { useEffect, useState } from 'react';
import { Button, Carousel, TextInput, Modal } from "flowbite-react";
import { useParams } from 'react-router-dom';
import { HiArrowLeft, HiArrowRight, HiOutlineTrash, HiOutlinePencilAlt, HiThumbUp, HiThumbDown, HiReply, HiX, HiPaperAirplane } from 'react-icons/hi';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from './firebase';
import { doc, getDoc, addDoc, collection, onSnapshot, deleteDoc, getDocs } from "firebase/firestore";
import { useTheme } from './ThemeContext';

function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const { isDarkMode } = useTheme();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, "posts", postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          setPost(postSnap.data());
        } else {
          setError("Postingan tidak ditemukan");
        }
      } catch (error) {
        setError("Gagal memuat data. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      const commentsRef = collection(db, "posts", postId, "comments");
      const unsubscribe = onSnapshot(commentsRef, async (snapshot) => {
        const commentData = await Promise.all(snapshot.docs.map(async (doc) => {
          const repliesRef = collection(db, "posts", postId, "comments", doc.id, "replies");
          const repliesSnapshot = await getDocs(repliesRef);
          const replies = repliesSnapshot.docs.map(replyDoc => ({
            id: replyDoc.id,
            ...replyDoc.data(),
          }));
          return {
            id: doc.id,
            ...doc.data(),
            replies,
          };
        }));
        setComments(commentData);
      });

      return () => unsubscribe();
    };

    fetchPost();
    fetchComments();
  }, [postId]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setTheme(mediaQuery.matches ? 'dark' : 'light');
    handleChange();
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsModalOpen(false);
    } catch (error) {
      setAuthError('Login gagal: ' + error.message);
    }
    setAuthLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError(null);
    if (password !== confirmPassword) {
      setAuthError("Password tidak cocok!");
      return;
    }
    setAuthLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setIsModalOpen(false);
    } catch (error) {
      setAuthError('Registrasi gagal: ' + error.message);
    }
    setAuthLoading(false);
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setAuthError(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleCommentSubmit = async () => {
    if (comment.trim() === '') {
      setError('Komentar tidak boleh kosong.');
      return;
    }
    if (comment.length < 5) {
      setError('Komentar terlalu pendek.');
      return;
    }

    setError('');
    if (auth.currentUser) {
      if (replyTo) {
        await addDoc(collection(db, "posts", postId, "comments", replyTo.id, "replies"), {
          text: comment,
          user: auth.currentUser.email,
          repliedTo: replyTo.user,
          createdAt: new Date(),
        });
        setReplyTo(null);
      } else {
        await addDoc(collection(db, "posts", postId, "comments"), {
          text: comment,
          user: auth.currentUser.email,
          createdAt: new Date(),
          likes: [],
          dislikes: [],
        });
      }
      setComment('');
    } else {
      setIsModalOpen(true);
    }
  };

  const renderError = () => {
    if (error) {
      return (
        <p className="text-red-500 mt-2 text-sm">
          {error}
        </p>
      );
    }
    return null;
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen">{error}</div>;
  }

  return (
    <div className={`container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      <h1 className="text-3xl font-bold mt-4 mb-6 text-center text-gray-900 dark:text-white">{post.title}</h1>

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

      {post.description && (
        <section className="mb-8 mt-4">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Deskripsi</h2>
          <p className="text-gray-900 dark:text-gray-300">{post.description}</p>
        </section>
      )}

      {post.features && post.features.length > 0 && (
        <section className="mb-8 mt-4">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Fitur Utama</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-900 dark:text-gray-300">
            {post.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </section>
      )}

      {post.downloadLinks && post.downloadLinks.length > 0 && (
        <div className="flex flex-col items-center space-y-4 mt-12 mb-20">
          {post.downloadLinks.map((link, index) => (
            <Button
              key={index}
              className="w-64 text-center"
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download {link.title}
            </Button>
          ))}
        </div>
      )}

      {/* Bagian Komentar */}
      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Komentar</h2>
        <div className="mb-4">
          <TextInput
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tulis komentar Anda..."
            className="w-full"
          />
          {renderError()}
          <Button
            className="mt-2"
            onClick={handleCommentSubmit}
          >
            <HiPaperAirplane className="mr-2" /> Kirim
          </Button>
        </div>
        <div>
          {comments.map((comment) => (
            <div key={comment.id} className="mb-6 border-b pb-4">
              <div className="flex justify-between">
                <p className="font-semibold text-gray-900 dark:text-white">{comment.user}</p>
                <div className="flex space-x-2">
                  <Button
                    className="text-gray-600 dark:text-gray-400"
                    onClick={() => setReplyTo(comment)}
                  >
                    <HiReply className="mr-1" /> Balas
                  </Button>
                  <Button className="text-red-600">
                    <HiThumbDown />
                  </Button>
                  <Button className="text-blue-600">
                    <HiThumbUp />
                  </Button>
                </div>
              </div>
              <p className="text-gray-900 dark:text-gray-300">{comment.text}</p>

              {/* Render Balasan */}
              {comment.replies.length > 0 && (
                <div className="ml-8 mt-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="mb-4">
                      <p className="font-semibold text-gray-800 dark:text-gray-300">{reply.user}</p>
                      <p className="text-gray-900 dark:text-gray-400">
                        <span className="text-sm text-gray-600 dark:text-gray-500">Membalas {reply.repliedTo}</span>: {reply.text}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Modal Login/Registrasi */}
      <Modal
        show={isModalOpen}
        onClose={toggleModal}
      >
        <Modal.Header>{isLogin ? 'Login' : 'Register'}</Modal.Header>
        <Modal.Body>
          <form onSubmit={isLogin ? handleLogin : handleRegister}>
            <div className="mb-4">
              <TextInput
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full"
              />
            </div>
            <div className="mb-4">
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full"
              />
            </div>
            {!isLogin && (
              <div className="mb-4">
                <TextInput
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi Password"
                  required
                  className="w-full"
                />
              </div>
            )}
            {authError && <p className="text-red-500 mb-4">{authError}</p>}
            <Button type="submit" className="w-full">
              {authLoading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
            </Button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <p className="text-sm text-gray-500">
            {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}{' '}
            <Button
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Register' : 'Login'}
            </Button>
          </p>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default PostPage;
