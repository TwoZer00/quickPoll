import React, { useEffect } from 'react'
import { PropTypes } from 'prop-types'

const GoogleAd = ({ adSlot }) => {
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
      style={{ display: 'block', height: '100%', width: '100%' }}
      data-ad-client='ca-pub-7731037445831235'
      data-ad-slot={adSlot}
    />
  )
}
GoogleAd.propTypes = {
  adSlot: PropTypes.string
}

export default GoogleAd
