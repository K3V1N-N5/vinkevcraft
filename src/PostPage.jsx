import React, { useEffect, useState } from 'react';
import { Button, Carousel, TextInput, Modal } from "flowbite-react";
import { useParams, useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiArrowRight, HiThumbUp, HiThumbDown, HiReply } from 'react-icons/hi';
import { db, auth } from './firebase'; // Firebase config
import { doc, getDoc, updateDoc, addDoc, collection, onSnapshot } from "firebase/firestore"; // Firestore methods

function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [reply, setReply] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Mengelola state login/register modal
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState(null);
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

    // Mengambil komentar
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

  const handleLike = async (commentId) => {
    if (!auth.currentUser) {
      toggleModal(); // Tampilkan modal jika belum login
      return;
    }

    const commentRef = doc(db, "posts", postId, "comments", commentId);
    const commentSnap = await getDoc(commentRef);
    const commentData = commentSnap.data();
    
    const userEmail = auth.currentUser?.email;

    if (commentData && !commentData.likes.includes(userEmail)) {
      await updateDoc(commentRef, {
        likes: [...commentData.likes, userEmail],
        dislikes: commentData.dislikes.filter((email) => email !== userEmail),
      });
    }
  };

  const handleDislike = async (commentId) => {
    if (!auth.currentUser) {
      toggleModal(); // Tampilkan modal jika belum login
      return;
    }

    const commentRef = doc(db, "posts", postId, "comments", commentId);
    const commentSnap = await getDoc(commentRef);
    const commentData = commentSnap.data();

    const userEmail = auth.currentUser?.email;

    if (commentData && !commentData.dislikes.includes(userEmail)) {
      await updateDoc(commentRef, {
        dislikes: [...commentData.dislikes, userEmail],
        likes: commentData.likes.filter((email) => email !== userEmail),
      });
    }
  };

  const handleReplySubmit = async (commentId) => {
    const replyText = reply[commentId];
    if (!auth.currentUser) {
      toggleModal(); // Tampilkan modal jika belum login
      return;
    }

    if (replyText && replyText.trim() !== '') {
      await addDoc(collection(db, "posts", postId, "comments", commentId, "replies"), {
        text: replyText,
        user: auth.currentUser.email,
        createdAt: new Date(),
      });
      setReply((prevReply) => ({ ...prevReply, [commentId]: '' }));
    }
  };

  const handleCommentSubmit = async () => {
    if (!auth.currentUser) {
      toggleModal(); // Tampilkan modal jika belum login
      return;
    }

    if (comment.trim() === '') {
      return; // Jangan submit jika komentar kosong
    }

    await addDoc(collection(db, "posts", postId, "comments"), {
      text: comment,
      user: auth.currentUser.email,
      createdAt: new Date(),
      likes: [],
      dislikes: [],
    });

    setComment(''); // Bersihkan input setelah submit
  };

  const toggleModal = () => setIsModalOpen(!isModalOpen); // Fungsi toggle untuk modal login

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1e1e1e] dark:bg-[#1e1e1e]">
        <div className="loader">Loading...</div> {/* Loader visual */}
      </div>
    );
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

      {/* Komentar */}
      <section className="mb-8 mt-4">
        <h2 className="text-2xl font-semibold mb-4">Komentar</h2>

        {comments.map((comment) => (
          <div key={comment.id} className="mb-4 border-b pb-4">
            <p className="font-semibold">{comment.user}</p>
            <p>{comment.text}</p>

            {/* Like/Dislike */}
            <div className="flex space-x-4 mt-2">
              <button
                className="flex items-center space-x-2"
                onClick={() => handleLike(comment.id)}
              >
                <HiThumbUp />
                <span>{comment.likes.length}</span>
              </button>
              <button
                className="flex items-center space-x-2"
                onClick={() => handleDislike(comment.id)}
              >
                <HiThumbDown />
                <span>{comment.dislikes.length}</span>
              </button>

              <button className="flex items-center space-x-2" onClick={() => setReply((prevReply) => ({ ...prevReply, [comment.id]: !prevReply[comment.id] }))}>
                <HiReply />
                <span>Balas</span>
              </button>
            </div>

            {reply[comment.id] && (
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

        {/* Input komentar */}
        <div className="mb-4">
          <TextInput
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tulis komentar Anda..."
          />
          <Button onClick={handleCommentSubmit} className="mt-2">Kirim Komentar</Button>
        </div>
      </section>

      {/* Modal login/register */}
      <Modal show={isModalOpen} onClose={toggleModal}>
        <Modal.Header>{isLogin ? "Login" : "Register"}</Modal.Header>
        <Modal.Body>
          {/* Form login/register */}
          <form>
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
            {authError && <p className="text-red-500">{authError}</p>}
            <Button onClick={toggleModal}>Login/Register</Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default PostPage;
