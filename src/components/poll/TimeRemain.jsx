import { useEffect, useState } from 'react'
import { Chip, Skeleton } from '@mui/material'
import { TimerOutlined } from '@mui/icons-material'
import { PropTypes } from 'prop-types'
import { useTranslation } from 'react-i18next'
import dayjs from 'dayjs'
import { POLL_DURATION_SECONDS } from '../../const/Const'

export default function TimeRemain ({ date, setDuration }) {
  const { t } = useTranslation()
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
    if (diff > 60) setTime(t('time.minLeft', { n: (diff / 60).toFixed(0) }))
    if (diff <= 60) setTime(t('time.secLeft', { n: diff }))
  }, [diff])

  if (date && diff != null && diff >= 0) {
    return (
      <Chip
        icon={<TimerOutlined />} label={time} size='small' variant='outlined'
        role='timer' aria-live='polite'
        sx={{ alignSelf: 'flex-start' }}
      />
    )
  } else {
    return (
      <Skeleton variant='rounded' width={100} height={24} sx={{ borderRadius: 3 }} />
    )
  }
}

TimeRemain.propTypes = {
  date: PropTypes.number,
  setDuration: PropTypes.func.isRequired
}
