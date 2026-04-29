import { useNavigate, useOutletContext } from 'react-router-dom'
import { Add, Launch, Remove, AddPhotoAlternate, Close } from '@mui/icons-material'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, InputAdornment, LinearProgress, Paper, TextField, Typography, Avatar } from '@mui/material'
import { useRef, useState } from 'react'
import { createPoll, requestStateEnum } from '../firebase/utils'
import { uploadImage } from '../utils/cloudinary'
import useTitle from '../hook/useTitle'
import PageWrapper from '../components/PageWrapper'

import { POLL_DURATION_MINUTES } from '../const/Const'

export default function CreatePoll () {
  const [options, setOptions] = useState([{ index: 0 }, { index: 1 }])
  const idPoll = useRef()
  const [titleError, setTitleError] = useState('')
  const { setMessage } = useOutletContext()
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

  const handleImageChange = (e, index) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setMessage({ message: 'Only image files are allowed', severity: 'error' }); return }
    if (file.size > 5 * 1024 * 1024) { setMessage({ message: 'Image must be under 5MB', severity: 'error' }); return }
    const preview = URL.createObjectURL(file)
    setOptions(prev => prev.map(item =>
      item.index === index ? { ...item, imageFile: file, imagePreview: preview } : item
    ))
  }

  const handleRemoveImage = (index) => {
    setOptions(prev => prev.map(item =>
      item.index === index ? { ...item, imageFile: null, imagePreview: null } : item
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const title = formData.get('title').trim()
    let optionsData = Object.fromEntries(formData)
    delete optionsData.title
    optionsData = Object.values(optionsData).map(v => v.trim()).filter(v => v.length > 0)

    try {
      handleValidations(optionsData, title)
      setRequestState(requestStateEnum.pending)

      const filledOptions = options.filter(o => o.value && o.value.trim().length > 0)
      const imageUploads = await Promise.all(
        filledOptions.map(o => o.imageFile
          ? uploadImage(o.imageFile).catch(() => null)
          : Promise.resolve(null))
      )
      const optionsWithImages = optionsData.map((text, i) => ({
        title: text,
        ...(imageUploads[i] && { image: imageUploads[i] })
      }))

      createPoll({ title, options: optionsWithImages }).then((id) => {
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
    <PageWrapper>
      <Paper elevation={3} sx={{ width: '100%', overflow: 'hidden' }}>
        <LinearProgress variant='indeterminate' sx={{ visibility: requestState === requestStateEnum.pending ? 'visible' : 'hidden' }} />
        <Box component='form' display='flex' flexDirection='column' gap={2} p={3} onSubmit={handleSubmit}>
          <Box>
            <Typography variant='h5' fontWeight={600}>Create a Poll</Typography>
            <Typography variant='body2' color='text.secondary'>
              Add a title and at least two options to get started.
            </Typography>
          </Box>

          <TextField
            variant='outlined' label='Title' name='title' required fullWidth
            error={!!titleError} helperText={titleError}
            inputProps={{ maxLength: 200 }}
            onChange={() => titleError && setTitleError('')}
          />

          <Divider />

          <Box ref={optionsRef} display='flex' flexDirection='column' gap={1} sx={{ maxHeight: '40vh', pt:1,overflowY: 'auto' }}>
            {options.map(item => (
              <Box key={item.index} display='flex' gap={1} alignItems='center'>
                {item.imagePreview
                  ? (
                    <Box position='relative'>
                      <Avatar src={item.imagePreview} variant='rounded' sx={{ width: 40, height: 40 }} />
                      <IconButton size='small' onClick={() => handleRemoveImage(item.index)} sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper', p: 0.25 }}>
                        <Close sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                    )
                  : (
                    <IconButton component='label' size='small' aria-label={`Add image to option ${item.index + 1}`}>
                      <AddPhotoAlternate fontSize='small' />
                      <input type='file' hidden accept='image/*' onChange={(e) => handleImageChange(e, item.index)} />
                    </IconButton>
                    )}
                <TextField
                  fullWidth size='small'
                  error={!!item.error}
                  helperText={item.error || ''}
                  onChange={(e) => handleChange(e, item.index)}
                  variant='outlined' label={`Option ${item.index + 1}`} autoComplete='off'
                  name={`option ${item.index}`} value={item.value || ''}
                  inputProps={{ maxLength: 200 }}
                  InputProps={options.length > 2 ? {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton edge='end' aria-label={`Remove option ${item.index + 1}`} onClick={() => handleRemove(item.index)} size='small'>
                          <Remove fontSize='small' />
                        </IconButton>
                      </InputAdornment>
                    )
                  } : undefined}
                />
              </Box>
            ))}
          </Box>
          <Button
            startIcon={<Add />} onClick={() => { handleAddOption(); requestAnimationFrame(() => optionsRef.current?.scrollTo({ top: optionsRef.current.scrollHeight, behavior: 'smooth' })) }}
            sx={{ alignSelf: 'flex-start' }}
          >
            Add Option
          </Button>

          <Divider />

          <Box display='flex' justifyContent='space-between' alignItems='center' flexWrap='wrap' gap={1}>
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
    </PageWrapper>
  )
}
