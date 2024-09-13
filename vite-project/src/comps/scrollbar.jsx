import styled from '@emotion/styled'
import { Box } from '@mui/material'
const ScrollableBox = styled(Box)(({ theme }) => ({
    '&::-webkit-scrollbar': {
      width: '1px', // Scrollbar width
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: theme.palette.background.paper, // Track color
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: theme.palette.primary.main, // Thumb color
      borderRadius: '10px', // Round corners of the thumb
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: theme.palette.primary.dark, // Thumb color on hover
    },
  }));

export default ScrollableBox;