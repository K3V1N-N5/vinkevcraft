import React, { useEffect, useState } from 'react';
import { Button, Carousel } from "flowbite-react";
import { useParams } from 'react-router-dom';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import { doc, getDoc } from "firebase/firestore";
import { db } from './firebase';
import { useTheme } from './ThemeContext';
import CommentSection from './CommentSection';
import AuthModal from './AuthModal';

function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isDarkMode } = useTheme();

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

    fetchPost();
  }, [postId]);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
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
            <Button key={index} color="gray" pill>
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                {link.text}
              </a>
            </Button>
          ))}
        </div>
      )}

      {/* Comment Section */}
      <CommentSection postId={postId} toggleModal={toggleModal} />

      {/* Auth Modal */}
      <AuthModal isModalOpen={isModalOpen} toggleModal={toggleModal} />
    </div>
  );
}

export default PostPage;
