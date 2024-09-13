import React from 'react'
import { colors, Typography } from '@mui/material'
import { useTheme } from '@emotion/react'
export default function Console({consoleText}) {
    const theme = useTheme();
    return (
        <Typography
          component="pre"
          style={{
            backgroundColor: theme.palette.background.paper, 
            color: theme.palette.text.primary,
            padding: '10px',
            fontFamily: 'monospace',
            whiteSpace: 'pre', 
            overflowX: 'auto', 
            wordWrap: 'normal',
            whiteSpace : 'pre-wrap',
          }}
        >
            {consoleText}
        </Typography>
      );
    }

    

