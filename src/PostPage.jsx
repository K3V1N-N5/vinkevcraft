import React, { useEffect, useState } from 'react';
import { Button, Carousel, TextInput, Modal } from "flowbite-react";
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiArrowRight, HiThumbUp, HiThumbDown, HiReply } from 'react-icons/hi';
import { db, auth } from './firebase'; // Import Firebase config
import { doc, getDoc, collection, addDoc, onSnapshot, updateDoc } from "firebase/firestore"; // Import Firestore methods
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [reply, setReply] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Untuk toggle antara login dan register
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState(null);
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

    const fetchComments = () => {
      const commentsRef = collection(db, "posts", postId, "comments");
      const unsubscribe = onSnapshot(commentsRef, (snapshot) => {
        setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });

      return () => unsubscribe();
    };

    fetchPost();
    fetchComments();
  }, [postId, navigate]);

  // Pantau status login pengguna
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCommentSubmit = async () => {
    if (comment.trim() === '') return;

    if (user) {
      await addDoc(collection(db, "posts", postId, "comments"), {
        text: comment,
        user: user.email,
        createdAt: new Date(),
        likes: [],
        dislikes: [],
      });
      setComment('');
    } else {
      toggleModal(); // Jika tidak login, buka modal
    }
  };

  const handleLike = async (commentId) => {
    if (!user) return toggleModal(); // Buka modal login jika belum login

    const commentRef = doc(db, "posts", postId, "comments", commentId);
    const commentSnap = await getDoc(commentRef);
    const commentData = commentSnap.data();

    if (commentData && !commentData.likes.includes(user.email)) {
      await updateDoc(commentRef, {
        likes: [...commentData.likes, user.email],
        dislikes: commentData.dislikes.filter((email) => email !== user.email),
      });
    }
  };

  const handleDislike = async (commentId) => {
    if (!user) return toggleModal(); // Buka modal login jika belum login

    const commentRef = doc(db, "posts", postId, "comments", commentId);
    const commentSnap = await getDoc(commentRef);
    const commentData = commentSnap.data();

    if (commentData && !commentData.dislikes.includes(user.email)) {
      await updateDoc(commentRef, {
        dislikes: [...commentData.dislikes, user.email],
        likes: commentData.likes.filter((email) => email !== user.email),
      });
    }
  };

  const handleReplySubmit = async (commentId) => {
    const replyText = reply[commentId];
    if (replyText && replyText.trim() !== '') {
      await addDoc(collection(db, "posts", postId, "comments", commentId, "replies"), {
        text: replyText,
        user: user.email,
        createdAt: new Date(),
      });
      setReply((prevReply) => ({ ...prevReply, [commentId]: '' }));
    }
  };

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setIsModalOpen(false);
    } catch (error) {
      setAuthError('Login failed: ' + error.message);
    }
    setAuthLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError(null);
    if (password !== confirmPassword) {
      setAuthError("Passwords do not match!");
      return;
    }
    setAuthLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      setIsModalOpen(false);
    } catch (error) {
      setAuthError('Registration failed: ' + error.message);
    }
    setAuthLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1e1e1e] dark:bg-[#1e1e1e]">
        <div className="loader">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return null;
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

      {/* Fitur Utama */}
      {post.features && post.features.length > 0 && (
        <section className="mb-8 mt-4">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Fitur Utama</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-800 dark:text-gray-300">
            {post.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Komentar */}
      <section className="mb-8 mt-4">
        <h2 className="text-2xl font-semibold mb-4">Komentar</h2>

        {!user && (
          <div className="text-center mb-4 text-gray-500">
            <Button onClick={toggleModal}>Login untuk memberikan komentar dan like/dislike</Button>
          </div>
        )}

        {user && (
          <div className="mb-4">
            <TextInput
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tulis komentar Anda..."
            />
            <Button onClick={handleCommentSubmit} className="mt-2">Kirim Komentar</Button>
          </div>
        )}

        {comments.map((comment) => (
          <div key={comment.id} className="mb-4 border-b pb-4">
            <p className="font-semibold">{comment.user}</p>
            <p>{comment.text}</p>

            <div className="flex space-x-4 mt-2">
              <button
                className={`flex items-center space-x-2 ${!user && 'opacity-50 cursor-not-allowed'}`}
                onClick={() => handleLike(comment.id)}
                disabled={!user}
              >
                <HiThumbUp />
                <span>{comment.likes.length}</span>
              </button>
              <button
                className={`flex items-center space-x-2 ${!user && 'opacity-50 cursor-not-allowed'}`}
                onClick={() => handleDislike(comment.id)}
                disabled={!user}
              >
                <HiThumbDown />
                <span>{comment.dislikes.length}</span>
              </button>
              {user && (
                <button className="flex items-center space-x-2" onClick={() => setReply((prevReply) => ({ ...prevReply, [comment.id]: !prevReply[comment.id] }))}>
                  <HiReply />
                  <span>Balas</span>
                </button>
              )}
            </div>

            {reply[comment.id] && user && (
              <div className="mt-4 ml-4">
                <TextInput
                  value={reply[comment.id]}
                  onChange={(e) => setReply((prevReply) => ({ ...prevReply, [comment.id]: e.target.value }))}
                  placeholder="Tulis balasan Anda..."
                />
                <Button onClick={() => handleReplySubmit(comment.id)} className="mt-2">Kirim Balasan</Button>
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Download Links */}
      {post.downloadLinks && post.downloadLinks.length > 0 && (
        <div className="flex flex-col items-center space-y-4 mt-12 mb-20">
          {post.downloadLinks.map((link, index) => (
            <Button key={index} color="gray" pill>
              <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-800 dark:text-white">
                {link.text}
              </a>
            </Button>
          ))}
        </div>
      )}

      {/* Modal login/register */}
      <Modal show={isModalOpen} onClose={toggleModal}>
        <Modal.Header>{isLogin ? "Login" : "Register"}</Modal.Header>
        <Modal.Body>
          <form onSubmit={isLogin ? handleLogin : handleRegister}>
            <div className="mb-4">
              <TextInput
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-4">
              <TextInput
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {!isLogin && (
              <div className="mb-4">
                <TextInput
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}
            {authError && <p className="text-red-500">{authError}</p>}
            <Button type="submit" disabled={authLoading}>
              {isLogin ? "Login" : "Register"}
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default PostPage;
