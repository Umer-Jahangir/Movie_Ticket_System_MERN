import React from 'react'

const Title = ({text1, text2}) => {
  return (
    <h1 className='font-medium text-2xl'>
        {text1}
        <span className='underline text-[#FF3B2E]'>
            {text2}
        </span>
    </h1>
  )
}

export default Title