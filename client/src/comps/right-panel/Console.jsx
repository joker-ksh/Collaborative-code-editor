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
            overflowX: 'auto', 
            height: '92.3vh',

            wordWrap: 'normal',
            whiteSpace : 'pre-wrap',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: `${theme.palette.primary.main} ${theme.palette.background.paper}`,
          }}
        >
            {consoleText}
        </Typography>
      );
    }

    

