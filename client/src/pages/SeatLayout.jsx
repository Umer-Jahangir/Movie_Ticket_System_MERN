import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useState } from 'react'
import Loading from '../components/Loading'
import { ArrowRightIcon, ClockIcon } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import toast from 'react-hot-toast'
import BlurCircle from '../components/BlurCircle'
import { assets } from '../assets/assets'
import { useAppContext } from '../context/AppContext'
const SeatLayout = () => {

  const groupRows = [['A', 'B'], ['C', 'D'], ['E', 'F',], ['G', 'H'], ['I', 'J']];

  const {id, date} = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [show, setShow] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([])

  const [timeoutReached, setTimeoutReached] = useState(false);

  const {axios, getToken, user} = useAppContext();

  const getShow = async () => {
   try {
      const {data} = await axios.get(`/api/show/${id}`)
      if(data.success){
        setShow(data)
      }
   } catch (error) {
    console.log(error)
   }
  }
const handleSeatClick = (seatId) => {
  if (!selectedTime) { // Assuming selectedTime is your chosen time state
    return toast('Please select a time first');
  }

  if(occupiedSeats.includes(seatId)){
    return toast('This seat is already booked.')
  }

  if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
    return toast('You can only select up to 5 seats');
  }

  setSelectedSeats((prev) =>
    prev.includes(seatId)
      ? prev.filter((seat) => seat !== seatId) // Deselect
      : [...prev, seatId] // Select
  );
};
 
  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`;
          return (
            <button
              key={seatId}
              onClick={() => handleSeatClick(seatId)}
              className={`w-8 h-8 rounded border border-[#FF3B2E]/60 cursor-pointer
                ${selectedSeats.includes(seatId) && 'bg-[#FF3B2E] text-white'}
                ${occupiedSeats.includes(seatId) && "opacity-50"}`}>
              {seatId}
            </button>
          );
        })}
      </div>
    </div>
  );

   const getOccupiedSeats = async ()=>{
    try {
      const {data} = await axios.get(`/api/booking/seats/${selectedTime.showId}`)
      if(data.success){
        setOccupiedSeats(data.occupiedSeats)
      }else{
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
    }
   }
  
  const bookTickets = async () =>{
    try {
      if(!user) return toast.error('Please login to proceed')

      if(!selectedTime || !selectedSeats.length) return toast.error('Please select a time and seats.');

      const{data} = await axios.post('/api/booking/create', {
        showId: selectedTime.showId, selectedSeats
      },
        {headers: { Authorization : `Bearer ${await getToken()}`}}
      )
      
      if(data.success){
        window.location.href = data.url;
      }else{
        toast.error(data.message)
      }

    } catch (error) {
      toast.error(error.message)
    }
  }
  useEffect(() => {
    getShow();  
  }, []);

  useEffect(() => {
    if(selectedTime){
      getOccupiedSeats();
    }  
  }, [selectedTime]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!show?.movie) {
    return timeoutReached ? (
      <div className="flex items-center justify-center min-h-screen text-gray-600 text-lg">
        🎬 No  match seat found
      </div>
    ) : (
      <Loading />
    );
  }

  return (
  <div className='flex flex-col md:flex-row px-6 md:px-16 lg:px-30 py-30 md:pt-50'>
    {/* Available Time */}
    <div className='w-60 bg-[#FF3B2E]/10 border border-[#FF3B2E]/20 rounded-lg py-10 h-max md:sticky md:top-30'>
      <p className='text-lg font-medium px-6'>Available Timings</p>
      <div className='mt-5 space-y-1'>
        {show.dateTime[date].map((item) => (
          <div key = {item.time} onClick = {()=>setSelectedTime(item)} className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${selectedTime?.time === item.time ? 'bg-[#FF3B2E] text-white' : 'hover:bg-[#FF3B2E]/20'}`}>
            <ClockIcon className='w-4 h-4'/>
            <p className='text-sm'>{isoTimeFormat(item.time)}</p>
          </div>
        ))}
      </div>
    </div>
    {/* Seat Layout */}
    <div className='relative flex-1 flex flex-col items-center max-md:mt-16'>
      <BlurCircle top='-100px' left='-100px' />
      <BlurCircle top='0' right='0' />
      <h1 className='text-2xl font-semibold mb-4'> Select your seat</h1>
      <img src ={assets.screenImage} alt = 'screen' />
      <p className='text-gray-400 text-sm mb-6'> SCREEN SIDE</p>
      <div className='flex flex-col items-center mt-10 text-xs text-gray-500'>
       <div className='grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6'>
        {groupRows[0].map(row => renderSeats(row))}
       </div>
        <div className='grid grid-cols-2 gap-11'>
          {groupRows.slice(1).map((group, index) => (
          <div key={index}>
          {group.map(row => renderSeats(row))} 
          </div>
           ))} 
        </div>
    </div>
    <button onClick = {bookTickets} className='flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-[#FF3B2E] hover:bg-[#e03528] transition text-white rounded-md font-medium cursor-pointer active:scale-95'>
      Proceed to Checkout
      <ArrowRightIcon strokeWidth={3} className='w-4 h-4'/>
    </button>
  </div>
</div>
  ) 
}

export default SeatLayout