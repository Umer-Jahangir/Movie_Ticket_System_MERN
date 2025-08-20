import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { dummyShowsData } from '../assets/assets';
import { StarIcon, PlayCircleIcon, Heart, Ticket } from 'lucide-react';
import BlurCircle from '../components/BlurCircle';
import timeFormat from '../lib/timeFormat';
import DateSelect from '../components/DateSelect';
import { useLocation } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import Loading from '../components/Loading'
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
const MovieDetails = () => {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const navigate = useNavigate();

  const location = useLocation();

  useEffect(() => {
    if (!show) return;                // wait until DOM has rendered DateSelect
    if (!location.hash) return;

    // prefer getElementById to avoid issues with special characters
    const targetId = location.hash.slice(1);
    const el = document.getElementById(targetId);

    if (el) {
      // small delay ensures layout is settled
      setTimeout(() => {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [show, location.key, location.hash]);

  const currentMovie = dummyShowsData.find(show => show.id === Number(id));

  const {shows, axios, getToken, user, fetchFavoriteMovies, favoriteMovies, image_base_url} = useAppContext()

  const getShow = async () => {
     try {
        const {data} = await axios.get(`/api/show/${id}`)
        if(data.success){
          setShow(data)
        }
     } catch (error) {
      console.log(error)
     }
  };

  useEffect(() => {
    getShow();
  }, [id]);

  const handleFavoriteClick = async () => {
     try {
      if(!user) return toast.error('Please login to proceed')
        const {data} = await axios.post('/api/user/update-favorite', {movieId: id},
      {headers: {Authorization: `Bearer ${await getToken()}`}})

      if(data.success){
        await fetchFavoriteMovies()
        toast.success(data.message)
      }
     } catch (error) {
      console.log(error)
      
     }
  };

  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!show?.movie) {
    return timeoutReached ? (
      <div className="flex items-center justify-center min-h-screen text-gray-600 text-lg">
        🎬 No movie match found
      </div>
    ) : (
      <Loading />
    );
  }

  return (
    <div className='px-6 md:px-16 lg:px-40 pt-30 md:pt-50'>
      <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>
        <img
          src={image_base_url + show.movie.poster_path}
          alt={show.movie.title}
          className='max-md:mx-auto rounded-xl h-104 max-w-70 object-cover'
        />
        <div className='relative flex flex-col gap-3'>
          <BlurCircle top='-100px' left='-100px' />
          <p className='text-[#FF3B2E] fill-[#FF3B2E]'>English</p>
          <h1 className='text-4xl font-semibold max-w-96 text-balance'>
            {show.movie.title}
          </h1>
          <div className='flex items-center gap-2 text-gray-300'>
            <StarIcon className='w-5 h-5 text-[#FF3B2E] fill-[#FF3B2E]' />
            {show.movie.vote_average.toFixed(1)} User Rating
          </div>
          <p className='text-gray-400 mt-2 text-sm leading-tight max-w-xl'>
            {show.movie.overview}
          </p>
          <p>
            {timeFormat(show.movie.runtime)} •{' '}
            {show.movie.genres.map(genre => genre.name).join(' | ')} •{' '}
            {new Date(show.movie.release_date).getFullYear()}
          </p>
            <div className="flex items-center gap-4">
              <a
                href="#dateSelect"
                className="px-4 py-2 text-xs bg-[#FF3B2E] hover:bg-[#e03528] transition rounded-md font-medium cursor-pointer mt-2 text-white flex items-center gap-2"
              >
                <Ticket className="w-4 h-4" />
                Book Tickets
              </a>
              <button
                onClick={() =>
                  navigate('/Trailer', {
                    state: {
                      trailer: currentMovie.trailerUrl,
                      title: currentMovie.title
                    }
                  })
                }
                className="flex items-center gap-2 px-4 py-2 text-xs bg-gray-500 hover:bg-gray-800 text-white transition rounded-md font-medium cursor-pointer mt-2"
              >
                <PlayCircleIcon className="w-4 h-4" />
                Watch Trailer
              </button>
            </div>
            <button
              onClick={handleFavoriteClick}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/50 
                        hover:bg-black/70 hover:scale-110 hover:shadow-lg hover:shadow-red-500/40 
                        transition-all duration-200 ease-in-out cursor-pointer"
            >
              <Heart
                className={`w-5 h-5 ${
                  favoriteMovies.find(movie => movie._id === id)
                    ? 'fill-red-500 text-red-500'
                    : 'text-white'
                }`}
              />
            </button>

        </div>
      </div>
      <p className='text-lg font-medium mt-20'>Your Favorite Cast</p>
     <div className="mt-8 pb-4">
      <div className="flex flex-wrap justify-center gap-4 px-4">
        {show.movie.casts.slice(0, 11).map((cast, index) => (
          <div
            key={index}
            className="flex flex-col items-center text-center w-20"
          >
            <img
              src={image_base_url + cast.profile_path}
              alt=""
              className="rounded-full h-20 md:h-20 aspect-square object-cover"
            />
            <p className="font-medium text-xs mt-3">{cast.name}</p>
          </div>
        ))}
      </div>
    </div>
    <div id="dateSelect" className="scroll-mt-24">
      <DateSelect dateTime={show.dateTime} id={id} />
    </div>
      <p className='text-lg font-medium mt-20 mb-8'>You May Also Like</p>
      <div className='flex flex-wrap gap-8 max-sm:justify-center gap-8'>
           {shows.slice(0,4).map((movie, index)=>(
            <MovieCard key = {index} movie = {movie}/> 
          ))}
    </div>
    <div className='flex justify-center mt-20'>
      <button onClick = {() => navigate('/movies')} className='px-10 py-3 text-sm bg-[#FF3B2E] hover:bg-[#e03528] transition rounded-md font-medium cursor-pointer'>
        Show More
      </button>
    </div>
    </div>
  );
};

export default MovieDetails;
