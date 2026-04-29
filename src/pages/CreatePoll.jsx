import { useNavigate, useOutletContext } from 'react-router-dom'
import { Add, Launch, Remove } from '@mui/icons-material'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, LinearProgress, Paper, TextField, Typography } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { createPoll, requestStateEnum } from '../firebase/utils'
import useTitle from '../hook/useTitle'

import { POLL_DURATION_MINUTES } from '../const/Const'

export default function CreatePoll () {
  const [options, setOptions] = useState([{ index: 0 }, { index: 1 }])
  const idPoll = useRef()
  const [titleError, setTitleError] = useState('')
  const [,, setMessage] = useOutletContext()
  const [requestState, setRequestState] = useState(requestStateEnum.none)
  const [showSuccess, setShowSuccess] = useState(false)
  const navigate = useNavigate()
  useTitle({ title: 'Create Poll', description: 'Create a new poll and share it with others.' })

  const optionsRef = useRef()

  const MAX_OPTIONS = 20
  const handleAddOption = () => setOptions(prev => prev.length >= MAX_OPTIONS ? prev : [...prev, { index: prev[prev.length - 1].index + 1 }])

  const handleRemove = (index) => setOptions(prev =>
    prev.filter(item => item.index !== index).map((item, i) => ({ ...item, index: i }))
  )

  const handleChange = (e, index) => {
    const value = e.target.value
    setOptions(prev => prev.map(item =>
      item.index === index ? { ...item, value, error: false } : item
    ))
  }

  const handleValidations = (optionValues, title) => {
    let valid = true
    if (title.length < 3) {
      setTitleError('Title must be at least 3 characters')
      valid = false
    } else if (title.length > 200) {
      setTitleError('Title must be at most 200 characters')
      valid = false
    } else {
      setTitleError('')
    }

    const filledOptions = optionValues.filter(v => v.length > 0)
    if (filledOptions.length < 2) {
      setOptions(prev => prev.map(item => ({
        ...item,
        error: (!item.value || item.value.trim().length === 0) ? 'Option cannot be empty' : ''
      })))
      valid = false
    }

    const duplicates = new Set()
    const dupeValues = filledOptions.filter(v => {
      const lower = v.toLowerCase()
      if (duplicates.has(lower)) return true
      duplicates.add(lower)
      return false
    })
    if (dupeValues.length > 0) {
      setOptions(prev => prev.map(item => ({
        ...item,
        error: item.value && duplicates.has(item.value.trim().toLowerCase()) && dupeValues.includes(item.value.trim().toLowerCase()) ? 'Duplicate option' : item.error
      })))
      valid = false
    }

    if (!valid) throw new Error('Please fix the errors above')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const title = formData.get('title').trim()
    let optionsData = Object.fromEntries(formData)
    delete optionsData.title
    optionsData = Object.values(optionsData).map(v => v.trim()).filter(v => v.length > 0)

    try {
      handleValidations(optionsData, title)
      setRequestState(requestStateEnum.pending)
      createPoll({ title, options: optionsData }).then((id) => {
        setRequestState(requestStateEnum.success)
        idPoll.current = id
        setShowSuccess(true)
      }).catch(() => {
        setRequestState(requestStateEnum.error)
        setMessage({ message: 'Failed to create poll', severity: 'error' })
      }).finally(() => {
        setTimeout(() => setRequestState(requestStateEnum.none), 2000)
      })
    } catch (err) {
      setMessage({ message: err.message, severity: 'error' })
    }
  }

  return (
    <Box flex={1} display='flex' alignItems='center' justifyContent='center' p={2}>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 'sm', overflow: 'hidden' }}>
        <LinearProgress variant='indeterminate' sx={{ visibility: requestState === requestStateEnum.pending ? 'visible' : 'hidden' }} />
        <Box component='form' display='flex' flexDirection='column' gap={2} p={3} onSubmit={handleSubmit}>
          <Typography variant='body2' color='text.secondary'>
            Add a title and at least two options to get started.
          </Typography>

          <TextField
            variant='filled' label='Title' name='title' required fullWidth
            error={!!titleError} helperText={titleError}
            inputProps={{ maxLength: 200 }}
            onChange={() => titleError && setTitleError('')}
          />

          <Box ref={optionsRef} display='flex' flexDirection='column' gap={1} sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {options.map(item => (
              <Box key={item.index} display='flex' flexDirection='row' alignItems='flex-start' gap={1}>
                {options.length > 2 && (
                  <IconButton
                    aria-label={`Remove option ${item.index + 1}`}
                    onClick={() => handleRemove(item.index)}
                    sx={{ mt: 1, border: '1px solid', borderColor: 'divider' }}
                  >
                    <Remove />
                  </IconButton>
                )}
                <TextField
                  fullWidth
                  error={!!item.error}
                  helperText={item.error || ''}
                  onChange={(e) => handleChange(e, item.index)}
                  variant='filled' label={`Option ${item.index + 1}`} autoComplete='off'
                  name={`option ${item.index}`} value={item.value || ''}
                  inputProps={{ maxLength: 200 }}
                />
              </Box>
            ))}
            <Button
              startIcon={<Add />} onClick={() => { handleAddOption(); requestAnimationFrame(() => optionsRef.current?.scrollTo({ top: optionsRef.current.scrollHeight, behavior: 'smooth' })) }}
              sx={{ alignSelf: 'flex-start' }}
            >
              Add Option
            </Button>
          </Box>

          <Box display='flex' justifyContent='space-between' alignItems='center'>
            <Typography variant='caption' color='text.secondary'>
              Voting open for <b>{POLL_DURATION_MINUTES} min</b> after creation.
            </Typography>
            <Button type='submit' variant='contained' color='secondary' disabled={requestState === requestStateEnum.pending}>
              Create Poll
            </Button>
          </Box>
        </Box>
      </Paper>

      <Dialog open={showSuccess} onClose={() => setShowSuccess(false)}>
        <DialogTitle>Poll Created!</DialogTitle>
        <DialogContent>
          <Typography>Your poll is ready. Share it with others to start collecting votes.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSuccess(false)}>Close</Button>
          <Button variant='contained' startIcon={<Launch />} onClick={() => navigate(`/poll/${idPoll.current}`)}>
            View Poll
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
