import React, { useState } from "react";
import BlurCircle from "./BlurCircle";
import { PlayCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { dummyTrailers } from "../assets/assets";

const TrailerSection = () => {
  const location = useLocation();
  
  // Get trailer data from navigation state if available
  const passedTrailerUrl = location.state?.trailer;
  const passedTitle = location.state?.title;

  // Find matching trailer in dummyTrailers if exists
  const initialTrailer =
    dummyTrailers.find(t => t.videoUrl === passedTrailerUrl) ||
    { title: passedTitle || dummyTrailers[0].title, videoUrl: passedTrailerUrl || dummyTrailers[0].videoUrl, image: dummyTrailers[0].image };

  const [currentTrailer, setCurrentTrailer] = useState(initialTrailer);

  // Extract YouTube ID from URL
  const getYoutubeId = (url) => {
    const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : url;
  };

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden mt-10">
      <p className="text-gray-300 font-medium text-lg max-w-[960px] mx-auto">
        {currentTrailer.title || "Trailer's"}
      </p>

      {/* Trailer Player */}
      <div className="relative mt-6">
        <BlurCircle top="-100px" right="-100px" />
        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          <iframe
            src={`https://www.youtube.com/embed/${getYoutubeId(currentTrailer.videoUrl)}`}
            title={currentTrailer.title || "Trailer"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full rounded-lg"
          ></iframe>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="group grid grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto">
        {dummyTrailers.map((trailer, index) => (
          <div
            key={index}
            className="relative group-hover:not-hover:opacity-50 hover:-translate-y-1 duration-300 transition cursor-pointer"
            onClick={() => setCurrentTrailer(trailer)}
          >
            <img
              src={trailer.image}
              alt={trailer.title || "Trailer thumbnail"}
              className="rounded-lg w-full h-32 md:h-40 object-cover brightness-75"
            />
            <PlayCircle
              strokeWidth={1.6}
              className="absolute top-1/2 left-1/2 w-5 md:w-8 h-5 md:h-12 transform -translate-x-1/2 -translate-y-1/2 text-white"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrailerSection;
