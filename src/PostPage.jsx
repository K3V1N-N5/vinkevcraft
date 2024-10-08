import React, { useEffect, useState } from 'react';
import { Button, Carousel, TextInput, Modal } from "flowbite-react";
import { useParams } from 'react-router-dom';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import { db, auth } from './firebase';
import { doc, getDoc, addDoc, collection, getDocs } from "firebase/firestore";
import AuthPage from './AuthPage';

function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
  }, [postId]);

  const handleCommentSubmit = async () => {
    if (comment.trim() !== '' && auth.currentUser) {
      await addDoc(collection(db, "posts", postId, "comments"), {
        text: comment,
        user: auth.currentUser.email,
        createdAt: new Date(),
      });
      setComment('');
    }
  };

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#1e1e1e] dark:bg-[#1e1e1e]">
        <div className="loader">Loading...</div>
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

      {/* Bagian video */}
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
          <div>
            <Button color="blue" pill onClick={toggleModal}>
              Login untuk meninggalkan komentar
            </Button>

            {/* Modal untuk Login */}
            <Modal
              show={isModalOpen}
              onClose={toggleModal}
              size="lg" // Ukuran modal diubah menjadi 'lg' agar sesuai dengan AuthPage
              className="rounded-lg"
            >
              <Modal.Header className="dark:bg-gray-800 bg-white text-gray-900 dark:text-white">
                Login
              </Modal.Header>
              <Modal.Body className="p-8 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg">
                {/* AuthPage sebagai konten modal */}
                <AuthPage />
              </Modal.Body>
            </Modal>
          </div>
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
                </p>
                <p className="text-gray-800 dark:text-gray-300">
                  {comment.text}
                </p>
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
