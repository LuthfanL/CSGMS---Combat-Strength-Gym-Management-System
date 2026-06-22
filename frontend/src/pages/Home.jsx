import { useEffect } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Pricing from '../components/Pricing';
import ChatWidget from '../components/ChatWidget';

const Home = () => {
  useEffect(() => {
    document.title = "Home - CSGMS";
  }, []);

  return (
    <>
      <Hero />
      <Features />
      <Pricing />
      {/* Chat Widget */}
      <ChatWidget />
    </>
  );
};

export default Home;
