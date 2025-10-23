import { useNavigate, useOutletContext, Link as RouterLink } from 'react-router-dom'
import { Add, Launch, Remove } from '@mui/icons-material'
import { Box, Button, IconButton, LinearProgress, RadioGroup, TextField, Typography } from '@mui/material'
import { useRef, useState } from 'react'
import { createPoll, requuestStateEnum } from '../firebase/utils'
import useTitle from '../hook/useTitle'
export default function CreatePoll () {
  const [options, setOptions] = useState([{ index: 0 }])
  const idPoll = useRef()
  const [errors, setErrors] = useState({})
  const [,, setMessage] = useOutletContext()
  const [requestState, setRequestState] = useState(requuestStateEnum.none)
  const handleClick = () => setOptions([...options, { index: (options[options.length - 1].index + 1) }])
  const handleRemove = (index) => setOptions(options.filter(item => item.index !== index).map((item, i) => {
    if (item.index > index) {
      item.index = i
    }
    return item
  }))
  const handleAdd = (index) => setOptions((val) => {
    if (val.length === 1) {
      return [...val, { index: (val[val.length - 1].index + 1) }]
    } else {
      console.log('newOptions0', index)
      const newOptions = val.slice(0, index + 1)
      newOptions.push({ index: index + 2, value: '' })
      const newOptions1 = val.slice(index + 1, val.length)
      const newOptions2 = [...newOptions, ...newOptions1]
      newOptions2.map((item, i) => {
        if (item.index > index) {
          item.index = i
        }
        return item
      })
      return newOptions2
    }
  })
  const navigate = useNavigate()
  useTitle({ title: 'Create Poll' })

  const handleSubmit = (e) => {
    e.preventDefault()
    const target = e.target
    const formData = new FormData(target)
    const title = formData.get('title')
    let options = Object.fromEntries(formData)
    delete options.title
    options = Object.values(options)
    options[options.length - 1].length === 0 && options.pop() // remove last empty option
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
      setMessage({ message: err.message, severity: 'error' })
    }
  }

  const handleValidations = (options, title) => {
    if (options.some(item => item.length === 0)) {
      setOptions(options => options.map((item, index) => {
        if ((!item.value || item.value.length === 0)) {
          return { ...item, error: true }
        }
        item.error = false
        return item
      })
      )
    }
    if (options.filter(item => item.length > 0).length < 2) {
      throw new Error('At least two options are required')
    }
    if (title.length < 3) {
      throw new Error('Title must be at least 3 characters long')
    }
  }

  const handleShare = () => {
    navigate(`/poll/${idPoll.current}`)
  }
  const handleChange = (e, index) => {
    if (e.target.value !== '' && e.target.value.length > 0 && (index + 1) - options.length === 0) {
      handleClick()
    }
    setOptions(options => {
      return options.map(item => {
        if (item.index === index) {
          return { ...item, error: false }
        }
        return item
      })
    })
    const value = e.target.value
    setOptions(options => {
      const newOptions = options.map(item => {
        if (item.index === index) {
          return { ...item, value }
        }
        return item
      })
      return newOptions
    })
  }
  return (
    <>
      <LinearProgress variant='indeterminate' sx={{ visibility: requestState === requuestStateEnum.pending ? 'visible' : 'hidden' }} />
      <Box width='100%' maxWidth='md' mx='auto' px={2} display='flex' flex='1' flexDirection='column' gap={2} py={2} bgcolor='background.paper'>
        <Box sx={{ flex: '1' }} component='form' maxWidth='md' display='flex' flexDirection='column' gap={1} onSubmit={handleSubmit}>
          <TextField variant='filled' label='title' name='title' required error={errors.title} />
          <RadioGroup
            sx={{
              flexGrow: '1',
              flexShrink: '1',
              flexBasis: 'auto',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              gap: 1,
              flexWrap: 'nowrap',
              height: '100%',
              maxHeight: '100%'
            }} name='options'
          >
            {errors.options && <Typography variant='caption' color='error'>{errors.options[0]} item in <b>{errors.options[1] + 1}</b> position</Typography>}
            {options.map(item => {
              return (
                <Box key={item.index} display='flex' flexDirection='row' alignItems='center' gap={1}>
                  <IconButton
                    onClick={() => handleRemove(item.index)} disabled={!(options.length > 1)} sx={{
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  ><Remove />
                  </IconButton>
                  <TextField
                    error={item.error}
                    onChange={(e) => {
                      handleChange(e, item.index)
                    }} variant='filled' label='option' autoComplete='off' name={`option ${item.index}`} value={item.value || ''}
                  />
                  <IconButton
                    onClick={() => handleAdd(item.index)} sx={{
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  ><Add />
                  </IconButton>
                </Box>
              )
            })}
          </RadioGroup>
          <Box display='flex' flexDirection='column' justifyContent='flex-end'>
            <Button sx={{ width: 'fit-content', alignSelf: 'flex-end' }} type='submit' variant='contained' color='secondary' startIcon={<Add />} disabled={requestState === requuestStateEnum.pending}>
              create poll
            </Button>
          </Box>
          {idPoll.current && <Button startIcon={<Launch />} onClick={handleShare}>View poll</Button>}
        </Box>
        <Typography variant='body2' align='center' fontSize={12}>
          Once created, this will be available for voting <b>30 mins</b>. After that, the poll will be closed and the results will be public.
        </Typography>
      </Box>
    </>
  )
}
