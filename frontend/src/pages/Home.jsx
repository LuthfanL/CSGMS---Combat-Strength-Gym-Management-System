import { useEffect } from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Pricing from '../components/Pricing';

const Home = () => {
  useEffect(() => {
    document.title = "Home - CSGMS";
  }, []);

  return (
    <>
      <Hero />
      <Features />
      <Pricing />
    </>
  );
};

export default Home;
