'use client';
import { ethers } from "ethers";
import { abi } from "./BlockPass.json";

const contractAddress = '0xb174642C2394fF821dA1512bc44D996D37B88482';
const provider = new ethers.BrowserProvider(window.ethereum, "any");
const signer = await provider.getSigner();
console.log(signer)
const BlockPassContract = new ethers.Contract(contractAddress, abi, signer);


export const fetchEventsFromContract = async () => {
  try {
    let fetchedEvents = [];

    const BlockPassEvents = await BlockPassContract.getAllPasses();
    console.log(BlockPassEvents);
    for (let i = 0; i < BlockPassEvents.length; i++) {
      const event = BlockPassEvents[i];
      console.log(event);
      let metadata;
      try {
        metadata = JSON.parse(event.metadata);
      } catch (error) {
        console.error(`Invalid metadata for event ${i}:`, error);
        continue; // Skip this event if metadata is not valid JSON
      }
      console.log(metadata);

      // Extract the date from the event data or metadata
      const eventDate = new Date(Number(event.startTime) * 1000).toISOString().split("T")[0]; // Convert epoch to date

      const transformedEvent = {
        id: i,
        title: metadata.title,
        date: eventDate, // Use the extracted date
        startTime: event[7],
        endTime: event[8],
        location: metadata.location,
        imageUrl: metadata.media,
        description: metadata.description,
        category: event[2],
        moreInformation: metadata.moreInformation,
        ticketPrice: event[6],
        maxTickets: event[5],
        ticketsSold: event[4],
        registered: true,
        host: event[0],
      };

      fetchedEvents.push(transformedEvent);
    }

    console.log(fetchedEvents);
    return fetchedEvents;
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
};

export const createEvent = async (formData) => {
  try {
    // Combine date and time to create full date-time strings
    const startDateTime = `${formData.dateOfEvent}T${formData.startTime}:00`;
    const endDateTime = `${formData.dateOfEvent}T${formData.endTime}:00`;

    // Convert to epoch time (Unix timestamp in seconds)
    const startTimeEpoch = Math.floor(new Date(startDateTime).getTime() / 1000);
    const endTimeEpoch = Math.floor(new Date(endDateTime).getTime() / 1000);

    console.log("Start Time (Epoch):", startTimeEpoch);
    console.log("End Time (Epoch):", endTimeEpoch);

    const metadata = {
      title: formData.eventName,
      description: formData.description,
      moreInformation: formData.moreInformation,
      media: "https://example.com/event-image.jpg",
      location: formData.location,
    };

    const metadataString = JSON.stringify(metadata);
    const category = "Blockchain Events"; // Example category
    const salesDuration = endTimeEpoch - startTimeEpoch; // Duration in seconds

    // Pass the arguments to the smart contract
    const createTx = await BlockPassContract.createNewPass(
      Number(formData.availableSeats), // maxSupply
      Number(formData.ticketPrice), // passPriceUSD
      metadataString, // metadata link
      category, // category
      salesDuration // sales duration in seconds
    );
    await createTx.wait();

    console.log("Event created successfully!");
  } catch (error) {
    console.error("Error creating event:", error);
  }
};

export const registerForEvent = async (eventId, ticketPrice) => {
  try {
    // Proceed with the purchase
    const weiPrice = 60;
    const purchaseTx = await BlockPassContract.purchasePass(eventId, { value: weiPrice });
    console.log("📢 Purchase Transaction:", purchaseTx);
    await purchaseTx.wait();

    console.log("Registered for event successfully!");
  } catch (error) {
    console.error("Error registering for event:", error);
  }
};

export const fetchUserTickets = async () => {
  try {
    // Fetch tickets associated with the user's wallet address
    let fetchedTickets = [];
    const userPasses = await BlockPassContract.getUserPurchases(signer.address);
    console.log(`User passes:`, userPasses);
    for (let i = 0; i < userPasses.length; i++) {
        const event = await BlockPassContract.ticketPasses(userPasses[i]);
        let metadata;
      try {
        metadata = JSON.parse(event.metadata);
      } catch (error) {
        console.error(`Invalid metadata for event ${i}:`, error);
        continue; // Skip this event if metadata is not valid JSON
      }
      console.log(metadata)
      const eventDate = new Date(Number(event.startTime) * 1000).toISOString().split("T")[0];
      const transformedEvent = {
        id: userPasses[i], 
        title: metadata.title, 
        date: eventDate, 
        startTime: event[7], 
        endTime: event[8], 
        location: metadata.location, 
        imageUrl: metadata.media, 
        description: metadata.description, 
        category: event[2],  
        moreInformation: metadata.moreInformation, 
        ticketPrice: event[6], 
        maxTickets: event[5], 
        ticketsSold: event[4], 
        registered: true,
        host: event[0], 
      };

      fetchedTickets.push(transformedEvent);
      console.log(`Pass ${i}:`, event);
    }
    return fetchedTickets;
  } catch (error) {
    console.error("Error fetching user tickets:", error);
    throw error;
  }
};
