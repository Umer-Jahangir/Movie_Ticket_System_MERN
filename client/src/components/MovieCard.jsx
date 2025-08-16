import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StarIcon, Heart } from 'lucide-react';
import timeFormat from '../lib/timeFormat';
import { useFavorites } from '../context/FavoritesContext';

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (isFavorite(movie._id)) {
      removeFavorite(movie._id);
    } else {
      addFavorite(movie);
    }
  };

  return (
    <div className="flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300 w-66 relative">
      
      {/* Favorite Icon Button */}
      <button
        onClick={handleFavoriteClick}
        className="absolute top-3 right-3 p-2 rounded-full bg-black/50 
                  hover:bg-black/70 hover:scale-110 hover:shadow-lg hover:shadow-red-500/40 
                  transition-all duration-200 ease-in-out cursor-pointer"
      >
        <Heart
          className={`w-5 h-5 ${isFavorite(movie._id) 
              ? 'fill-red-500 text-red-500'
              : 'text-white'
          }`}
        />
      </button>

      {/* Movie Image */}
      <img
        onClick={() => {
          navigate(`/movies/${movie._id}`);
          scrollTo(0, 0);
        }}
        src={movie.backdrop_path}
        alt="Movie Poster"
        className="rounded-lg h-52 w-full object-cover object-right-bottom cursor-pointer"
      />

      {/* Title */}
      <p className="font-semibold mt-2 truncate">{movie.title}</p>

      {/* Release year, genres, runtime */}
      <p className="text-sm text-gray-400 mt-2">
        {new Date(movie.release_date).getFullYear()} • {' '}
        {movie.genres.slice(0, 2).map((genre) => genre.name).join(' | ')} •{' '}
        {timeFormat(movie.runtime)}
      </p>

      {/* Buy Tickets & Rating */}
      <div className="flex items-center justify-between mt-2">
        <button
          onClick={() => {
            navigate(`/movies/${movie._id}`);
            scrollTo(0, 0);
          }}
          className="px-4 py-2 text-xs bg-[#FF3B2E] hover:bg-[#e03528] transition rounded-full font-medium cursor-pointer"
        >
          Buy Tickets
        </button>

        <p className="flex items-center gap-1 text-sm text-gray-400">
          <StarIcon className="w-4 h-4 text-[#FF3B2E] fill-[#FF3B2E]" />
          {movie.vote_average.toFixed(1)}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
