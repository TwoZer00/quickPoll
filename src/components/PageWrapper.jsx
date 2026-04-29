import { Container } from '@mui/material'
import { PropTypes } from 'prop-types'

export default function PageWrapper ({ children, maxWidth = 'sm', sx }) {
  return (
    <Container maxWidth={maxWidth} sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 3, ...sx }}>
      {children}
    </Container>
  )
}

PageWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.string,
  sx: PropTypes.object
}
