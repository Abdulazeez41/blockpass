import React, { useContext, useEffect, useState } from "react";
import { events } from "../../data";
import { motion } from "framer-motion";
import { NearContext } from "../../wallets/near";
// import { fetchEventsFromContract } from "../../contractAPI";
import { events as localEvents } from "../../data";
import Image from "next/image";



const UpcomingEvents = () => {
  const [filters, setFilters] = useState({
    weekdays: "",
    eventType: "",
    category: "",
  });
  const [showLoadMore, setShowLoadMore] = useState(true);
  const [dataEvents, setEvents] = useState(localEvents);
  const [events, setEvent] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { wallet } = useContext(NearContext);
  const [loading, setLoading] = useState(true);
  const [visibleEvents, setVisibleEvents] = useState(6);


 

  // console.log(wallet);
  useEffect(() => {
    try {
      const fetchEvents = async () => {
        // const fetchedEvents = await fetchEventsFromContract(wallet);
        
        const fetchedEvents = [...localEvents];
        const combinedEvents = fetchedEvents.map((event, index) => ({
          ...event,
          imageUrl: dataEvents[index].imageUrl || "", // Fallback to empty string if no imageUrl
        }));
        setEvent(combinedEvents);
      };

      if (wallet) {
        fetchEvents();
      }
    } catch (error) {
      console.error("Failed to load events page:", error);
    } finally {
      setLoading(false);
    }
  }, [wallet, dataEvents]);

  const handleFilter = (filterType, value) => {
    const updatedFilters = { ...filters, [filterType]: value };
    setFilters(updatedFilters);
    if (value === "All") {
      setShowLoadMore(true);
    } else {
      setShowLoadMore(false);
    }

    let updatedEvents = events;
    if (value && value !== "All") {
      if (filterType === "weekdays") {
        updatedEvents = updatedEvents.filter(
          (event) => formatDate(event.date) === value
        );
      } else if (filterType === "eventType") {
        updatedEvents = updatedEvents.filter(
          (event) => event.eventType === value
        );
      } else if (filterType === "category") {
        updatedEvents = updatedEvents.filter(
          (event) => event.category === value
        );
      }
    }

    setFilteredEvents(updatedEvents);
  };

  const uniqueCategories = [...new Set(events.map((event) => event.category))];
  const uniqueEventTypes = [...new Set(events.map((event) => event.eventType))];
  const uniqueWeekdays = [...new Set(events.map((event) => event.weekday))];

  const handleLoadMore = () => {
    setVisibleEvents((prev) => prev + 6); // Show 6 more events on each click
  };

  const formatDate = (dateString) => {
    const options = { month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  return (
    <div className="mx-auto max-w-6xl p-6 mb-12">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-[77px]">
        Upcoming Events
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.slice(0, visibleEvents).map((event) => (
          <motion.div
            key={event.id}
            className="bg-white rounded-2xl lg:w-[343px] overflow-hidden shadow-lg"
            whileHover={{ scale: 1.05 }}
          >
            <Image
              className="w-full h-48 object-cover"
              src={event.imageUrl}
              alt={event.title}
            />
            <div className="flex p-4">
              <div className="flex-none mr-5 align-middle items-center">
                <p className="text-gray-500 font-semibold">
                  {formatDate(event.date).split(" ")[0]}
                </p>
                <p className="text-black text-3xl font-bold">
                  {formatDate(event.date).split(" ")[1]}
                </p>
              </div>
              <div className="flex-grow text-center flex flex-col justify-center">
                <h3 className="text-sm text-start font-bold mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-700 text-start text-xs">
                  {event.description}
                </p>
                <p className="text-gray-700 text-start mt-2 text-xs">
                  📍{event.location}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {visibleEvents < events.length && (
        <div className="text-center mt-8 mb-8">
          <button
            onClick={handleLoadMore}
            className="text-[#3D37F1] font-bold hover:bg-purple-900/25 px-4 py-2 rounded-full transition-colors duration-200 ring-2 ring-[#3D37F1] ring-opacity-50 hover:ring-opacity-75"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default UpcomingEvents;
