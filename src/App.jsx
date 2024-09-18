import { useState, useEffect } from 'react';
import vinkev from './assets/vinkev_1.png';
import { Footer, Drawer, Sidebar, Flowbite } from 'flowbite-react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { HiOutlineCollection, HiOutlineExternalLink, HiInformationCircle, HiMenu, HiX } from 'react-icons/hi';
import LandingPage from './LandingPage';
import KNZPage from './KNZPage';
import Profile from './list';
import LinktreePage from './LinkTree';

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

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

  const toggleTheme = () => {
    setDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem('theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  return (
    <Router>
      <Flowbite>
        <div className="dark:bg-[#1e1e1e]">
          <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <div className="px-3 py-3 lg:px-5 lg:pl-3 flex justify-between items-center">
              <div className="flex items-center">
                <div
                  onClick={toggleDrawer}
                  className="relative flex items-center justify-center p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md cursor-pointer"
                  style={{ width: '40px', height: '40px' }}
                >
                  <span className="sr-only">Toggle sidebar</span>
                  {isOpen ? <HiX className="w-6 h-6" aria-hidden="true" /> : <HiMenu className="w-6 h-6" aria-hidden="true" />}
                </div>
                <Link to="/" className="flex items-center ms-2" onClick={handleLinkClick}>
                  <img src={vinkev} className="h-8 me-3" alt="VinKev Logo" />
                  <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white">VinKev Craft</span>
                </Link>
              </div>
              <div className="flex items-center">
                <button
                  onClick={toggleTheme}
                  className="relative flex items-center justify-center p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full cursor-pointer"
                  style={{ width: '40px', height: '40px' }}
                >
                  {darkMode ? (
                    <span className="text-xl">🌙</span>
                  ) : (
                    <span className="text-xl">☀️</span>
                  )}
                </button>
              </div>
            </div>
          </nav>

          <Drawer open={isOpen} onClose={toggleDrawer} className="mt-[64px] w-72">
            <Drawer.Items>
              <Sidebar aria-label="Sidebar" className="[&>div]:bg-transparent [&>div]:p-0">
                <div className="flex h-full flex-col justify-between py-2">
                  <Sidebar.Items>
                    <Sidebar.ItemGroup>
                      <Sidebar.Collapse icon={HiOutlineCollection} label="Minecraft">
                        <Link to="/list" onClick={handleLinkClick}><Sidebar.Item>List</Sidebar.Item></Link>
                        <Link to="/knz" onClick={handleLinkClick}><Sidebar.Item>KNZ UI</Sidebar.Item></Link>
                      </Sidebar.Collapse>
                      <Link to="/link" onClick={handleLinkClick}><Sidebar.Item icon={HiOutlineExternalLink}>
                        LinkTree
                      </Sidebar.Item></Link>
                    </Sidebar.ItemGroup>
                    <Sidebar.ItemGroup>
                      <Sidebar.Item href="https://wa.me/" icon={HiInformationCircle} onClick={handleLinkClick}>
                        Help
                      </Sidebar.Item>
                    </Sidebar.ItemGroup>
                  </Sidebar.Items>
                </div>
              </Sidebar>
            </Drawer.Items>
          </Drawer>

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/list" element={<Profile />} />
            <Route path="/knz" element={<KNZPage />} />
            <Route path="/link" element={<LinktreePage />} />
          </Routes>

          <Footer container className="bg-slate-200">
            <div className="w-full text-center">
              <div className="w-full justify-between sm:flex sm:items-center sm:justify-between">
                <Footer.Brand
                  href="#landing"
                  src={vinkev}
                  alt="Vinkev Logo"
                  name="Vinkev Craft"
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
