import { useNavigate, useOutletContext } from 'react-router-dom'
import { Add, Launch, Remove } from '@mui/icons-material'
import { Box, Button, RadioGroup, Stack, TextField, Typography } from '@mui/material'
import { useRef, useState } from 'react'
import { createPoll } from '../firebase/utils'

const requuestStateEnum = {
  none: 'none',
  pending: 'pending',
  success: 'success',
  error: 'error'
}

export default function CreatePoll () {
  const [options, setOptions] = useState([{ index: 0 }])
  const idPoll = useRef()
  const [,, setMessage] = useOutletContext()
  const [requestState, setRequestState] = useState(requuestStateEnum.none)
  const handleClick = () => setOptions([...options, { index: (options[options.length - 1].index + 1) }])
  const handleRemove = (index) => setOptions(options.filter(item => item.index !== index))
  const [error, setError] = useState()
  const navigate = useNavigate()
  const handleSubmit = (e) => {
    e.preventDefault()
    const target = e.target
    const formData = new FormData(target)
    const title = formData.get('title')
    let options = Object.fromEntries(formData)
    delete options.title
    options = Object.values(options).filter(item => item !== '')
    try {
      handleValidations(options, title)
      setRequestState(requuestStateEnum.pending)
      createPoll({ title, options }).then((id) => {
        console.log(id)
        setRequestState(requuestStateEnum.success)
        idPoll.current = id
        setMessage({ message: 'poll created', severity: 'success' })
      }).catch((err) => {
        console.log(err)
        setRequestState(requuestStateEnum.error)
      }).finally(() => {
        setTimeout(() => {
          setRequestState(requuestStateEnum.none)
        }, 2000)
      })
    } catch (err) {
      setError(err.message)
      setMessage({ message: err.message, severity: 'error' })
    }
  }

  const handleValidations = (options, title) => {
    if (options.length < 2) {
      throw new Error('At least two options are required')
    }
    if (title.length < 3) {
      throw new Error('Title must be at least 3 characters long')
    }
  }

  const handleShare = () => {
    navigate(`/${idPoll.current}`)
  }
  return (
    <Box>
      <Typography variant='h1'>Create poll</Typography>
      <Stack direction='row' alignItems='center'>
        <Button onClick={handleClick} startIcon={<Add />}>
          add option
        </Button>
      </Stack>
      <Box component='form' maxWidth='md' display='flex' flexDirection='column' gap={1} onSubmit={handleSubmit}>
        <TextField variant='filled' label='title' name='title' required />
        <RadioGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {options.map(item => {
            return (
              <Box key={item.index} display='flex' flexDirection='row' alignItems='center'>
                <TextField variant='filled' label='option' name={`option ${item.index}`} required />
                <Button startIcon={<Remove />} onClick={() => handleRemove(item.index)} disabled={!(options.length > 1)}>remove option</Button>
              </Box>
            )
          })}
        </RadioGroup>
        <Typography variant='caption' color='error'>{error}</Typography>
        <Button type='submit' variant='contained'>
          create poll
        </Button>
        {requestState === requuestStateEnum.pending && <Typography>creating poll...</Typography>}
        {requestState === requuestStateEnum.success && <Typography>poll created!</Typography>}
        {requestState === requuestStateEnum.error && <Typography>error creating poll</Typography>}
        {idPoll.current && <Button startIcon={<Launch />} onClick={handleShare}>View poll</Button>}
      </Box>
    </Box>
  )
}
