import Navbar from "./Navbar";
import Hero from "./Hero";
import SearchBar from './SearchBar';
import Cta from './cta';
import BrandShowcase from './BrandShowcase';
import Footer from './Footer';
import Image from 'next/image';

import backgroundImage from "../../assets/backgroundImage.png";

const Index = () => {
  return (
    <div>
      <div className="relative ">
        <Image
        
          src={backgroundImage}
          alt="Background"
          layout="fill" 
          objectFit="cover" 
          className="-z-10"
        />
        {/* Overlay or other content goes here */}
        <div className="absolute z-50  bg-black opacity-0 " /> {/* Optional overlay */}
        <Navbar />
        <Hero />
      </div>
      <div className="container z-50 relative -top-20 mx-auto px-6 py-6">
        <SearchBar />
      </div>
      {/* <UpcomingEvents/> */}
      <Cta/>
      <BrandShowcase/>
      <Footer/> 
      
      {/* 
      <Features/>
      <Contact/>
      */}
    </div>
  );
};

export default Index;
