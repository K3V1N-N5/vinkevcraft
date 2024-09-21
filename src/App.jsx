import vinkev from './assets/vinkev_1.png';
import { Footer, DarkThemeToggle, Flowbite, Drawer, Sidebar } from "flowbite-react";
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { HiMenu, HiX, HiOutlineCollection, HiOutlineExternalLink, HiInformationCircle } from "react-icons/hi";
import LandingPage from './LandingPage'; 
import Profile from './list';
import LinktreePage from "./LinkTree";
import PostPage from './PostPage'; // Import PostPage
import NotFound from './NotFound';

function App() {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle drawer open/close state
  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  // Close drawer
  const closeDrawer = () => {
    setIsOpen(false);
  };

  // Handler for navigation link click
  const handleLinkClick = () => {
    if (isOpen) {
      closeDrawer();
    }
  };

  return (
    <Router>
      <Flowbite>
        {/* Navbar */}
        <div className="dark:bg-[#1e1e1e] bg-white overflow-x-hidden">
          <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="px-4 py-3 lg:px-5 lg:pl-3">
              <div className="flex items-center justify-between">

                {/* Logo and Text */}
                <div className="flex items-center">
                  {/* Button drawer */}
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

                  {/* Logo and Title */}
                  <Link to="/" className="flex items-center space-x-2 ms-3 md:ms-5" onClick={handleLinkClick}>
                    <img src={vinkev} className="h-8" alt="VinKev Logo" />
                    <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">VinKev Craft</span>
                  </Link>
                </div>

                {/* Dark Mode Toggle */}
                <div className="flex items-center space-x-3">
                  <DarkThemeToggle className="text-sm rounded-full focus:ring-4 dark:text-white transition-none motion-reduce:transition-none" />
                </div>
              </div>
            </div>
          </nav>

          {/* Drawer for Sidebar */}
          <Drawer open={isOpen} onClose={closeDrawer} className="mt-14 w-72">
            <Drawer.Items>
              <Sidebar aria-label="Sidebar with multi-level dropdown example" className="[&>div]:bg-transparent [&>div]:p-0">
                <div className="flex h-full flex-col justify-between py-2">
                  <div>
                    <Sidebar.Items>
                      <Sidebar.ItemGroup>
                        <Sidebar.Collapse icon={HiOutlineCollection} label="Minecraft">
                          <Link to="/list" onClick={handleLinkClick}><Sidebar.Item>List</Sidebar.Item></Link>
                          <Link to="/post/knz-ui" onClick={handleLinkClick}><Sidebar.Item>KNZ UI</Sidebar.Item></Link> {/* Dynamic Route to KNZ */}
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

          {/* Main content */}
          <div className="min-h-screen pt-[64px] bg-white dark:bg-[#1e1e1e]"> {/* Added padding-top to avoid overlap with navbar */}
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/list" element={<Profile />} />
              <Route path="/link" element={<LinktreePage />} />
              <Route path="*" element={<NotFound />} />
              {/* Dynamic Route for Posts */}
              <Route path="/post/:postId" element={<PostPage />} /> {/* One route to handle all posts */}
            </Routes>
          </div>

          {/* Footer */}
          <Footer container className="bg-gradient-to-r from-gray-700 via-gray-900 to-black text-white py-6 dark:bg-[#1e1e1e]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center justify-between space-y-4 sm:space-y-0">
                {/* Footer Logo and Name */}
                <Footer.Brand href="#landing" src={vinkev} alt="VinKev Logo" name="VinKev Craft" className="text-white" />

                {/* Social Media Links */}
                <Footer.LinkGroup className="flex items-center space-x-4">
                  <Footer.Link href="https://discord.com/invite/tMbjtxKfck" className="hover:text-gray-300 transition-colors">
                    Discord
                  </Footer.Link>
                  <Footer.Link href="https://whatsapp.com/channel/0029Vag7qpzHbFV0TyWAVp2z" className="hover:text-gray-300 transition-colors">
                    WhatsApp
                  </Footer.Link>
                  <Footer.Link href="https://www.tiktok.com/@vinkevcraft" className="hover:text-gray-300 transition-colors">
                    Tiktok
                  </Footer.Link>
                  <Footer.Link href="https://www.youtube.com/@vinkevcraft" className="hover:text-gray-300 transition-colors">
                    Youtube
                  </Footer.Link>
                </Footer.LinkGroup>
              </div>
              
              <Footer.Divider className="my-4 border-gray-600" />

              {/* Copyright and Disclaimer */}
              <div className="text-center text-sm text-gray-400">
                <div>
                  <Footer.Copyright href="#" by="VinKev Craft. All rights reserved." year={2024} />
                </div>
                <p className="mt-1">
                  This site is not affiliated with Mojang Studios.
                </p>
              </div>
            </div>
          </Footer>
        </div>
      </Flowbite>
    </Router>
  );
}

export default App;
