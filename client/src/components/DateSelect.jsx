import React from 'react'
import BlurCircle from './BlurCircle'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
const DateSelect = ({dateTime, id}) => {
    const navigate = useNavigate();
    const onBookHandler = () => {
        if (!selected) {
            return toast('Please select a date')
        }
        navigate(`/movies/${id}/${selected}`)
        scrollTo(0, 0)
    }
      const dates = Object.keys(dateTime);
    const [selected, setSelected] = useState(null);
    const [startIndex, setStartIndex] = useState(0); // first visible date index
    const visibleCount = 5; // show 5 dates at a time

    const handleNext = () => {
        if (startIndex + visibleCount < dates.length) {
        setStartIndex(startIndex + 1);
        }
    };

    const handlePrev = () => {
        if (startIndex > 0) {
        setStartIndex(startIndex - 1);
    }
  };
  return (
    <div id = 'dateSelect' className='pt-30'>
        <div className='flex flex-col md:flex-row items-center justify-between gap-10 relative  p-8 bg-primary/10 border border-primary/20 rounded-lg'>
            <BlurCircle top='-100px' left='-100px' />
            <BlurCircle top='100px' right='0px' />
            <div>
      <p className="text-lg font-semibold">Choose Date</p>
      <div className="flex items-center gap-6 text-sm mt-5">
        
        {/* Left Button */}
        <button
          onClick={handlePrev}
          disabled={startIndex === 0}
          className="disabled:opacity-30 cursor-pointer"
        >
          <ChevronLeftIcon width={28} />
        </button>

        {/* Dates */}
        <div className="flex gap-6">
          {dates.slice(startIndex, startIndex + visibleCount).map((date) => (
            <button
              key={date}
              onClick={() => setSelected(date)}
              className={`flex flex-col items-center justify-center h-14 w-14 aspect-square rounded cursor-pointer transition
                ${selected === date
                  ? 'bg-[#FF3B2E] text-white'
                  : 'border border-[#FF3B2E]'}
              `}
            >
              <span>{new Date(date).getDate()}</span>
              <span>
                {new Date(date).toLocaleDateString('en-us', { month: 'short' })}
              </span>
            </button>
          ))}
        </div>

        {/* Right Button */}
        <button
          onClick={handleNext}
          disabled={startIndex + visibleCount >= dates.length}
          className="disabled:opacity-30 cursor-pointer"
        >
          <ChevronRightIcon width={28} />
        </button>

      </div>
    </div>
            <button onClick = {onBookHandler}className='bg-[#FF3B2E] text-white px-8 py-2 mt-6 rounded  hover:bg-[#e03528] transition-all cursor-pointer'>
            Book Now</button>
        </div>
    </div>
  )
}

export default DateSelect