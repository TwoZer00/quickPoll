import React, { useEffect } from 'react'

const GoogleAd = () => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (e) {
      console.error('Error loading Google ad:', e)
    }
  }, [])

  return (
    <ins
      className='adsbygoogle'
      style='display:inline-block;width:728px;height:90px'
      data-ad-client='ca-pub-7731037445831235'
      data-ad-slot='5542566407'
    />
  )
}

export default GoogleAd
