/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { useRouter } from "next/router"; // Import Next.js router
import { motion } from "framer-motion";
import heroBackgroundImage from "../../assets/hero-background.jpg";
import Image from "next/image";

const HeroSection = () => {
  const router = useRouter(); // Initialize the router

  const navigateToEvents = () => {
    router.push("/events"); // Navigate to events page
  };

  const navigateToCreate = () => {
    router.push("/create"); // Navigate to create event page
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between px-8 py-16">
      {/* Image Section */}
      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.5 }}
        className="md:w-1/2 mb-8 md:mb-0"
      >
        <Image
          priority
          src={heroBackgroundImage}
          alt="Event NFT Hero Background"
          className="w-full rounded-lg"
        />
      </motion.div>

      {/* Content Section */}
      <div className="md:w-1/2">
        <h1 className="text-white text-2xl lg:text-4xl font-bold leading-tight md:leading-snug">
          Unlock the future of NFT events with BlockPass where decentralization
          meets unforgettable experiences!
        </h1>
        <p className="text-white mt-4">
          BlockPass is the first and best Web3 event management system.
        </p>

        {/* Action Buttons */}
        <div className="flex space-x-4 mt-8">
          <motion.button
            whileHover={{ scale: 1.2 }}
            className="bg-[#F5167E] hover:bg-pink-700 text-white px-8 py-4 rounded-full transition-transform duration-200"
            onClick={navigateToEvents} // Navigate to events on click
          >
            Get Ticket
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            className="bg-purple-600 hover:bg-purple-900 bg-opacity-10 ring-1 ring-white text-white px-8 py-4 rounded-full transition-transform duration-200"
            onClick={navigateToCreate} // Navigate to create event on click
          >
            Create Event
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
