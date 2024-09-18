import React from 'react';
import { useParams } from 'react-router-dom';
import { postData } from './content'; // Impor data postingan
import { Button } from "flowbite-react";

function Post() {
  const { id } = useParams(); // Mengambil parameter id dari URL
  const post = postData.find(post => post.id === id); // Mencari postingan berdasarkan id

  // Jika postingan tidak ditemukan, tampilkan pesan "404"
  if (!post) {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 dark:text-white dark:bg-[#1e1e1e]">
        <h1 className="text-3xl font-bold mt-10 mb-6 text-center">Postingan Tidak Ditemukan</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 dark:text-white dark:bg-[#1e1e1e]">
      <h1 className="text-3xl font-bold mt-10 mb-6 text-center">{post.title}</h1>

      <div className="relative w-full pt-[56.25%] mx-auto max-w-4xl">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src={post.videoUrl}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={post.title}
        />
      </div>

      <section className="mb-8 mt-8">
        <h2 className="text-2xl font-semibold mb-4">Fitur Utama</h2>
        <ul className="list-disc list-inside space-y-2">
          {post.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Perhatian</h2>
        <ul className="list-disc list-inside space-y-2">
          {post.attention.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      </section>

      <div className="flex flex-col items-center space-y-4 mt-12 mb-20">
        {post.downloadLinks.map((link, index) => (
          <Button key={index} color="gray" pill>
            <a href={link.url} className="no-underline">{link.text}</a>
          </Button>
        ))}
      </div>
    </div>
  );
}

export default Post;
