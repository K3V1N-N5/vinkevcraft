import React from 'react';
import { Button, Carousel } from "flowbite-react";
import { useParams } from 'react-router-dom';
import { posts } from './utils/postsData';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';

function PostPage() {
  const { postId } = useParams();
  const post = posts.find(p => p.id === postId);

  // Jika post tidak ditemukan
  if (!post) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 dark:text-white dark:bg-[#1e1e1e] flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-4xl font-bold mt-10 mb-6 text-center">Post Tidak Ditemukan</h1>
        <p className="text-lg mb-8 text-center">Maaf, kami tidak dapat menemukan post yang Anda cari.</p>
        <Button color="gray" pill>
          <a href="/" className="text-white">Kembali ke Beranda</a>
        </Button>
      </div>
    );
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

      {/* Carousel (Ditempatkan di bawah video) */}
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
              <div key={index} className="relative w-full">
                <img
                  src={image}
                  alt={`Carousel image ${index + 1}`}
                  className="object-cover w-full h-[300px] sm:h-[400px] rounded-lg"
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
