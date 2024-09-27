import { CssBaseline, Typography } from '@mui/material'
import React from 'react'
import { useRouteError } from 'react-router-dom'

export default function Error () {
  const error = useRouteError()
  console.error(error)
  return (
    <>
      <CssBaseline />
      <Typography variant='h1'>{ERRORS[error.code]}</Typography>
    </>
  )
}

const ERRORS = {
  15: 'poll not found',
  16: 'poll closed'
}
