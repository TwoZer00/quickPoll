import { Divider, Link, Typography } from '@mui/material'

export const markdownComponents = {
  h1: ({ children }) => <Typography variant='h4' fontWeight={700} gutterBottom>{children}</Typography>,
  h2: ({ children }) => <Typography variant='subtitle1' fontWeight={600} mt={3} gutterBottom>{children}</Typography>,
  p: ({ children }) => <Typography variant='body2' color='text.secondary' paragraph>{children}</Typography>,
  a: ({ href, children }) => <Link href={href} target='_blank' rel='noreferrer'>{children}</Link>,
  hr: () => <Divider sx={{ my: 2 }} />,
  li: ({ children }) => <Typography component='li' variant='body2' color='text.secondary' sx={{ ml: 2 }}>{children}</Typography>,
  strong: ({ children }) => <Typography component='strong' variant='body2' fontWeight={600} color='text.primary'>{children}</Typography>
}
