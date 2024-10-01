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
      style={{ display: 'block', position: 'fixed', bottom: 0, left: 0 }}
      data-ad-client='ca-pub-7731037445831235'
      data-ad-slot='5542566407'
      data-ad-format='auto'
      data-full-width-responsive='true'
    />
  )
}

export default GoogleAd