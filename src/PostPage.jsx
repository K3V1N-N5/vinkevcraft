import React, { useEffect, useState } from 'react';
import { Button, Carousel, TextInput, Modal } from "flowbite-react";
import { HiOutlineTrash, HiOutlinePencilAlt, HiThumbUp, HiThumbDown, HiReply } from 'react-icons/hi';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from './firebase';
import { doc, getDoc, addDoc, collection, onSnapshot, updateDoc, deleteDoc } from "firebase/firestore";

function PostPage({ postId }) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [comment, setComment] = useState('');
  const [reply, setReply] = useState({});
  const [editCommentId, setEditCommentId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const postRef = doc(db, "posts", postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) setPost(postSnap.data());
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
  }, [postId]);

  const handleCommentSubmit = async () => {
    if (auth.currentUser) {
      if (editCommentId) {
        await updateDoc(doc(db, "posts", postId, "comments", editCommentId), { text: comment });
        setEditCommentId(null);
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

  const handleReplySubmit = async (commentId) => {
    const replyText = reply[commentId];
    if (replyText && auth.currentUser) {
      await addDoc(collection(db, "posts", postId, "comments", commentId, "replies"), {
        text: replyText,
        user: auth.currentUser.email,
        createdAt: new Date(),
      });
      setReply((prevReply) => ({ ...prevReply, [commentId]: '' }));
    }
  };

  const handleLike = async (commentId) => {
    if (!auth.currentUser) {
      setIsModalOpen(true);
      return;
    }
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    const commentSnap = await getDoc(commentRef);
    const commentData = commentSnap.data();
    const userEmail = auth.currentUser.email;

    const updatedLikes = commentData.likes.includes(userEmail)
      ? commentData.likes.filter((email) => email !== userEmail)
      : [...commentData.likes, userEmail];

    await updateDoc(commentRef, { likes: updatedLikes });
  };

  const handleDislike = async (commentId) => {
    if (!auth.currentUser) {
      setIsModalOpen(true);
      return;
    }
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    const commentSnap = await getDoc(commentRef);
    const commentData = commentSnap.data();
    const userEmail = auth.currentUser.email;

    const updatedDislikes = commentData.dislikes.includes(userEmail)
      ? commentData.dislikes.filter((email) => email !== userEmail)
      : [...commentData.dislikes, userEmail];

    await updateDoc(commentRef, { dislikes: updatedDislikes });
  };

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

  return (
    <div className="container mx-auto px-4 min-h-screen">
      <h1 className="text-3xl font-bold mt-4 mb-6">{post?.title}</h1>

      {/* Bagian Video */}
      {post?.videoUrl && (
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
      {post?.carouselImages && post.carouselImages.length > 0 && (
        <div className="relative w-full max-w-4xl mx-auto mb-8">
          <Carousel
            slideInterval={3000}
            leftControl={<HiArrowLeft size={35} className="text-white" />}
            rightControl={<HiArrowRight size={35} className="text-white" />}
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
      {post?.description && (
        <section className="mb-8 mt-4">
          <h2 className="text-2xl font-semibold mb-4">Deskripsi</h2>
          <p>{post.description}</p>
        </section>
      )}

      {/* Fitur Utama */}
      {post?.features && post.features.length > 0 && (
        <section className="mb-8 mt-4">
          <h2 className="text-2xl font-semibold mb-4">Fitur Utama</h2>
          <ul className="list-disc list-inside space-y-2">
            {post.features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Download Links */}
      {post?.downloadLinks && post.downloadLinks.length > 0 && (
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

      {/* Komentar Section */}
      <section className="mb-8 mt-4">
        <h2 className="text-2xl font-semibold mb-4">Komentar</h2>

        {/* Input komentar */}
        <TextInput
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Tulis komentar Anda..."
        />
        <Button onClick={handleCommentSubmit} className="mt-2">Kirim Komentar</Button>

        {/* Daftar Komentar */}
        <div className="comments overflow-y-scroll max-h-96 mt-4">
          {comments.map((comment) => (
            <div key={comment.id} className="mb-4 border-b pb-4 border-gray-300">
              <p className="font-semibold">{comment.user}</p>
              <p>{comment.text}</p>

              <div className="flex space-x-4 mt-2">
                <button onClick={() => handleLike(comment.id)} className="flex items-center space-x-2">
                  <HiThumbUp />
                  <span>{comment.likes.length}</span>
                </button>
                <button onClick={() => handleDislike(comment.id)} className="flex items-center space-x-2">
                  <HiThumbDown />
                  <span>{comment.dislikes.length}</span>
                </button>
                <button onClick={() => setReply((prevReply) => ({ ...prevReply, [comment.id]: !prevReply[comment.id] }))} className="flex items-center space-x-2">
                  <HiReply />
                  <span>Balas</span>
                </button>

                {/* Edit and Delete buttons */}
                {auth.currentUser?.email === comment.user && (
                  <>
                    <button onClick={() => setEditCommentId(comment.id)} className="flex items-center space-x-2">
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

              {/* Input for Replies */}
              {reply[comment.id] && (
                <div className="mt-4 ml-4">
                  <TextInput
                    value={reply[comment.id] || ""}
                    onChange={(e) => setReply((prevReply) => ({ ...prevReply, [comment.id]: e.target.value }))}
                    placeholder="Tulis balasan Anda..."
                  />
                  <Button onClick={() => handleReplySubmit(comment.id)} className="mt-2">Kirim Balasan</Button>
                </div>
              )}

              {/* Display replies */}
              {comment.replies && comment.replies.map((rep, idx) => (
                <div key={idx} className="ml-8 mt-4 text-gray-700">
                  <p className="font-semibold">{rep.user}</p>
                  <p>{rep.text}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Modal for Login/Register */}
      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <Modal.Header>{isLogin ? "Login" : "Register"}</Modal.Header>
        <Modal.Body>
          {/* Login/Register form */}
          <form onSubmit={isLogin ? handleLogin : handleRegister}>
            {authError && <p className="text-red-500">{authError}</p>}
            <TextInput
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <TextInput
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {!isLogin && (
              <TextInput
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            )}
            <Button type="submit" disabled={authLoading} className="w-full">
              {authLoading ? (isLogin ? "Logging in..." : "Registering...") : (isLogin ? "Login" : "Register")}
            </Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default PostPage;
