import React from 'react';
import MovieCard from '../components/MovieCard';
import BlurCircle from '../components/BlurCircle';
import { useFavorites } from '../context/FavoritesContext';

const Favorite = () => {
  const { favorites } = useFavorites();

  return favorites.length > 0 ? (
    <div className="relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]">
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="50px" right="50px" />

      <h1 className="text-lg font-medium my-4">Your Favorite Movies</h1>
      <div className="flex flex-wrap max-sm:justify-center gap-8">
        {favorites.map((movie) => (
          <MovieCard
            movie={movie}
            key={movie._id}
          />
        ))}
      </div>
    </div>
  ) : (
    <div>
      <h1 className="text-2xl font-semibold text-gray-300 text-center mt-20">
        No Favorite Movies
      </h1>
      <p className="text-gray-400 text-center mt-4">
        Click the heart icon on a movie to add it here.
      </p>
    </div>
  );
};

export default Favorite;
