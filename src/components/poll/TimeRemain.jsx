import { useEffect, useState } from 'react'
import { Skeleton, Typography } from '@mui/material'
import { PropTypes } from 'prop-types'
import dayjs from 'dayjs'
import { POLL_DURATION_SECONDS } from '../../const/Const'

export default function TimeRemain ({ date, setDuration }) {
  const [time, setTime] = useState()
  const [diff, setDiff] = useState()

  useEffect(() => {
    const diff = (POLL_DURATION_SECONDS - dayjs().diff(dayjs(date), 's'))
    if (diff >= 0) setDiff(diff)
    const interval = setInterval(() => {
      const diff = (POLL_DURATION_SECONDS - dayjs().diff(dayjs(date), 's'))
      if (diff >= 0) setDiff(diff)
      if (diff <= 0) { return clearInterval(interval) }
    }, 1000)
    return () => clearInterval(interval)
  }, [date])
  useEffect(() => {
    if (diff >= 0) {
      setDuration(diff)
    }
  }, [diff, setDuration])

  useEffect(() => {
    if (diff > 60) setTime(`${(diff / 60).toFixed(0)} minutes`)
    if (diff <= 60) setTime(`${diff} second${diff !== 1 ? 's' : ''}`)
  }, [diff])

  if (date && diff != null && diff >= 0) {
    return (
      <Typography variant='caption' role='timer' aria-live='polite'>Time remaining {time}</Typography>
    )
  } else {
    return (
      <Skeleton variant='text' width={100} />
    )
  }
}

TimeRemain.propTypes = {
  date: PropTypes.number,
  setDuration: PropTypes.func.isRequired
}
