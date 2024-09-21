import React, { useEffect } from 'react';
import { Button, Carousel } from "flowbite-react";
import { useParams, useNavigate } from 'react-router-dom';
import { posts } from './utils/postsData';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';

function PostPage() {
  const { postId } = useParams();
  const post = posts.find(p => p.id === postId);
  const navigate = useNavigate();

  // Jika post tidak ditemukan, arahkan ke halaman NotFound
  useEffect(() => {
    if (!post) {
      navigate('*'); // Ganti '/notfound' dengan rute halaman NotFound kamu
    }
  }, [post, navigate]);

  if (!post) {
    return null; // Pastikan tidak merender apa pun ketika post tidak ditemukan
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 dark:text-white dark:bg-[#1e1e1e]">
      <h1 className="text-3xl font-bold mt-10 mb-6 text-center">{post.title}</h1>

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

      {/* Carousel (Ditempatkan di bawah video, dengan rasio 16:9) */}
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
          <p className="text-base text-gray-700 dark:text-gray-300 mt-4 text-center">
            Beberapa gambar terkait project ini.
          </p>
        </div>
      )}

      {/* Deskripsi */}
      {post.description && (
        <section className="mb-8 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Deskripsi</h2>
          <p>{post.description}</p>
        </section>
      )}

      {/* Fitur Utama */}
      {post.features && post.features.length > 0 && (
        <section className="mb-8 mt-8">
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
              <a href={link.url} target="_blank" rel="noopener noreferrer">{link.text}</a>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

export default PostPage;
