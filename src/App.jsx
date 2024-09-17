import vinkev from './assets/vinkev_1.png';
import { Footer, Button, Drawer, Sidebar, Flowbite, DarkThemeToggle } from "flowbite-react";
import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { HiOutlineCollection, HiOutlineExternalLink, HiInformationCircle, HiMenu, HiX } from "react-icons/hi";
import LandingPage from './LandingPage'; 
import KNZPage from './KNZPage';
import Profile from './list';
import LinktreePage from "./LinkTree";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();  // Untuk mendapatkan path URL saat ini

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
      document.querySelector('.toggle-drawer-button').focus();  // Kembalikan fokus ke tombol drawer
    }
  };

  return (
    <Router>
      <Flowbite>
        <div className="dark:bg-[#1e1e1e]">
          {/* Navbar */}
          <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center justify-start rtl:justify-end">
                  <div
                    onClick={toggleDrawer}
                    className="toggle-drawer-button relative flex items-center justify-center p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer transition-colors duration-300"
                    style={{ width: '40px', height: '40px' }}
                    role="button"
                    tabIndex="0"  // Tambahkan tabIndex untuk aksesibilitas
                  >
                    <span className="sr-only">Toggle sidebar</span>
                    {isOpen ? (
                      <HiX className="w-6 h-6" aria-hidden="true" />
                    ) : (
                      <HiMenu className="w-6 h-6" aria-hidden="true" />
                    )}
                  </div>
                  <Link to="/" className="flex ms-2 md:me-24 items-center" onClick={handleLinkClick}>
                    <img src={vinkev} className="h-8 me-3" alt="VinKev Logo" />
                    <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">VinKev Craft</span>
                  </Link>
                </div>
                <div className="flex items-center ms-3">
                  <DarkThemeToggle className="flex text-sm rounded-full focus:ring-4 dark:text-white mr-2 transition-colors duration-300" />
                </div>
              </div>
            </div>
          </nav>

          {/* Drawer with smooth transition */}
          <Drawer open={isOpen} onClose={toggleDrawer} className={`mt-[64px] w-72 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
            <Drawer.Items>
              <Sidebar aria-label="Sidebar" className="[&>div]:bg-transparent [&>div]:p-0">
                <div className="flex h-full flex-col justify-between py-2">
                  <div>
                    <Sidebar.Items>
                      <Sidebar.ItemGroup>
                        <Sidebar.Collapse icon={HiOutlineCollection} label="Minecraft">
                          <Link to="/list" className={`${location.pathname === '/list' ? 'text-blue-600 dark:text-blue-400' : ''}`} onClick={handleLinkClick}>
                            <Sidebar.Item>List</Sidebar.Item>
                          </Link>
                          <Link to="/knz" className={`${location.pathname === '/knz' ? 'text-blue-600 dark:text-blue-400' : ''}`} onClick={handleLinkClick}>
                            <Sidebar.Item>KNZ UI</Sidebar.Item>
                          </Link>
                        </Sidebar.Collapse>
                        <Link to="/link" className={`${location.pathname === '/link' ? 'text-blue-600 dark:text-blue-400' : ''}`} onClick={handleLinkClick}>
                          <Sidebar.Item icon={HiOutlineExternalLink}>LinkTree</Sidebar.Item>
                        </Link>
                      </Sidebar.ItemGroup>
                      <Sidebar.ItemGroup>
                        <Sidebar.Item href="https://wa.me/6285600776747" icon={HiInformationCircle} onClick={handleLinkClick}>
                          Help
                        </Sidebar.Item>
                      </Sidebar.ItemGroup>
                    </Sidebar.Items>
                  </div>
                </div>
              </Sidebar>
            </Drawer.Items>
          </Drawer>

          {/* Routing Pages */}
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/list" element={<Profile />} />
            <Route path="/knz" element={<KNZPage />} />
            <Route path="/link" element={<LinktreePage />} />
          </Routes>

          {/* Footer */}
          <Footer container className="bg-slate-200 dark:bg-gray-900 transition-colors duration-300">
            <div className="w-full text-center">
              <div className="w-full justify-between sm:flex sm:items-center sm:justify-between">
                <Footer.Brand
                  href="#landing"
                  src={vinkev}
                  alt="VinKev Logo"
                  name="VinKev Craft"
                />
                <Footer.LinkGroup>
                  <Footer.Link href="https://discord.com/invite/tMbjtxKfck">Discord</Footer.Link>
                  <Footer.Link href="https://whatsapp.com/channel/0029Vag7qpzHbFV0TyWAVp2z">WhatsApp Channel</Footer.Link>
                  <Footer.Link href="https://www.tiktok.com/@vinkevcraft?_t=8pQmJGEZKoU&_r=1">Tiktok</Footer.Link>
                  <Footer.Link href="https://www.youtube.com/@vinkevcraft">Youtube</Footer.Link>
                </Footer.LinkGroup>
              </div>
              <Footer.Divider />
              <Footer.Copyright href="https://github.com/SkulZOnTheYT" by="SK Store™  All rights reserved." year={2024} />
            </div>
          </Footer>
        </div>
      </Flowbite>
    </Router>
  );
}

export default App;
