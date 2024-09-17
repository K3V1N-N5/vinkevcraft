import TypingText from './utils/TypingText';
import { data } from './utils/listdata';
import { Blockquote, Button, Carousel } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { useRef } from 'react';

function LandingPage() {
  const aboutSectionRef = useRef(null);

  const handleScrollToAbout = () => {
    aboutSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Section Landing */}
      <section id="landing" className="bg-gradient-to-b from-gray-800 via-gray-700 to-gray-600 text-white py-20 mt-14 h-screen w-full flex flex-col items-center justify-center">
        <div className="container mx-auto text-center">
          <TypingText text="Welcome To My Website!" loop={true} className="text-4xl font-bold mb-8" />
          <div className="text-lg mb-8 max-w-2xl mx-auto">
            Explore my work and projects. Click the "Start" button below to learn more about me!
          </div>
          <Button className="mx-auto" color="light" pill size="lg" onClick={handleScrollToAbout}>
            Start
          </Button>
        </div>
      </section>

      {/* Section About */}
      <section
        id="about"
        ref={aboutSectionRef}
        className="py-12 bg-white dark:bg-gray-900 text-gray-900 dark:text-white w-full flex flex-col items-center justify-center min-h-screen"
      >
        <div className="container mx-auto text-center px-4 max-w-2xl">
          <h1 className="text-3xl font-bold mb-6 mt-20">About Me</h1>
          <Blockquote className="my-4 mx-auto max-w-2xl border-l-4 border-gray-300 bg-gray-200 p-6 rounded-lg dark:border-gray-500 dark:bg-gray-800">
            "Hi, I'm Kevin N.S., a Minecraft enthusiast and aspiring JSON UI Developer for Minecraft Bedrock. I love creating content on TikTok and YouTube related to my passion for Minecraft!"
          </Blockquote>
        </div>
      </section>

      {/* Section Minecraft Project */}
      <section className="w-full py-12 bg-white dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-center text-3xl font-bold mb-12">My Minecraft Projects</h1>
        <div className="relative w-full pt-[56.25%] max-w-2xl mx-auto overflow-hidden rounded-lg shadow-lg">
          <Carousel slideInterval={4000} pauseOnHover className="absolute top-0 left-0 w-full h-full">
            {data.map((slideItem, slideIndex) => (
              <div key={slideIndex} className="flex items-center justify-center">
                <img
                  src={slideItem.img}
                  alt={slideItem.title}
                  className="object-cover rounded-lg"
                />
              </div>
            ))}
          </Carousel>
        </div>
        <div className="mt-10">
          <Button color="blue" pill size="lg">
            <Link to="/list" className="text-white">View My Projects</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
