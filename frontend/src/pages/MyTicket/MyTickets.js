"use client";

import React, { useState, useEffect, useContext } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { BigNumber } from "ethers";
import Image from "next/image";
import { fetchUserTickets } from "@/contractAPI";

import logo from "../../assets/logos/logo.png"; 
import { events as localEvents } from "@/data";

const MyTickets = () => {
  const [userTickets, setUserTickets] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    const loadUserTickets = async () => {
      try {
        const fetchedEvents = await fetchUserTickets();
        console.log(fetchedEvents)
        const combinedEvents = fetchedEvents.map((event, index) => ({
          ...event,
          imageUrl: localEvents[index]?.imageUrl || "", // Fallback to empty string if no imageUrl
        }));
        console.log(combinedEvents)

        setUserTickets(combinedEvents);
      } catch (error) {
        console.error("Failed to load user tickets:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserTickets();
  }, []);

  return (
    <>
      <nav className="container flex justify-between mx-auto items-center px-8 py-4">
        <Link href="/" passHref>
          <motion.div
            whileHover={{ scale: 1.1 }}
            className="flex items-center"
          >
            <Image src={logo} alt="BlockPass Logo" width={32} height={32} />
            <span className="text-black font-semibold text-lg">
              Block<span className="text-[#F5167E]">Pass</span>
            </span>
          </motion.div>
        </Link>

        <button
          className="md:hidden text-black hover:text-[#F5167E] focus:outline-none"
          onClick={toggleMenu}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={
                isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"
              }
            />
          </svg>
        </button>

        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } md:flex md:items-center md:space-x-6 absolute md:static top-16 left-0 w-full md:w-auto bg-black/30 md:bg-transparent p-4 md:p-0 z-10`}
        >
          {["Home", "All events", "My tickets"].map((text, index) => (
            <Link
              key={index}
              href={
                text === "All events"
                  ? "/events"
                  : text === "My tickets"
                  ? "/my-tickets"
                  : "/"
              }
              className="block md:inline-block text-black hover:text-[#F5167E] transition-colors duration-200 py-2 md:py-0"
            >
              {text}
            </Link>
          ))}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto my-10 p-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">MY TICKETS</h2>
        <p className="mb-4 italic text-gray-700 text-sm">
          To view NFTs on other networks, switch connected network.
        </p>

        {loading ? (
          <div className="flex justify-center items-center mt-5">
            <p className="text-gray-500 text-2xl">Loading Tickets...</p>
          </div>
        ) : userTickets.length === 0 ? (
          <div className="flex justify-center items-center mt-5">
            <p className="text-gray-500 text-2xl">No tickets available</p>
          </div>
        ) : (
          <ul role="list" className="space-y-4">
            {userTickets.map((event) => (
              <li key={event.id} className="bg-white shadow-md rounded-lg p-4">
                <Link href={`/events/${event.id}`} passHref>
                  <div className="flex justify-between gap-x-6 py-5">
                    <div className="flex gap-x-4">
                      <Image
                        src={event.imageUrl}
                        alt=""
                        width={48}
                        height={48}
                        className="rounded-full bg-gray-50"
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {event.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.location}
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:flex flex-col items-end">
                      <p className="text-sm text-gray-900">{event.date}</p>
                      <p className="text-xs text-gray-500">
                        {event.startTime} - {event.endTime}
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default MyTickets;
