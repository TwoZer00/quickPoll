import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { Add, Launch, Remove, AddPhotoAlternate, Close } from '@mui/icons-material'
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, InputAdornment, LinearProgress, Paper, TextField, Typography, Avatar } from '@mui/material'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createPoll, requestStateEnum } from '../supabase/utils'
import { uploadImage } from '../utils/cloudinary'
import useTitle from '../hook/useTitle'
import PageWrapper from '../components/PageWrapper'
import { POLL_DURATION_MINUTES } from '../const/Const'

export default function CreatePoll () {
  const { t } = useTranslation()
  const [options, setOptions] = useState([{ index: 0 }, { index: 1 }])
  const idPoll = useRef()
  const [titleError, setTitleError] = useState('')
  const { setMessage } = useOutletContext()
  const { lang } = useParams()
  const [requestState, setRequestState] = useState(requestStateEnum.none)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingData, setPendingData] = useState(null)
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
    if (!file.type.startsWith('image/')) { setMessage({ message: t('create.errors.imageType'), severity: 'error' }); return }
    if (file.size > 5 * 1024 * 1024) { setMessage({ message: t('create.errors.imageSize'), severity: 'error' }); return }
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
      setTitleError(t('create.errors.titleMin'))
      valid = false
    } else if (title.length > 200) {
      setTitleError(t('create.errors.titleMax'))
      valid = false
    } else {
      setTitleError('')
    }

    const filledOptions = optionValues.filter(v => v.length > 0)
    if (filledOptions.length < 2) {
      setOptions(prev => prev.map(item => ({
        ...item,
        error: (!item.value || item.value.trim().length === 0) ? t('create.errors.optionEmpty') : ''
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
        error: item.value && duplicates.has(item.value.trim().toLowerCase()) && dupeValues.includes(item.value.trim().toLowerCase()) ? t('create.errors.duplicate') : item.error
      })))
      valid = false
    }

    if (!valid) throw new Error(t('create.errors.fixErrors'))
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
      setPendingData({ title, optionsData })
      setShowConfirm(true)
    } catch (err) {
      setMessage({ message: err.message, severity: 'error' })
    }
  }

  const handleConfirm = async () => {
    const { title, optionsData } = pendingData
    setShowConfirm(false)
    try {
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
        setMessage({ message: t('create.errors.createFailed'), severity: 'error' })
      }).finally(() => {
        setTimeout(() => setRequestState(requestStateEnum.none), 2000)
      })
    } catch (err) {
      setMessage({ message: err.message, severity: 'error' })
    }
  }

  return (
    <PageWrapper>
      <Paper elevation={0} variant='outlined' sx={{ width: '100%', overflow: 'hidden' }}>
        <LinearProgress variant='indeterminate' sx={{ visibility: requestState === requestStateEnum.pending ? 'visible' : 'hidden' }} />
        <Box component='form' display='flex' flexDirection='column' gap={2.5} p={3} onSubmit={handleSubmit}>
          <Box>
            <Typography variant='h5' fontWeight={700}>{t('create.title')}</Typography>
            <Typography variant='body2' color='text.secondary'>
              {t('create.subtitle')}
            </Typography>
          </Box>

          <TextField
            variant='outlined' label={t('create.titleLabel')} name='title' required fullWidth
            error={!!titleError} helperText={titleError}
            inputProps={{ maxLength: 200 }}
            onChange={() => titleError && setTitleError('')}
          />

          <Divider />

          <Box ref={optionsRef} display='flex' flexDirection='column' gap={1.5} sx={{ maxHeight: 250, pt: 1, overflowY: 'auto' }}>
            {options.map(item => (
              <Box key={item.index} display='flex' gap={1} alignItems='center'>
                {item.imagePreview
                  ? (
                    <Box position='relative'>
                      <Avatar src={item.imagePreview} variant='rounded' sx={{ width: 40, height: 40, borderRadius: 2 }} />
                      <IconButton onClick={() => handleRemoveImage(item.index)} aria-label={t('create.optionLabel', { n: item.index + 1 })} sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper', minWidth: 44, minHeight: 44, p: 0.5 }}>
                        <Close sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>
                    )
                  : (
                    <IconButton component='label' aria-label={t('create.optionLabel', { n: item.index + 1 })} sx={{ minWidth: 48, minHeight: 48 }}>
                      <AddPhotoAlternate fontSize='small' />
                      <input type='file' hidden accept='image/*' onChange={(e) => handleImageChange(e, item.index)} />
                    </IconButton>
                    )}
                <TextField
                  fullWidth size='small'
                  error={!!item.error}
                  helperText={item.error || ''}
                  onChange={(e) => handleChange(e, item.index)}
                  variant='outlined' label={t('create.optionLabel', { n: item.index + 1 })} autoComplete='off'
                  name={`option ${item.index}`} value={item.value || ''}
                  inputProps={{ maxLength: 200 }}
                  InputProps={options.length > 2 ? {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton edge='end' aria-label={t('create.optionLabel', { n: item.index + 1 })} onClick={() => handleRemove(item.index)} sx={{ minWidth: 48, minHeight: 48 }}>
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
            {t('create.addOption')}
          </Button>

          <Divider />

          <Box display='flex' justifyContent='space-between' alignItems='center' flexWrap='wrap' gap={1}>
            <Typography
              variant='caption' color='text.secondary'
              dangerouslySetInnerHTML={{ __html: t('create.durationNote', { min: POLL_DURATION_MINUTES }) }}
            />
            <Button type='submit' variant='contained' color='primary' size='large' sx={{ px: 4 }} disabled={requestState === requestStateEnum.pending}>
              {t('create.createBtn')}
            </Button>
          </Box>
        </Box>
      </Paper>

      <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
        <DialogTitle fontWeight={700}>{t('create.confirmTitle')}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 300 }}>
          <Typography variant='body2' color='text.secondary'>{t('create.confirmBody')}</Typography>
          <Typography fontWeight={600}>{pendingData?.title}</Typography>
          <Box component='ul' sx={{ m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {pendingData?.optionsData.map((opt, i) => (
              <Typography key={i} component='li' variant='body2'>{opt}</Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowConfirm(false)}>{t('create.edit')}</Button>
          <Button variant='contained' onClick={handleConfirm}>{t('create.publish')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={showSuccess} onClose={() => setShowSuccess(false)}>
        <DialogTitle fontWeight={700}>{t('create.successTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('create.successBody')}</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowSuccess(false)}>{t('create.close')}</Button>
          <Button variant='contained' startIcon={<Launch />} onClick={() => navigate(`/${lang}/poll/${idPoll.current}`)}>
            {t('create.viewPoll')}
          </Button>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  )
}
