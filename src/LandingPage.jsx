import TypingText from './utils/TypingText';
import { data } from './utils/listdata';
import { Blockquote, Button, Carousel } from 'flowbite-react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef } from 'react';

function LandingPage() {
  const v = useRef(null);
  const V = useInView(v);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Hero Section */}
      <section id="landing" className="bg-gray-500 dark:bg-gray-800 text-white py-16 mt-14 h-screen w-full">
        <div className="container mx-auto text-center">
          <TypingText text="Welcome To My Website!" loop={true} />
          <motion.div
            className="text-lg mb-6"
            ref={v}
            initial={{ opacity: 0, y: 50 }}
            animate={V ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
          >
            Please click "Start" below to read more about me and see some of my work!
          </motion.div>
          <a href="#about">
            <Button
              className="mx-auto bg-blue-600 text-white hover:bg-white hover:text-blue-600 border border-transparent dark:bg-blue-600 dark:hover:bg-gray-700 dark:hover:text-white hover:border-blue-600 transition-colors duration-300"
              pill
            >
              Start
            </Button>
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-8 dark:bg-gray-800 w-full">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">About Me</h1>
          <Blockquote className="my-4 border-l-4 border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-700 p-4">
            "Hello! My name is Kevin N.S. I enjoy playing Minecraft, and I might work as a JSON UI Developer for Minecraft Bedrock. I also like creating Minecraft-related content on TikTok and YouTube."
          </Blockquote>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Feel free to click one of the links below!
          </p>
        </div>
      </section>

      {/* Minecraft Project Section */}
      <section id="projects" className="py-8 bg-gray-100 dark:bg-gray-900 w-full">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Minecraft Project</h1>
          <div className="relative w-full max-w-3xl mx-auto overflow-hidden rounded-lg">
            <Carousel slideInterval={3000} pauseOnHover>
              {data.map((slideItem, slideIndex) => (
                <div key={slideIndex} className="relative w-full h-full">
                  <img
                    src={slideItem.img}
                    alt={slideItem.title}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </Carousel>
            <p className="text-lg text-gray-700 dark:text-gray-300 mt-4">
              Just some mods for Minecraft that I made.
            </p>
            <Button
              className="mx-auto mt-4 bg-blue-600 text-white hover:bg-white hover:text-blue-600 dark:bg-blue-600 dark:hover:bg-gray-700 dark:hover:text-white border border-transparent transition-colors duration-300"
              pill
            >
              <Link to="/list">View My Project</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
