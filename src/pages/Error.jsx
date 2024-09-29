import { CssBaseline, Link, Typography } from '@mui/material'
import React from 'react'
import { useRouteError, Link as RouterLink } from 'react-router-dom'
import ERRORS from '../const/Const'

export default function Error () {
  const error = useRouteError()
  return (
    <>
      <CssBaseline />
      <Typography sx={{ ':first-letter': { textTransform: 'uppercase' } }} textAlign='center' variant='h1' fontWeight={500}>{ERRORS[error.code] || ('Something went wrong')}</Typography>
      <Link component={RouterLink} display='block' textAlign='center' to='..'>Go home</Link>
    </>
  )
}
