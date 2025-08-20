import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StarIcon, Clock, CalendarDays, PlayCircleIcon, Ticket } from 'lucide-react';
import timeFormat from '../lib/timeFormat';
import { useAppContext } from '../context/AppContext';
const HeroSection = () => {
  const navigate = useNavigate();
  const { shows, image_base_url } = useAppContext();
  const [currentMovie, setCurrentMovie] = useState(0);

  const nextMovie = () => {
    setCurrentMovie((prev) => (prev + 1) % shows.length);
  };

  useEffect(() => {
    if (shows.length > 0) {
      const timer = setInterval(nextMovie, 5000);
      return () => clearInterval(timer);
    }
  }, [shows]);

  if (shows.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center text-gray-300">
        Loading movies...
      </div>
    );
  }

  const movie = shows[currentMovie];

  return (
    <div
      className="relative flex flex-col items-start justify-center gap-4 
        px-6 md:px-16 lg:px-36 h-screen bg-cover bg-center transition-all duration-700"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.5)),
          url(${image_base_url + movie.backdrop_path})`,
      }}
    >
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-2 mt-6">
        {movie.title}
      </h1>

      <div className="flex items-center gap-4 text-gray-300 text-sm mb-4 flex-wrap">
        
        {
        /* Release Date 
        <div className="flex items-center gap-2 mt-2 text-white/80 text-sm">
          <CalendarDays className="w-4 h-4" />
          <span>{dateFormat(movie.release_date)}</span>
        </div>
        */
        }
        <div className="flex items-center gap-1">
          <StarIcon className="w-4 h-4 text-yellow-400" />
          <span>{movie.vote_average.toFixed(1)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{timeFormat(movie.runtime)}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {movie.genres.map((genre) => (
            <span key={genre.id} className="px-2 py-1 bg-gray-800 rounded-full">
              {genre.name}
            </span>
          ))}
        </div>
      </div>

      <p className="text-gray-300 text-lg md:text-xl max-w-2xl mb-8">
        {movie.overview}
      </p>

      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/movies/${movie._id}#dateSelect`)}
          className="px-4 py-2 text-xs bg-[#FF3B2E] hover:bg-[#e03528] transition rounded-md font-medium cursor-pointer mt-2 text-white flex items-center gap-2"
        >
          <Ticket className="w-4 h-4" />
          Book Tickets
        </button>

        {/*
        <button
          onClick={() =>
            navigate('/Trailer', {
              state: {
                trailer: movie.trailerUrl,
                title: movie.title,
              },
            })
          }
          className="flex items-center gap-2 px-4 py-2 text-xs bg-gray-500 hover:bg-gray-800 text-white transition rounded-md font-medium cursor-pointer mt-2"
        >
          <PlayCircleIcon className="w-4 h-4" />
          Watch Trailer
        </button>

        */}
        
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {shows.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentMovie(index)}
            className={`w-2 h-2 rounded-full transition-all 
              ${currentMovie === index ? 'bg-[#FF3B2E] w-8' : 'bg-gray-500'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSection;
