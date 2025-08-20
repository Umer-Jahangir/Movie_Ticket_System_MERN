import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

const Loading = () => {

  const  {nextUrl} = useParams()
  const navigate = useNavigate()

  useEffect(()=>{
    if(nextUrl){
      setTimeout(()=>{
        navigate('/' + nextUrl)
      },8000)
    }
  },[])
  
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-14 w-14 border-4 border-t-[#FF3B2E] border-gray-300"></div>
    </div>
  )
}

export default Loading
