import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore'; // Firebase Firestore
import { db } from './firebase'; // Firebase config

function ListProject() {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const filterButtonRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterVisible, setFilterVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState([]); // State untuk menyimpan data dari Firestore

  // Fungsi untuk menangani pencarian
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Fungsi untuk menangani perubahan kategori
  const handleFilterChange = (category) => {
    setSelectedCategory(category);
    setFilterVisible(false);
  };

  const toggleFilter = () => {
    setFilterVisible(!filterVisible);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(event.target) &&
        filterButtonRef.current && !filterButtonRef.current.contains(event.target)
      ) {
        setFilterVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef, filterButtonRef]);

  // Ambil data dari Firestore
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      const postCollection = collection(db, 'posts'); // Ambil data dari collection 'posts' di Firestore
      const postSnapshot = await getDocs(postCollection);
      const postList = postSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(postList);
      setIsLoading(false);
    };
    fetchPosts();
  }, []);

  // Filter data berdasarkan pencarian dan kategori
  const filteredData = posts.filter((item) => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory; // Filter berdasarkan kategori dan pencarian
  });

  return (
    <div id="landing" className="bg-white dark:bg-[#1e1e1e] text-black dark:text-white min-h-screen flex flex-col">
      <div className="pb-10 px-4 font-sans mx-auto relative z-10 w-full h-full max-w-3xl">
        {/* Navigasi dan Search */}
        <div className="flex mt-4 max-w-4xl justify-between items-center mb-5 border-b border-gray-700 pb-2">
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded" onClick={() => navigate('/')}>Back</button>
          
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={handleSearch}
            className="px-2 py-1 w-full mx-2 bg-gray-100 dark:bg-gray-900 border border-gray-700 rounded text-white"
          />
          <button 
            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded"
            onClick={toggleFilter}
            ref={filterButtonRef}
          >
            Filter
          </button>
        </div>

        {/* Dropdown Filter */}
        {filterVisible && (
          <div className="flex flex-col absolute top-25 right-4 bg-gray-100 dark:bg-gray-800 p-2 rounded shadow-md z-20" ref={dropdownRef}>
            <label className="mb-1">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === 'All'}
                onChange={() => handleFilterChange('All')}
                className="mr-2"
              />
              All
            </label>
            <label className="mb-1">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === 'Resource Pack'}
                onChange={() => handleFilterChange('Resource Pack')}
                className="mr-2"
              />
              Resource Pack
            </label>
            <label className="mb-1">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === 'Addon'}
                onChange={() => handleFilterChange('Addon')}
                className="mr-2"
              />
              Addon
            </label>
            <label className="mb-1">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === 'Mod'}
                onChange={() => handleFilterChange('Mod')}
                className="mr-2"
              />
              Mod
            </label>
            <label className="mb-1">
              <input
                type="radio"
                name="category"
                checked={selectedCategory === 'Map'}
                onChange={() => handleFilterChange('Map')}
                className="mr-2"
              />
              Map
            </label>
          </div>
        )}

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="fixed inset-0 bg-gray-200 dark:bg-black bg-opacity-70 flex justify-center items-center z-30">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 mt-8">
            {filteredData.map((item, index) => (
              <Link
                key={index}
                to={`/post/${item.id}`} // Link ke halaman post detail
                className="block bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden shadow-md border border-gray-700 relative z-10"
              >
                <div className="relative">
                  <img src={item.thumbnail || item.carouselImages[0]} alt={item.title} className="w-full h-auto object-cover border-b border-gray-700" />
                  <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">{item.category}</div>
                </div>
                <div className="p-4 border-t border-gray-700">
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-gray-500">{item.description.substring(0, 100)}...</p> {/* Potong deskripsi */}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListProject;
