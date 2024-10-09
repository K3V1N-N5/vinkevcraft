import React, { useEffect, useState } from 'react';
import { Button, Carousel, TextInput, Modal } from "flowbite-react";
import { useParams } from 'react-router-dom';
import { HiArrowLeft, HiArrowRight, HiOutlineTrash, HiOutlinePencilAlt, HiThumbUp, HiThumbDown, HiReply } from 'react-icons/hi';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from './firebase';
import { doc, getDoc, addDoc, collection, onSnapshot, updateDoc, deleteDoc, query, getDocs } from "firebase/firestore";
import { useTheme } from './ThemeContext';

function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [editCommentId, setEditCommentId] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [filterError, setFilterError] = useState('');
  const { isDarkMode } = useTheme();
  const [theme, setTheme] = useState('light');
  const [captchaLoaded, setCaptchaLoaded] = useState(false);

  // Fetch post dan komentar dari Firestore
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
          // Fetching replies for each comment
          const repliesRef = collection(db, "posts", postId, "comments", doc.id, "replies");
          const repliesSnapshot = await getDocs(repliesRef);
          const replies = repliesSnapshot.docs.map(replyDoc => ({
            id: replyDoc.id,
            ...replyDoc.data(),
          }));
          
          return {
            id: doc.id,
            ...doc.data(),
            replies, // Include replies in comment data
          };
        }));
        setComments(commentData); // Set comments with replies
      });

      return () => unsubscribe();
    };

    fetchPost();
    fetchComments();
  }, [postId]);

  // Update tema berdasarkan preferensi pengguna
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setTheme(mediaQuery.matches ? 'dark' : 'light');

    handleChange(); // Set theme saat mount
    mediaQuery.addEventListener('change', handleChange); // Listen for theme changes

    return () => {
      mediaQuery.removeEventListener('change', handleChange); // Clean up
    };
  }, []);

  // Muat reCAPTCHA hanya sekali dan sesuai tema
  useEffect(() => {
    if (!captchaLoaded) {
      if (window.grecaptcha) {
        window.grecaptcha.render('captcha-container', {
          sitekey: '6Lf-JlwqAAAAACctWhsiWBb76IMJdjaCL75XQEbv',
          theme: theme,
        });
        setCaptchaLoaded(true); // Captcha hanya di-load sekali
      }
    } else {
      // Mengganti tema reCAPTCHA ketika tema berubah
      window.grecaptcha.reset();
      window.grecaptcha.render('captcha-container', {
        sitekey: '6Lf-JlwqAAAAACctWhsiWBb76IMJdjaCL75XQEbv',
        theme: theme,
      });
    }
  }, [theme, captchaLoaded]);

  // Submit komentar atau balasan
  const handleCommentSubmit = async () => {
    if (comment.trim() === '') {
      setFilterError('Komentar tidak boleh kosong.');
      return;
    }
    if (comment.length < 5) {
      setFilterError('Komentar terlalu pendek.');
      return;
    }

    setFilterError('');
    if (auth.currentUser) {
      if (replyTo) {
        await addDoc(collection(db, "posts", postId, "comments", replyTo.id, "replies"), {
          text: comment,
          user: displayName || auth.currentUser.email,
          createdAt: new Date(),
        });
        setReplyTo(null);
      } else if (editCommentId) {
        await updateDoc(doc(db, "posts", postId, "comments", editCommentId), {
          text: comment,
        });
        setEditCommentId(null); // Clear edit state
      } else {
        await addDoc(collection(db, "posts", postId, "comments"), {
          text: comment,
          user: displayName || auth.currentUser.email,
          createdAt: new Date(),
          likes: [],
          dislikes: [],
        });
      }
      setComment(''); // Clear input
    } else {
      setIsModalOpen(true);
    }
  };

  // Fungsi edit komentar
  const handleEditComment = (commentId, text) => {
    setEditCommentId(commentId);
    setComment(text); // Masukkan teks komentar yang ingin diubah ke dalam input
  };

  // Like dan Dislike komentar
  const handleLike = async (commentId) => {
    if (!auth.currentUser) {
      setIsModalOpen(true);
      return;
    }

    const userEmail = auth.currentUser?.email;
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    const commentSnap = await getDoc(commentRef);
    const commentData = commentSnap.data();

    if (commentData && !commentData.likes.includes(userEmail)) {
      await updateDoc(commentRef, {
        likes: [...commentData.likes, userEmail],
        dislikes: commentData.dislikes.filter((email) => email !== userEmail),
      });
    } else {
      await updateDoc(commentRef, {
        likes: commentData.likes.filter((email) => email !== userEmail),
      });
    }
  };

  const handleDislike = async (commentId) => {
    if (!auth.currentUser) {
      setIsModalOpen(true);
      return;
    }

    const userEmail = auth.currentUser?.email;
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    const commentSnap = await getDoc(commentRef);
    const commentData = commentSnap.data();

    if (commentData && !commentData.dislikes.includes(userEmail)) {
      await updateDoc(commentRef, {
        dislikes: [...commentData.dislikes, userEmail],
        likes: commentData.likes.filter((email) => email !== userEmail),
      });
    } else {
      await updateDoc(commentRef, {
        dislikes: commentData.dislikes.filter((email) => email !== userEmail),
      });
    }
  };

  // Fungsi login dan register
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const recaptchaResponse = grecaptcha.getResponse();
      if (!recaptchaResponse) {
        setAuthError("Tolong selesaikan verifikasi reCAPTCHA.");
        setAuthLoading(false);
        return;
      }

      await signInWithEmailAndPassword(auth, email, password);
      setIsModalOpen(false);
      grecaptcha.reset(); // Reset captcha setelah login
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
      const recaptchaResponse = grecaptcha.getResponse();
      if (!recaptchaResponse) {
        setAuthError("Tolong selesaikan verifikasi reCAPTCHA.");
        setAuthLoading(false);
        return;
      }

      await createUserWithEmailAndPassword(auth, email, password);
      setIsModalOpen(false);
      grecaptcha.reset(); // Reset captcha setelah registrasi
    } catch (error) {
      setAuthError('Registrasi gagal: ' + error.message);
    }
    setAuthLoading(false);
  };

  // Toggle modal dan reset state input
  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
    setAuthError(null); // Reset error setiap kali modal dibuka
    setEmail(''); // Kosongkan email input
    setPassword(''); // Kosongkan password input
    setConfirmPassword(''); // Kosongkan confirm password
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

      {/* Description */}
      {post.description && (
        <section className="mb-8 mt-4">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Deskripsi</h2>
          <p className="text-gray-900 dark:text-gray-300">{post.description}</p>
        </section>
      )}

      {/* Main Features */}
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

      {/* Download Links */}
      {post.downloadLinks && post.downloadLinks.length > 0 && (
        <div className="flex flex-col items-center space-y-4 mt-12 mb-20">
          {post.downloadLinks.map((link, index) => (
            <Button key={index} color="gray" pill>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.text}
              </a>
            </Button>
          ))}
        </div>
      )}

      {/* Comment Section */}
      <section className="mb-8 mt-4">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Komentar</h2>

        {/* Button login untuk meninggalkan komentar */}
        {!auth.currentUser && (
          <div className="text-center mb-4">
            <Button color="blue" pill onClick={toggleModal}>
              Login untuk meninggalkan komentar
            </Button>
          </div>
        )}

        {/* Comment/Reply Input */}
        {auth.currentUser && (
          <div className="mb-4">
            {replyTo && (
              <div className="mb-2">
                <p className="text-gray-500 dark:text-gray-400">Replying to {replyTo.user}</p>
                <Button onClick={() => setReplyTo(null)} size="sm" color="red">Cancel</Button>
              </div>
            )}
            <TextInput
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={replyTo ? "Tulis balasan Anda..." : "Tulis komentar Anda..."}
              className="bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
            />
            {filterError && <p className="text-red-500">{filterError}</p>}
            <Button onClick={handleCommentSubmit} className="mt-2">{replyTo ? "Kirim Balasan" : "Kirim Komentar"}</Button>
          </div>
        )}

        {/* Comment List */}
        {comments.map((comment) => (
          <div key={comment.id} className="mb-4 border-b pb-4 border-gray-300 dark:border-gray-700">
            <p className="font-semibold text-gray-900 dark:text-white">{comment.user}</p>
            <p className="text-gray-900 dark:text-gray-300">{comment.text}</p>

            <div className="flex space-x-4 mt-2">
              <button
                className={`flex items-center space-x-2 ${!auth.currentUser && 'opacity-50 cursor-not-allowed'}`}
                onClick={() => handleLike(comment.id)}
                disabled={!auth.currentUser}
              >
                <HiThumbUp />
                <span>{comment.likes.length}</span>
              </button>
              <button
                className={`flex items-center space-x-2 ${!auth.currentUser && 'opacity-50 cursor-not-allowed'}`}
                onClick={() => handleDislike(comment.id)}
                disabled={!auth.currentUser}
              >
                <HiThumbDown />
                <span>{comment.dislikes.length}</span>
              </button>

              {auth.currentUser && (
                <button
                  className="flex items-center space-x-2"
                  onClick={() => setReplyTo(comment)}
                >
                  <HiReply />
                  <span>Balas</span>
                </button>
              )}

              {auth.currentUser?.email === comment.user && (
                <>
                  <button onClick={() => handleEditComment(comment.id, comment.text)} className="flex items-center space-x-2">
                    <HiOutlinePencilAlt />
                    <span>Edit</span>
                  </button>
                  <button onClick={() => deleteDoc(doc(db, "posts", postId, "comments", comment.id))} className="flex items-center space-x-2">
                    <HiOutlineTrash />
                    <span>Hapus</span>
                  </button>
                </>
              )}
            </div>

            {/* List of replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-8 mt-4">
                {comment.replies.map((reply, index) => (
                  <div key={index} className="mb-2 text-gray-700 dark:text-gray-400">
                    <p className="font-semibold">{reply.user}</p>
                    <p>{reply.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Modal for Login */}
      <Modal
        show={isModalOpen}
        onClose={toggleModal}
        size="lg"
        className={`flex justify-center items-center h-screen ${isDarkMode ? 'dark' : ''}`}
      >
        <Modal.Header className={`dark:bg-gray-800 bg-white text-gray-900 dark:text-white`}>
          {isLogin ? "Login" : "Register"}
        </Modal.Header>
        <Modal.Body className={`p-8 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg`}>
          <form
            onSubmit={isLogin ? handleLogin : handleRegister}
            className="space-y-4"
          >
            {authError && (
              <p className="text-red-500 text-center">{authError}</p>
            )}
            <TextInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="dark:bg-gray-700 dark:text-white text-gray-900 w-full"
            />
            <TextInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="dark:bg-gray-700 dark:text-white text-gray-900 w-full"
            />
            {!isLogin && (
              <TextInput
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="dark:bg-gray-700 dark:text-white text-gray-900 w-full"
              />
            )}

            {/* reCAPTCHA Checkbox */}
            <div className="w-full flex justify-center">
              <div id="captcha-container" style={{ transform: "scale(0.88)", transformOrigin: "0 0", width: '100%' }}></div>
            </div>

            <Button type="submit" color="blue" className="w-full" disabled={authLoading}>
              {authLoading ? (isLogin ? "Logging in..." : "Registering...") : (isLogin ? "Login" : "Register")}
            </Button>
          </form>
          <div className="text-center text-gray-600 dark:text-gray-300 mt-4">
            {isLogin ? (
              <p>
                Don't have an account?{" "}
                <button
                  onClick={() => setIsLogin(false)}
                  className="text-blue-500"
                >
                  Register
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  onClick={() => setIsLogin(true)}
                  className="text-blue-500"
                >
                  Login
                </button>
              </p>
            )}
          </div>
        </Modal.Body>
      </Modal>

    </div>
  );
}

export default PostPage;
