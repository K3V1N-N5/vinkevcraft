import vinkev from './assets/vinkev_1.png';
import { Footer, DarkThemeToggle, Flowbite, Drawer, Sidebar } from "flowbite-react";
import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { HiMenu, HiX, HiOutlineCollection, HiOutlineExternalLink, HiInformationCircle } from "react-icons/hi";
import Loading from './utils/Loading'; // Import komponen Loading

// Lazy loading untuk halaman-halaman
const LandingPage = lazy(() => import('./LandingPage'));
const Profile = lazy(() => import('./list'));
const LinktreePage = lazy(() => import('./LinkTree'));
const PostPage = lazy(() => import('./PostPage'));
const NotFound = lazy(() => import('./NotFound'));

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Check local storage for theme preference
  useEffect(() => {
    const savedTheme = JSON.parse(localStorage.getItem('isDarkMode'));
    if (savedTheme !== null) {
      setIsDarkMode(savedTheme);
    }
  }, []);

  // Save theme preference to local storage
  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Apply dark mode to <html> tag
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const closeDrawer = () => {
    setIsOpen(false);
  };

  const handleLinkClick = () => {
    if (isOpen) {
      closeDrawer();
    }
  };

  return (
    <Router>
      <Flowbite>
        <Suspense fallback={<Loading />}>
          <div className={`dark:bg-[#1e1e1e] overflow-x-hidden`}>
            
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/list" element={<Profile />} />
              <Route path="/link" element={<LinktreePage />} />
              <Route path="*" element={<NotFound />} />
              <Route path="/post/:postId" element={<PostPage />} />
            </Routes>

            <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
              <div className="px-4 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      onClick={toggleDrawer}
                      className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                      style={{ width: '40px', height: '40px' }}
                    >
                      <span className="sr-only">Toggle sidebar</span>
                      {isOpen ? (
                        <HiX className="w-6 h-6" aria-hidden="true" />
                      ) : (
                        <HiMenu className="w-6 h-6" aria-hidden="true" />
                      )}
                    </div>
                    <Link to="/" className="flex items-center space-x-2 ms-3 md:ms-5" onClick={handleLinkClick}>
                      <img src={vinkev} className="h-8" alt="VinKev Logo" />
                      <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">VinKev Craft</span>
                    </Link>
                  </div>
                  <div className="flex items-center space-x-3">
                    <DarkThemeToggle
                      onClick={() => setIsDarkMode(prev => !prev)}
                      className="text-sm rounded-full focus:ring-4 dark:text-white transition-none motion-reduce:transition-none"
                    />
                  </div>
                </div>
              </div>
            </nav>

            <Drawer open={isOpen} onClose={closeDrawer} className="mt-14 w-72">
              {/* Sidebar Content */}
            </Drawer>

            <Footer container className="bg-slate-200">
              <div className="w-full text-center">
                {/* Footer Content */}
              </div>
            </Footer>
          </div>
        </Suspense>
      </Flowbite>
    </Router>
  );
}

export default App;
