import React from 'react';
import { Button, Carousel } from "flowbite-react";
import { useParams } from 'react-router-dom';
import { posts } from './utils/postsData'; // Perbarui path ke utils

function PostPage() {
  const { postId } = useParams(); // Ambil ID dari URL
  const post = posts.find(p => p.id === postId); // Cari post berdasarkan ID

  // Jika post tidak ditemukan
  if (!post) {
    return <div>Post tidak ditemukan</div>;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 dark:text-white dark:bg-[#1e1e1e]">
      <h1 className="text-3xl font-bold mt-10 mb-6 text-center">{post.title}</h1>

      {/* Carousel hanya jika ada carouselImages */}
      {post.carouselImages && post.carouselImages.length > 0 && (
        <div className="relative w-full max-w-4xl mx-auto mb-8">
          <Carousel slideInterval={5000}>
            {post.carouselImages.map((image, index) => (
              <img key={index} src={image} alt={`Carousel image ${index + 1}`} className="object-cover w-full h-[400px]" />
            ))}
          </Carousel>
        </div>
      )}

      {/* Menampilkan Video YouTube hanya jika videoUrl ada */}
      {post.videoUrl && (
        <div className="relative w-full pt-[56.25%] mx-auto max-w-4xl">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={post.videoUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={post.title}
          />
        </div>
      )}

      {/* Deskripsi (tanpa bullet points) */}
      {post.description && (
        <section className="mb-8 mt-8">
          <h2 className="text-2xl font-semibold mb-4">Deskripsi</h2>
          <p>{post.description}</p>
        </section>
      )}

      {/* Fitur Utama hanya jika ada fitur */}
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

      {/* Perhatian Section (optional) */}
      {post.attention && (
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Perhatian</h2>
          <ul className="list-disc list-inside space-y-2">
            {post.attention.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Download Links */}
      <div className="flex flex-col items-center space-y-4 mt-12 mb-20">
        {post.downloadLinks.map((link, index) => (
          <Button key={index} color="gray" pill>
            <a href={link.url} target="_blank" rel="noopener noreferrer">{link.text}</a>
          </Button>
        ))}
      </div>
    </div>
  );
}

export default PostPage;
