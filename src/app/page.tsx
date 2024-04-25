"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";

import React from "react";
import image1 from "./assets/image1.jpg";
import image2 from "./assets/image2.jpg";
import image3 from "./assets/image3.jpg";
import Image from "next/image";

// Helper component for rendering a loading spinner
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="loader">
      <div className="animate-pulse flex space-x-4">
        <div className="rounded-full bg-slate-700 h-10 w-10"></div>
      </div>
    </div>
  </div>
);

interface ImageDisplayProps {
  image: string | null; // Assuming 'image' is a base64 encoded string or null
  message: string; // Assuming 'message' is always a string
}

const ImageDisplay: React.FC<ImageDisplayProps> = ({ image, message }) => (
  <div className="flex flex-col items-center justify-center h-screen">
    {image && (
      <img src={`data:image/jpeg;base64,${image}`} alt="Generated Content" className="max-w-md max-h-full" />
    )}
    <p className="mt-4 w-full max-w-md text-center text-white bg-black p-4">{message}</p>
  </div>
);

const ImageSelectionPage = () => {
  const { messages, append, isLoading } = useChat();
  const [imageIsLoading, setImageIsLoading] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const [message, setMessage] = useState(''); // Initialize state variable
  const [enhancedDescription, setEnhancedDescription] = useState(''); // Initialize state variable for enhanced description from server
  // const [messageStream, setMessageStream] = useState([])
  let messageStream: string[] = [];


  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const [selectedImage, setSelectedImage] = useState(1);
  const images = [
    { id: 0, src: image1 },
    { id: 1, src: image2 },
    { id: 2, src: image3 },
  ];

  // Mapping of image IDs to themes
  const themes: string[] = ['forest','mountains','beach'];

  const handleImageSelect = (event: any) => {
    setSelectedImage(+event.target.value);
  };

  return (
    <div className="p-12 text-center bg-neutral-800 m-24 rounded-xl">
      <div>
        <form>
          <label htmlFor="message" className="text-xl">Enter the action you would like to take:</label>
          <br></br>
          <input
            type = "text"
            placeholder = "Enter action"
            className = "text-black text-xl p-3 m-3 rounded-lg"
            value={message} // Bind the input field to the state variable
            onChange = {e => setMessage(e.target.value)} // Update state variable on change
          />
        </form>
      </div>
      <br></br>
      <div>
        <form>
          <label htmlFor="enhancedDescription" className="text-xl">Message from your Game Master:</label>
          <br></br>
          <textarea
            readOnly
            placeholder = "Storyline and choices will appear here"
            className = "text-black h-48 w-3/4 text-xl p-3 m-3 rounded-lg"
            value={enhancedDescription} // Bind the textarea to the state variable
          />
        </form>
      </div>
      <br></br>
      <button
        className="bg-blue-500 p-2 text-white rounded shadow-xl text-xl"
        disabled={isLoading}
        onClick={async () => {
          setImageIsLoading(true)
          const response = await fetch("api/images", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              message: messageStream.join("\n\n") + "\n\nAssume the above already happened - generate the next part of the story from here onwards.", // Use the state variable here
            }),
          });
          const data = await response.json();
          messageStream.push(data.description);
          setImage(data.image);
          setEnhancedDescription(data.description); // Update the enhanced description
          setImageIsLoading(false);
        }}
      >
        Proceed
      </button>
      <div
        hidden={
          messages.length === 0 ||
          messages[messages.length - 1]?.content.startsWith("Generate")
        }
        className="bg-opacity-25 bg-gray-700 rounded-lg p-4"
      >
        {messages[messages.length - 1]?.content}
      </div>
      {imageIsLoading && <LoadingSpinner />}
      {image && !imageIsLoading && <ImageDisplay image={image} message={messages[messages.length - 1]?.content} />}

    </div>
  );
};

export default ImageSelectionPage;
