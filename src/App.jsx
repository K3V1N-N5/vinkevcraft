import vinkev from './assets/vinkev_1.png'; // Ganti dengan path gambar logo yang benar
import { Footer, DarkThemeToggle, Flowbite, Drawer, Sidebar } from "flowbite-react";
import { useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { HiMenu, HiX, HiOutlineCollection, HiOutlineExternalLink, HiInformationCircle } from "react-icons/hi";
import Loading from './utils/Loading'; // Import komponen Loading

// Lazy loading untuk halaman-halaman
import LandingPage from './LandingPage';
import Profile from './list';
import LinktreePage from './LinkTree';
import PostPage from './PostPage';
import NotFound from './NotFound';

function App() {
  const [isOpen, setIsOpen] = useState(false); // Untuk Drawer (Sidebar)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = JSON.parse(localStorage.getItem('isDarkMode')); // Ambil preferensi dari localStorage
    return savedTheme !== null ? savedTheme : true; // Default: dark mode
  });
  const [loading, setLoading] = useState(false); // Untuk memantau loading halaman

  const location = useLocation(); // Memantau path yang aktif
  const navigate = useNavigate(); // Untuk perpindahan halaman

  // Fungsi untuk handle perpindahan halaman dengan loading
  const handleNavigate = useCallback((to) => {
    setLoading(true); // Set loading saat rute berubah

    navigate(to); // Pindah ke halaman baru

    // Set loading menjadi false setelah navigasi selesai
    setTimeout(() => setLoading(false), 500);
  }, [navigate]);

  // Menyimpan preferensi tema ke localStorage setiap kali diubah
  const toggleDrawer = () => {
    setIsOpen(!isOpen); // Toggle untuk membuka/tutup Drawer (Sidebar)
  };

  const closeDrawer = () => {
    setIsOpen(false); // Menutup Drawer ketika dibutuhkan
  };

  const handleLinkClick = (to) => {
    if (isOpen) {
      closeDrawer(); // Menutup Drawer ketika klik pada salah satu link
    }
    handleNavigate(to); // Navigasi ke halaman baru dengan loading
  };

  if (loading) {
    // Jika dalam state loading, tampilkan komponen loading
    return <Loading />;
  }

  return (
    <Router>
      <Flowbite>
        <div className={`dark:bg-[#1e1e1e] overflow-x-hidden ${isDarkMode ? 'dark' : 'light'} pt-16`}>
          {/* Routes untuk menentukan halaman yang dirender berdasarkan path */}
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/list" element={<Profile />} />
            <Route path="/link" element={<LinktreePage />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/post/:postId" element={<PostPage />} />
          </Routes>

          {/* Navbar */}
          <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 h-16">
            <div className="px-4 py-3 lg:px-5 lg:pl-3">
              <div className="flex items-center justify-between">
                {/* Bagian Kiri: Icon untuk toggle sidebar + logo */}
                <div className="flex items-center">
                  <div
                    onClick={toggleDrawer}
                    className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                    style={{ width: '40px', height: '40px' }}
                  >
                    <span className="sr-only">Toggle sidebar</span>
                    {isOpen ? (
                      <HiX className="w-6 h-6" aria-hidden="true" /> // Icon ketika drawer dibuka
                    ) : (
                      <HiMenu className="w-6 h-6" aria-hidden="true" /> // Icon ketika drawer ditutup
                    )}
                  </div>

                  <Link to="/" className="flex items-center space-x-2 ms-3 md:ms-5" onClick={() => handleLinkClick('/')}>
                    <img src={vinkev} className="h-8" alt="VinKev Logo" /> {/* Logo */}
                    <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">VinKev Craft</span>
                  </Link>
                </div>

                {/* Bagian Kanan: Toggle untuk Dark Mode */}
                <div className="flex items-center space-x-3">
                  <DarkThemeToggle
                    onClick={() => setIsDarkMode(prev => !prev)} // Mengubah tema
                    className="text-sm rounded-full focus:ring-4 dark:text-white transition-none motion-reduce:transition-none"
                  />
                </div>
              </div>
            </div>
          </nav>

          {/* Drawer (Sidebar) */}
          <Drawer open={isOpen} onClose={closeDrawer} className="mt-14 w-72">
            <Drawer.Items>
              <Sidebar aria-label="Sidebar" className="[&>div]:bg-transparent [&>div]:p-0">
                <div className="flex h-full flex-col justify-between py-2">
                  <div>
                    <Sidebar.Items>
                      <Sidebar.ItemGroup>
                        <Sidebar.Collapse icon={HiOutlineCollection} label="Minecraft">
                          <Link to="/list" onClick={() => handleLinkClick('/list')}><Sidebar.Item>List</Sidebar.Item></Link>
                          <Link to="/post/knz-ui" onClick={() => handleLinkClick('/post/knz-ui')}><Sidebar.Item>KNZ UI</Sidebar.Item></Link>
                        </Sidebar.Collapse>
                        <Link to="/link" onClick={() => handleLinkClick('/link')}>
                          <Sidebar.Item icon={HiOutlineExternalLink}>LinkTree</Sidebar.Item>
                        </Link>
                      </Sidebar.ItemGroup>
                      <Sidebar.ItemGroup>
                        <Sidebar.Item href="https://wa.me/" icon={HiInformationCircle} onClick={closeDrawer}>
                          Help
                        </Sidebar.Item>
                      </Sidebar.ItemGroup>
                    </Sidebar.Items>
                  </div>
                </div>
              </Sidebar>
            </Drawer.Items>
          </Drawer>

          {/* Footer */}
          <Footer container className="bg-slate-200">
            <div className="w-full text-center">
              <div className="w-full justify-between sm:flex sm:items-center sm:justify-between">
                <Footer.Brand href="#landing" src={vinkev} alt="VinKev Logo" name="VinKev Craft" />
                <Footer.LinkGroup>
                  <Footer.Link href="https://discord.com/invite/tMbjtxKfck">Discord</Footer.Link>
                  <Footer.Link href="https://whatsapp.com/channel/0029Vag7qpzHbFV0TyWAVp2z">WhatsApp</Footer.Link>
                  <Footer.Link href="https://www.tiktok.com/@vinkevcraft">Tiktok</Footer.Link>
                  <Footer.Link href="https://www.youtube.com/@vinkevcraft">Youtube</Footer.Link>
                </Footer.LinkGroup>
              </div>
              <Footer.Divider />
              <div className="text-sm text-gray-500 dark:text-gray-400">
                <Footer.Copyright href="#" by="VinKev Craft. All rights reserved." year={2024} />
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                This site is not affiliated with Mojang Studios.
              </p>
            </div>
          </Footer>
        </div>
      </Flowbite>
    </Router>
  );
}

export default App;
