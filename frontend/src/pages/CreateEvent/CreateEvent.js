/* eslint-disable @next/next/no-img-element */
"use client"; 

import { useContext, useState } from "react";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createEvent } from "@/contractAPI";

import logo from "../../assets/logos/logo.png"; 

const CreateEventForm = () => {
  const [formData, setFormData] = useState({
    eventName: "",
    category: "",
    description: "",
    moreInformation: "",
    ticketPrice: "",
    availableSeats: "",
    location: "",
    startTime: "",
    endTime: "",
    dateOfEvent: "",
    banner: null,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === "ticketPrice" || name === "availableSeats") && value < 0) {
      return;
    }
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevData) => ({ ...prevData, banner: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prevData) => ({ ...prevData, banner: null }));
    setImagePreview(null);
    document.getElementById("banner").value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.banner) {
      alert("Please select a banner to upload.");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log(formData)
      // Simulate event creation logic here
      console.log("Creating event with details:");
      await createEvent(formData);

      setFormData({
        eventName: "",
        category: "",
        description: "",
        moreInformation: "",
        ticketPrice: "",
        availableSeats: "",
        location: "",
        startTime: "",
        endTime: "",
        dateOfEvent: "",
        banner: null,
      });
      setImagePreview(null);
      e.target.reset();
      router.push("/events"); // Navigate to events page
    } catch (error) {
      console.error("Error uploading banner:", error);
      setUploadStatus("Failed to upload banner.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <nav className="container flex justify-between mx-auto items-center px-8 py-4">
        <Link href="/">
          <motion.div whileHover={{ scale: 1.1 }} className="flex items-center">
            <Image
              src={logo}
              alt="BlockPass Logo"
              width={32}
              height={32}
            />
            <span className="text-black font-semibold text-lg">
              Bloock<span className="text-[#F5167E]">Pass</span>
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

        <div className={`md:flex ${isMenuOpen ? "block" : "hidden"} space-x-6`}>
          {["Home", "All Events", "My tickets"].map((text, index) => (
             <Link
             key={index}
             href={
               text === "All events"
                 ? "/events"
                 : text === "My tickets"
                 ? "/my-tickets"
                 : "/"
             }
              className="block md:inline-block text-black hover:text-[#F5167E] py-2 md:py-0"
            >
              {text}
            </Link>
          ))}
        </div>
      </nav>

      <div className="max-w-6xl mx-auto my-10 p-8">
        <h2 className="text-3xl font-bold mb-1">Create An Event</h2>
        <p className="mb-5 text-gray-500">
          Your Best Event Place for booking and management
        </p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="eventName" className="block text-sm font-medium mb-2">
            Event Name <span className="text-red-700">*</span>
          </label>
          <input
            id="eventName"
            name="eventName"
            type="text"
            required
            onChange={handleChange}
            className="mb-4 p-2 w-full border-2 rounded-md"
          />

          <label
            htmlFor="ticketPrice"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Ticket Price in $<span className="text-red-700">*</span>
          </label>
          <input
            id="ticketPrice"
            name="ticketPrice"
            type="float"
            min="0"
            required
            onChange={handleChange}
            placeholder="e.g. 1 USDT"
            className="mb-4 p-2 w-full border-2 border-gray-300 flex-auto rounded-md bg-white/5"
          />

          <label
            htmlFor="availableSeats"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Available Seats <span className="text-red-700">*</span>
          </label>
          <input
            id="availableSeats"
            name="availableSeats"
            type="number"
            min="1"
            required
            onChange={handleChange}
            placeholder="e.g. 100"
            className="mb-4 p-2 w-full border-2 border-gray-300 flex-auto rounded-md bg-white/5"
          />

          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Location <span className="text-red-700">*</span>
          </label>
          <input
            id="location"
            name="location"
            type="text"
            required
            onChange={handleChange}
            placeholder="e.g. online, venue"
            className="mb-4 p-2 w-full border-2 border-gray-300 flex-auto rounded-md bg-white/5"
          />

          <label
            htmlFor="startTime"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Start Time <span className="text-red-700">*</span>
          </label>
          <input
            id="startTime"
            name="startTime"
            type="time"
            required
            onChange={handleChange}
            placeholder="e.g. online, venue"
            className="mb-4 p-2 w-full border-2 border-gray-300 flex-auto rounded-md bg-white/5"
          />

          <label
            htmlFor="endTime"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            End Time <span className="text-red-700">*</span>
          </label>
          <input
            id="endTime"
            name="endTime"
            type="time"
            required
            onChange={handleChange}
            placeholder="e.g. online, venue"
            className="mb-4 p-2 w-full border-2 border-gray-300 flex-auto rounded-md bg-white/5"
          />

          <label
            htmlFor="dateOfEvent"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Date of Event <span className="text-red-700">*</span>
          </label>
          <input
            id="dateOfEvent"
            name="dateOfEvent"
            type="date"
            required
            onChange={handleChange}
            placeholder="e.g. online, venue"
            className="mb-4 p-2 w-full border-2 border-gray-300 flex-auto rounded-md bg-white/5"
          />
          <label
            htmlFor="category"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Category <span className="text-red-700">*</span>
          </label>
          <select
            id="category"
            name="category"
            required
            onChange={handleChange}
            className="mb-4 p-2 w-full border-2 border-gray-300 rounded-md bg-white/5"
          >
            <option value="">Select category</option>
            <option value="Blockchain Events">Blockchain Events</option>
          </select>

          <label
            htmlFor="shortDescription"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Short Description <span className="text-red-700">*</span>
          </label>
          <textarea
            id="shortDescription"
            name="description"
            required
            onChange={handleChange}
            placeholder="e.g. event targeted at teens in tech/health industry"
            className="mb-4 p-2 w-full border-2 border-gray-300 rounded-md bg-white/5"
            rows="3"
          ></textarea>

          <label
            htmlFor="moreInformation"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            More Information <span className="text-red-700">*</span>
          </label>
          <textarea
            id="moreInformation"
            name="moreInformation"
            required
            onChange={handleChange}
            placeholder="e.g. event targeted at teens in tech/health industry"
            className="mb-4 p-2 w-full border-2 border-gray-300 rounded-md bg-white/5"
            rows="3"
          ></textarea>

          <label
            htmlFor="banner"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Upload Event Banner <span className="text-red-700">*</span>
          </label>
          <input
            id="banner"
            name="banner"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mb-4 p-2 w-full border-2 border-gray-300 rounded-md bg-white/5"
          />

          {imagePreview && (
            <div className="mb-4">
              <img
                src={imagePreview}
                alt="Banner Preview"
                className="max-w-[30%] h-auto"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
              >
                Remove Image
              </button>
            </div>
          )}

          <div className="flex justify-center">
            <motion.button
            whileHover={{scale: 1.1}}
            transition={{duration: 0.5}}
              type="submit"
              disabled={isSubmitting}
              className="bg-[#F5167E] text-center text-lg font-semibold text-white p-4 rounded-md"
            >
              {isSubmitting ? "Submitting..." : "Create Event"}
            </motion.button>
          </div>
        </form>
      </div>
    </>
  );
};

export default CreateEventForm;
