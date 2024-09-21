import vinkev from './assets/vinkev_1.png';
import { Footer, DarkThemeToggle, Flowbite, Drawer, Sidebar } from "flowbite-react";
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HiMenu, HiX, HiOutlineCollection, HiOutlineExternalLink, HiInformationCircle } from "react-icons/hi";
import LandingPage from './LandingPage'; 
import Profile from './list';
import LinktreePage from "./LinkTree";
import PostPage from './PostPage';
import NotFound from './NotFound';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

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

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1000); // Waktu loading
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <Router>
      <Flowbite>
        <div className={`dark:bg-[#1e1e1e] overflow-x-hidden ${isDarkMode ? 'dark' : 'light'}`}>
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
            <Drawer.Items>
              <Sidebar aria-label="Sidebar" className="[&>div]:bg-transparent [&>div]:p-0">
                <div className="flex h-full flex-col justify-between py-2">
                  <div>
                    <Sidebar.Items>
                      <Sidebar.ItemGroup>
                        <Sidebar.Collapse icon={HiOutlineCollection} label="Minecraft">
                          <Link to="/list" onClick={handleLinkClick}><Sidebar.Item>List</Sidebar.Item></Link>
                          <Link to="/post/knz-ui" onClick={handleLinkClick}><Sidebar.Item>KNZ UI</Sidebar.Item></Link>
                        </Sidebar.Collapse>
                        <Link to="/link" onClick={handleLinkClick}>
                          <Sidebar.Item icon={HiOutlineExternalLink}>LinkTree</Sidebar.Item>
                        </Link>
                      </Sidebar.ItemGroup>
                      <Sidebar.ItemGroup>
                        <Sidebar.Item href="https://wa.me/" icon={HiInformationCircle} onClick={handleLinkClick}>
                          Help
                        </Sidebar.Item>
                      </Sidebar.ItemGroup>
                    </Sidebar.Items>
                  </div>
                </div>
              </Sidebar>
            </Drawer.Items>
          </Drawer>

          <div className="min-h-screen pt-[64px]">
            {isLoading ? (
              <div className="fixed inset-0 bg-gray-200 dark:bg-black bg-opacity-70 flex justify-center items-center z-30">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/list" element={<Profile />} />
                <Route path="/link" element={<LinktreePage />} />
                <Route path="*" element={<NotFound />} />
                <Route path="/post/:postId" element={<PostPage />} />
              </Routes>
            )}
          </div>

          <Footer container className="bg-slate-200">
            <div className="w-full text-center">
              <div className="w-full justify-between sm:flex sm:items-center sm:justify-between">
                <Footer.Brand href="#landing" src={vinkev} alt="Vinkev Logo" name="VinKev Craft" />
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
