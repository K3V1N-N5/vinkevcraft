import React, { useEffect, useState } from 'react';
import { Button, Carousel, TextInput, Modal } from "flowbite-react";
import { useParams } from 'react-router-dom';
import { HiArrowLeft, HiArrowRight, HiOutlineTrash, HiOutlinePencilAlt, HiThumbUp, HiThumbDown } from 'react-icons/hi';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from './firebase';
import { doc, getDoc, addDoc, collection, onSnapshot, updateDoc, deleteDoc, getDocs } from "firebase/firestore";

function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
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
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
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
      if (editCommentId) {
        await updateDoc(doc(db, "posts", postId, "comments", editCommentId), {
          text: comment,
        });
        setEditCommentId(null);
      } else {
        await addDoc(collection(db, "posts", postId, "comments"), {
          text: comment,
          user: displayName || auth.currentUser.email,
          createdAt: new Date(),
          likes: [],
          dislikes: [],
        });
      }
      setComment('');
    }
  };

  const handleEdit = (commentId, text) => {
    setComment(text);
    setEditCommentId(commentId);
  };

  const handleDelete = async (commentId) => {
    await deleteDoc(doc(db, "posts", postId, "comments", commentId));
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  const handleLike = async (commentId, likes) => {
    const userEmail = auth.currentUser?.email;
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    const commentSnap = await getDoc(commentRef);
    const commentData = commentSnap.data();

    if (commentData && !commentData.likes.includes(userEmail)) {
      await updateDoc(commentRef, {
        likes: [...commentData.likes, userEmail],
        dislikes: commentData.dislikes.filter((email) => email !== userEmail),
      });
    }
  };

  const handleDislike = async (commentId, dislikes) => {
    const userEmail = auth.currentUser?.email;
    const commentRef = doc(db, "posts", postId, "comments", commentId);
    const commentSnap = await getDoc(commentRef);
    const commentData = commentSnap.data();

    if (commentData && !commentData.dislikes.includes(userEmail)) {
      await updateDoc(commentRef, {
        dislikes: [...commentData.dislikes, userEmail],
        likes: commentData.likes.filter((email) => email !== userEmail),
      });
    }
  };

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

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen">{error}</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 min-h-screen">
      <h1 className="text-3xl font-bold mt-4 mb-6 text-center">{post.title}</h1>

      {/* Bagian Video */}
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
          <h2 className="text-2xl font-semibold mb-4">Deskripsi</h2>
          <p>{post.description}</p>
        </section>
      )}

      {/* Fitur Utama */}
      {post.features && post.features.length > 0 && (
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

      {/* Komentar Section */}
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Komentar</h2>

        {/* Formulir Komentar */}
        {auth.currentUser ? (
          <div>
            {filterError && <p className="text-red-500 mb-2">{filterError}</p>}
            <TextInput
              type="text"
              placeholder="Tambahkan komentar"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="mb-4"
            />
            <Button onClick={handleCommentSubmit} disabled={!comment.trim()} color="blue" className="w-full">
              {editCommentId ? "Edit Komentar" : "Kirim Komentar"}
            </Button>
          </div>
        ) : (
          <div>
            <Button color="blue" pill onClick={toggleModal}>
              Login untuk meninggalkan komentar
            </Button>

            {/* Modal Login/Register */}
            <Modal show={isModalOpen} onClose={toggleModal} size="lg" className="flex items-center justify-center">
              <Modal.Header>{isLogin ? "Login" : "Register"}</Modal.Header>
              <Modal.Body>
                <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
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
                  <Button type="submit" color="blue" className="w-full">
                    {authLoading ? "Loading..." : isLogin ? "Login" : "Register"}
                  </Button>
                </form>
              </Modal.Body>
            </Modal>
          </div>
        )}

        {/* Daftar Komentar */}
        <div className="mt-6">
          {comments.length > 0 ? (
            comments.map((comment, index) => (
              <div key={index} className="border-b py-4">
                <p className="font-semibold">{comment.user}</p>
                <p>{comment.text}</p>
                <div className="flex space-x-4 mt-2">
                  <button onClick={() => handleLike(comment.id, comment.likes)}>
                    <HiThumbUp className="inline-block" /> {comment.likes.length || 0}
                  </button>
                  <button onClick={() => handleDislike(comment.id, comment.dislikes)}>
                    <HiThumbDown className="inline-block" /> {comment.dislikes.length || 0}
                  </button>
                  {comment.user === (displayName || auth.currentUser.email) && (
                    <div className="relative group">
                      <div className="invisible group-hover:visible absolute right-0 top-0 flex space-x-2">
                        <button onClick={() => handleEdit(comment.id, comment.text)}>
                          <HiOutlinePencilAlt className="inline-block" /> Edit
                        </button>
                        <button onClick={() => handleDelete(comment.id)}>
                          <HiOutlineTrash className="inline-block" /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Form Reply */}
                <div className="ml-8 mt-2">
                  <TextInput
                    type="text"
                    placeholder="Balas komentar"
                    onChange={(e) => handleCommentSubmit(comment.id, e.target.value)}
                  />
                </div>
              </div>
            ))
          ) : (
            <p>Belum ada komentar.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default PostPage;
