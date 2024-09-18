import TypingText from './utils/TypingText';
import { data } from './utils/listdata';
import { Blockquote, Button, Carousel } from 'flowbite-react';
import { motion, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useRef, memo } from 'react';

// Section component to reuse layout structure
const Section = memo(({ id, title, children, className = '' }) => (
  <section id={id} className={`py-12 ${className} w-full`}>
    <div className="container mx-auto text-center">
      {title && <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">{title}</h1>}
      {children}
    </div>
  </section>
));

const LandingPage = () => {
  const v = useRef(null);
  const V = useInView(v);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Hero Section */}
      <Section id="landing" className="relative bg-gray-500 dark:bg-gray-800 text-white py-20 mt-14 h-screen">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-gray-500/70 dark:from-gray-900/70 dark:to-gray-800/70"></div> {/* Gradient Overlay */}
        <div className="relative z-10 container mx-auto">
          <TypingText text="Welcome To My Website!" loop={true} />
          <motion.div
            className="text-lg mb-8"
            ref={v}
            initial={{ opacity: 0, y: 50 }}
            animate={V ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
            transition={{ duration: 1 }}
          >
            Please click "Start" below to read more about me and see some of my work!
          </motion.div>
          <a href="#about">
            <Button
              className="mx-auto bg-blue-600 text-white hover:bg-white hover:text-blue-600 hover:border-blue-600 dark:hover:bg-gray-700 dark:hover:text-white dark:bg-blue-600 border border-transparent transition-colors duration-300 transform hover:scale-105"
              pill
            >
              Start
            </Button>
          </a>
        </div>
      </Section>

      {/* About Section */}
      <Section id="about" className="bg-gray-200 dark:bg-gray-800 dark:text-white">
        <div className="max-w-2xl mx-auto"> {/* Adjust max-width for better centering */}
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">About Me</h1>
          <Blockquote className="my-4 border-l-4 border-gray-300 dark:border-gray-500 bg-gray-100 dark:bg-gray-700 p-6 text-center">
            "Hello! My name is Dimz and I am a Minecraft enthusiast who enjoys working as a JSON UI Developer for Minecraft Bedrock. I also like to make content on YouTube related to Minecraft."
          </Blockquote>
          <p className="text-lg text-gray-700 dark:text-gray-300 mt-4">
            Feel free to click one of the links below!
          </p>
        </div>
      </Section>

      {/* Minecraft Project Section */}
      <Section id="projects" title="Minecraft Project" className="bg-gray-100 dark:bg-gray-900 dark:text-white">
        <div className="max-w-2xl mx-auto"> {/* Center content with max-width */}
          <Carousel slideInterval={3000} pauseOnHover className="relative overflow-hidden rounded-lg shadow-lg">
            {data.map((slideItem, slideIndex) => (
              <div key={slideIndex}>
                <img
                  src={slideItem.img}
                  alt={slideItem.title}
                  className="object-cover w-full h-full opacity-80 hover:opacity-100 transition-opacity duration-300"
                />
              </div>
            ))}
          </Carousel>
          <p className="text-lg text-gray-700 dark:text-gray-300 mt-4">
            Just some mods for Minecraft that I made.
          </p>
          <Button
            className="mx-auto mt-10 bg-blue-600 text-white hover:bg-white hover:text-blue-600 dark:bg-blue-600 dark:hover:bg-gray-700 dark:hover:text-white border border-transparent transition-colors duration-300 transform hover:scale-105"
            pill
          >
            <Link to="/list">View</Link>
          </Button>
        </div>
      </Section>
    </div>
  );
};

export default LandingPage;
