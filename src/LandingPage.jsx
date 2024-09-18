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
      {title && <h1 className="text-3xl font-bold mb-6 text-white">{title}</h1>}
      {children}
    </div>
  </section>
));

const LandingPage = () => {
  const v = useRef(null);
  const V = useInView(v);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Hero Section */}
      <Section id="landing" className="relative bg-gray-500 text-white py-20 mt-14 h-screen">
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-gray-500/70"></div> {/* Gradient Overlay */}
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
              className="mx-auto hover:scale-105 transition-transform duration-300 bg-blue-600 text-white"
              pill
            >
              Start
            </Button>
          </a>
        </div>
      </Section>

      {/* About Section */}
      <Section id="about" className="bg-gray-800 text-white">
        <h1 className="text-2xl font-bold mb-6 text-white">About Me</h1>
        <Blockquote className="my-4 border-l-4 border-gray-300 bg-gray-700 p-6 text-center">
          "Hello! My name is Kevin N.S. I enjoy playing Minecraft, and I might work as a JSON UI Developer for Minecraft Bedrock. I also like creating Minecraft-related content on TikTok and YouTube."
        </Blockquote>
      </Section>

      {/* Minecraft Project Section */}
      <Section id="projects" title="Minecraft Project" className="bg-gray-900 text-white">
        <div className="relative w-full pt-[56.25%] max-w-3xl mx-auto overflow-hidden">
          <Carousel slideInterval={3000} pauseOnHover className="absolute top-0 left-0 w-full h-full">
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
        </div>
        <Button
          className="mx-auto mt-10 hover:bg-blue-700 hover:scale-105 transition-transform duration-300 bg-blue-600 text-white"
          pill
        >
          <Link to="/list">View My Project</Link>
        </Button>
      </Section>
    </div>
  );
};

export default LandingPage;
