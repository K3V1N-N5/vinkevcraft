import React from 'react';
import { Button } from "flowbite-react";

function KNZPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 dark:text-white dark:bg-[#1e1e1e]">
      {/* Adjust margin-top for better alignment and readability */}
      <h1 className="text-3xl font-bold mt-10 mb-6 text-center">KNZ UI - Resource Pack Minecraft Bedrock 1.21</h1>

      {/* Responsive iframe container */}
      <div className="relative w-full pt-[56.25%] mx-auto max-w-4xl">
        <iframe
          className="absolute top-0 left-0 w-full h-full"
          src="https://www.youtube.com/embed/Psob_aQhHWI"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="KNZ UI"
        />
      </div>

      <section className="mb-8 mt-8">
        <h2 className="text-2xl font-semibold mb-4">Fitur Utama</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>Perubahan kamera cepat: KNZ UI memungkinkan pemain untuk mengubah kamera dengan cepat tanpa harus membuka menu pengaturan.</li>
          <li>Tampilan yang lebih baik: KNZ UI memiliki tampilan yang lebih modern dan rapi dibandingkan dengan tampilan default Minecraft.</li>
          <li>Fitur tambahan: KNZ UI menambahkan berbagai fitur tambahan, seperti tampilan statistik, mode gelap, dan kemampuan untuk mengganti musik.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Perhatian</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>KNZ UI adalah resource pack yang gratis dan mudah digunakan.</li>
          <li>KNZ UI kompatibel dengan Minecraft Bedrock Edition versi 1.21 dan lebih tinggi.</li>
          <li>KNZ UI dapat diunduh dari situs web resmi atau dari beberapa situs web pihak ketiga.</li>
          <li>KNZ UI dapat diinstal dengan mudah dengan menyalin file resource pack ke folder <code>resource_packs</code> di folder Minecraft.</li>
        </ul>
      </section>
      
      {/* Center buttons and add margin at the top for spacing */}
      <div className="flex flex-col items-center space-y-4 mt-12 mb-20"> {/* Added mb-20 for space below buttons */}
        <Button color="gray" pill>
          <a href="https://pastelink.net/oc5sdjlw" className="no-underline">Download KNZ UI (with password)</a>
        </Button>
        <Button color="gray" pill>
          <a href="https://linkvertise.com/1165508/knz-ui-v100?o=sharing" className="no-underline">Download KNZ UI (with ads)</a>
        </Button>
      </div>
    </div>
  );
}

export default KNZPage;
