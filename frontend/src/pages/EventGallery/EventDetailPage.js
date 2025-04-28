import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { events as localEvents } from "../../data";
import Image from "next/image";
import { fetchEventsFromContract, registerForEvent } from "@/contractAPI";

const EventDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // const shortenAddress = (address) => {
  //   if (!address) return "";
  //   return `${address.slice(0, 6)}...${address.slice(-4)}`;
  // };

  const registerEvent = async () => {
    try {
      //Register logic with wallet
      await registerForEvent(id, event.ticketPrice);
      router.push("/my-tickets"); // Navigate using Next.js router

    } catch (error) {
      console.error("Error registering for event:", error);
    }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      // Simulate fetching event data (can integrate actual contract API)
      const fetchedEvents = await fetchEventsFromContract();
      const eventDetails = fetchedEvents.find(
        (event) => event.id === Number(id)
      );

      if (eventDetails) {
        setEvent({
          ...eventDetails,
          imageUrl: localEvents[id]?.imageUrl || eventDetails.imageUrl,
          host: eventDetails.host,
        });
      }
      setIsLoading(false);
    };

    fetchEvent();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-transparent">
        <p className="text-gray-500 text-2xl">Loading...</p>
      </div>
    );
  }

  if (!event) {
    return <p>Event not found</p>;
  }

  const isPastEvent = new Date(Number(event.endTime) * 1000) < new Date();
  console.log(event.endTime, new Date())
  console.log(isPastEvent)
  // const formatDate = (dateString) =>
  //   new Date(dateString).toLocaleDateString("en-US", {
  //     month: "short",
  //     day: "numeric",
  //   });
  const formattedDate = new Date(Number(event.endTime) * 1000).toLocaleDateString("en-US", {
    weekday: "long",  
    month: "long",
    day: "numeric",
  });
    
  const formattedTime = new Date(Number(event.endTime) * 1000).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  console.log(formattedDate, formattedTime)

  return (
    <div className="flex items-center justify-center min-h-screen p-6 relative">
      <div
        className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6"
        aria-hidden="true"
      >
        <div
          className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30"
          style={{
            clipPath:
              "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
          }}
        />
      </div>

      <div className="container mx-auto p-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Event Card */}
          <div className="bg-gray-800 text-white rounded-lg shadow-lg p-4">
            <Image
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-60 object-cover rounded-lg"
            />
            <div className="flex p-4">
              <div className="flex-none mr-5 align-middle items-center">
                <p className="text-gray-100 font-semibold">
                {new Date(Number(event.endTime) * 1000).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }).split(" ")[0]}
                </p>
                <p className="text-gray-100 text-3xl font-bold">
                {new Date(Number(event.endTime) * 1000).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }).split(" ")[1]}
                </p>
              </div>
              <div className="flex-grow text-center flex flex-col justify-center">
                <h3 className="text-2xl text-start font-bold mb-2">
                  {event.title}
                </h3>
                <p className="text-gray-100 mb-2 text-start text-lg">
                  🪩 {event.category}
                </p>
                <p className="text-gray-100 text-start text-xs">
                  {event.description}
                </p>
                <p className="text-gray-200 text-start mt-2 text-lg">
                  📍{event.location}
                </p>
              </div>
            </div>

            <p className="text-md text-gray-300 mt-2">
              {formattedDate}
              <br />
              {formattedTime}
            </p>

            <div className="mt-3">
              <h3 className="text-xl text-gray-300 font-semibold">Hosted By</h3>
              <p className="mt-1 text-gray-100 text-sm">{event.host}</p>
              <div className="flex items-center space-x-3 mt-2">
                <p className=" text-gray-300">
                  {Number(event.maxTickets)} Tickets Available 🎟️
                </p>
                <p className=" text-gray-300">
                  👉 {Number(event.maxTickets - event.ticketsSold)} Tickets Left
                </p>
              </div>
              <hr className="mt-1 border-gray-600" />
            </div>
            <p className="my-4 text-gray-300">
              {event.ticketsSold
                ? `${(event.ticketsSold)} Going`
                : "No Attendees Yet"}
            </p>
            <hr className="mt-1 border-gray-600" />

            <ul className="mt-2 text-gray-100">
              {event?.attendees && event.attendees.length > 0 ? (
                event.attendees.length <= 3 ? (
                  event.attendees.map((attendee, index) => (
                    <li key={index} className="inline">
                      {attendee}
                      {index < event.attendees.length - 1 ? ", " : ""}
                    </li>
                  ))
                ) : (
                  <>
                    {event.attendees.slice(0, 3).map((attendee, index) => (
                      <li key={index} className="inline">
                        {attendee}
                        {index < 2 ? ", " : ""}
                      </li>
                    ))}
                    <li className="inline">
                      , and {event.attendees.length - 3} others
                    </li>
                  </>
                )
              ) : (
                <li className="inline"></li>
              )}
            </ul>
            <div className="mt-6">
            <button
              className={`w-full py-3 rounded-lg text-lg font-semibold ${
                isPastEvent
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-purple-800 hover:bg-purple-900"
              }`}
              disabled={isPastEvent}
              onClick={registerEvent}
            >
              {isPastEvent ? "Past Event" : "Register"}
            </button>
            </div>
          </div>

          {/* Event Info */}
          <div className="bg-white rounded-lg shadow-lg p-7">
            <h2 className="text-2xl mt-3 font-bold">About Event</h2>
            <hr className="mt-1 border-gray-600/10" />
            <p className="mt-4 text-gray-700">🎉 {event.description} 🎉</p>
            <p className="mt-4 font-medium text-gray-700">
              {event.moreInformation}
            </p>
            <div className="mt-7 font-medium">
              <ul>
                <li className="inline text-gray-700 px-2 py-1 rounded-lg mr-2">
                  📆 Date:{" "}
                  {formattedDate}
                </li>
                <br />
                <br />
                <li className="inline text-gray-700 px-2 py-1 rounded-lg mr-2">
                  ⏰ Time: {formattedTime}
                </li>
                <br />
                <br />
                <li className="inline text-gray-700 px-2 py-1 rounded-lg mr-2">
                  📍 Location: {event.location}
                </li>
                <br />
                <br />
                <li className="inline text-gray-700 px-2 py-1 rounded-lg mr-2">
                  🎟️ Price: {Number(event.ticketPrice)} USD
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
