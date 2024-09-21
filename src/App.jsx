import React, { useState, useEffect } from 'react';
import { Footer, DarkThemeToggle, Flowbite, Drawer, Sidebar } from "flowbite-react";
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
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    // Simulasikan loading saat navigasi terjadi
    handleStart();
    setTimeout(handleComplete, 500); // Hapus timeout ini jika tidak perlu

    return () => handleComplete();
  }, [location]);

  return (
    <Router>
      <Flowbite>
        <div className={`dark:bg-[#1e1e1e] overflow-x-hidden ${isDarkMode ? 'dark' : 'light'}`}>
          <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="px-4 py-3 lg:px-5 lg:pl-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div onClick={() => setIsOpen(!isOpen)} className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer">
                    {isOpen ? <HiX className="w-6 h-6" /> : <HiMenu className="w-6 h-6" />}
                  </div>
                  <Link to="/" className="flex items-center space-x-2 ms-3 md:ms-5">
                    <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">VinKev Craft</span>
                  </Link>
                </div>
                <DarkThemeToggle onClick={() => setIsDarkMode(prev => !prev)} />
              </div>
            </div>
          </nav>

          <Drawer open={isOpen} onClose={() => setIsOpen(false)} className="mt-14 w-72">
            <Drawer.Items>
              <Sidebar>
                <div className="flex h-full flex-col justify-between py-2">
                  <div>
                    <Sidebar.Items>
                      <Sidebar.ItemGroup>
                        <Sidebar.Collapse icon={HiOutlineCollection} label="Minecraft">
                          <Link to="/list"><Sidebar.Item>List</Sidebar.Item></Link>
                        </Sidebar.Collapse>
                        <Link to="/link"><Sidebar.Item icon={HiOutlineExternalLink}>LinkTree</Sidebar.Item></Link>
                      </Sidebar.ItemGroup>
                      <Sidebar.ItemGroup>
                        <Sidebar.Item href="https://wa.me/" icon={HiInformationCircle}>Help</Sidebar.Item>
                      </Sidebar.ItemGroup>
                    </Sidebar.Items>
                  </div>
                </div>
              </Sidebar>
            </Drawer.Items>
          </Drawer>

          <div className="min-h-screen pt-[64px]">
            {loading ? (
              <div className="fixed inset-0 bg-gray-200 dark:bg-black bg-opacity-70 flex justify-center items-center z-30">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/list" element={<Profile />} />
                <Route path="/link" element={<LinktreePage />} />
                <Route path="/post/:postId" element={<PostPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            )}
          </div>

          <Footer>
            <div className="w-full text-center">
              <Footer.Brand href="#" name="VinKev Craft" />
              <Footer.LinkGroup>
                <Footer.Link href="#">Discord</Footer.Link>
                <Footer.Link href="#">WhatsApp</Footer.Link>
                <Footer.Link href="#">Tiktok</Footer.Link>
                <Footer.Link href="#">Youtube</Footer.Link>
              </Footer.LinkGroup>
              <Footer.Copyright by="VinKev Craft. All rights reserved." year={2024} />
            </div>
          </Footer>
        </div>
      </Flowbite>
    </Router>
  );
}

export default App;
