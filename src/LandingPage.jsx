import TypingText from './utils/TypingText';
import { data } from './utils/listdata';
import { Blockquote, Button, Carousel } from 'flowbite-react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef } from 'react';

function LandingPage() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-r from-gray-100 via-white to-gray-200 dark:bg-gradient-to-r from-gray-800 via-gray-900 to-gray-700">
      {/* Hero Section */}
      <section
        id="landing"
        className="bg-gradient-to-br from-blue-600 to-blue-500 dark:from-blue-900 dark:to-blue-800 text-white py-10 mt-14 h-screen w-full flex items-center justify-center"
      >
        <div className="container mx-auto text-center">
          <TypingText text="Welcome To My Digital World!" loop={true} />
          <motion.div
            className="text-lg mb-6"
            ref={sectionRef}
            initial={{ opacity: 0, y: 50 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
          >
            Dive into my world of creativity and innovation. Explore my journey, projects, and passion for all things Minecraft!
          </motion.div>
          <a href="#about" aria-label="Start exploring the website">
            <Button
              className="mx-auto bg-white text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white transition-colors duration-300 border border-blue-600 dark:border-transparent"
              pill
            >
              Start Exploring
            </Button>
          </a>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-gray-100 dark:bg-gray-800 w-full">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">About Me</h1>
          <Blockquote className="my-6 border-l-4 border-blue-500 dark:border-blue-400 bg-gray-100 dark:bg-gray-700 p-5 italic">
            "Hey there! I'm Kevin N.S., a passionate Minecraft enthusiast. I love working on custom mods and creating content for Minecraft Bedrock Edition. When I’m not coding, you’ll find me sharing my creations on TikTok and YouTube."
          </Blockquote>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Click below to check out some of my favorite projects and creations!
          </p>
        </div>
      </section>

      {/* Minecraft Project Section */}
      <section id="projects" className="py-16 bg-white dark:bg-gray-900 w-full">
        <div className="container mx-auto max-w-3xl text-center">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Minecraft Projects</h1>
          <div className="relative w-full max-w-3xl mx-auto overflow-hidden rounded-lg shadow-lg">
            <Carousel slideInterval={3000} pauseOnHover>
              {data.map((slideItem, slideIndex) => (
                <div key={slideIndex} className="relative w-full h-full">
                  <img
                    src={slideItem.img}
                    alt={`Slide ${slideIndex + 1}: ${slideItem.title}`}
                    className="object-cover w-full h-full"
                  />
                </div>
              ))}
            </Carousel>
            <p className="text-lg text-gray-700 dark:text-gray-300 mt-6">
              Here are some of the mods and creations I've developed for Minecraft. Take a look!
            </p>
            <Button
              className="mx-auto mt-6 bg-blue-600 text-white hover:bg-white hover:text-blue-600 dark:bg-blue-600 dark:hover:bg-gray-700 dark:hover:text-white border border-transparent transition-colors duration-300"
              pill
            >
              <Link to="/list" aria-label="View my Minecraft projects">Explore My Projects</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
