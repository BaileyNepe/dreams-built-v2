// project imports
import { type Theme } from '@mui/material/styles';

export default function componentStyleOverrides({
  theme,
  borderRadius,
  buttonRadius,
  outlinedFilled
}: {
  theme: Theme;
  borderRadius: number;
  buttonRadius: number;
  outlinedFilled: boolean;
}) {
  const { mode } = theme.palette;

  const menuSelectedBack = theme.palette.primary.lightest;
  const menuSelected = theme.palette.primary.dark;

  return {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          padding: '6px 16px',
          borderRadius: `${buttonRadius}px`
        }
      }
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none'
        },
        rounded: {
          borderRadius: `${borderRadius}px`
        }
      }
    },
    MuiCardHeader: {
      styleOverrides: {
        root: {
          color: theme.palette.text.dark,
          padding: '24px'
        },
        title: {
          fontSize: '1.125rem'
        }
      }
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px'
        }
      }
    },
    MuiCardActions: {
      styleOverrides: {
        root: {
          padding: '24px'
        }
      }
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          alignItems: 'center'
        },
        outlined: {
          border: '1px dashed'
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          color: theme.palette.text.primary,
          paddingTop: '10px',
          paddingBottom: '10px',
          '&.Mui-selected': {
            color: menuSelected,
            backgroundColor: menuSelectedBack,
            '&:hover': {
              backgroundColor: menuSelectedBack
            },
            '& .MuiListItemIcon-root': {
              color: menuSelected
            }
          },
          '&:hover': {
            backgroundColor: menuSelectedBack,
            color: menuSelected,
            '& .MuiListItemIcon-root': {
              color: menuSelected
            }
          }
        }
      }
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: theme.palette.text.primary,
          minWidth: '36px'
        }
      }
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          color: theme.palette.text.dark
        }
      }
    },

    MuiInputBase: {
      styleOverrides: {
        input: {
          color: theme.palette.text.dark,
          '&::placeholder': {
            color: theme.palette.text.secondary,
            fontSize: '0.875rem'
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            position: 'relative',
            transform: 'none',
            color: theme.palette.text.dark,
            fontWeight: 500,
            marginTop: '16px',
            top: '-6px' // Adjust this value to control label placement
          },
          '& .MuiInputLabel-shrink': {
            transform: 'none'
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              '& > legend': {
                maxWidth: 0 // Ensure the legend does not take up space
              }
            }
          }
        }
      }
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: 'transparent',
          borderRadius: `${borderRadius}px`,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.grey[400]
          },
          '&:hover $notchedOutline': {
            borderColor: theme.palette.primary.light
          },
          '&.MuiInputBase-multiline': {
            padding: 1
          }
        },
        input: {
          fontWeight: 500,
          background: outlinedFilled ? 'white' : 'transparent',
          padding: '10.5px 12px',
          borderRadius: `${borderRadius}px`,
          '&.MuiInputBase-inputSizeSmall': {
            padding: '10px 14px',
            '&.MuiInputBase-inputAdornedStart': {
              paddingLeft: 0
            }
          }
        },
        inputAdornedStart: {
          paddingLeft: 4
        },
        notchedOutline: {
          borderRadius: `${borderRadius}px`
        }
      }
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          '&.Mui-disabled': {
            color:
              mode === 'dark' ? theme.palette.text.primary + 50 : theme.palette.grey[300]
          }
        },
        mark: {
          backgroundColor: theme.palette.background.paper,
          width: '4px'
        },
        valueLabel: {
          color:
            mode === 'dark' ? theme.palette.primary.main : theme.palette.primary.light
        }
      }
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          '& .MuiAutocomplete-inputRoot': {
            padding: '10.5px 12px',

            // text field padding

            '& .MuiAutocomplete-input': {
              padding: '0px'
            }
          },
          '& .MuiAutocomplete-tag': {
            background: theme.palette.secondary.lightest,
            borderRadius: 4,
            color: theme.palette.text.dark,
            '.MuiChip-deleteIcon': {
              color: theme.palette.secondary.main
            }
          }
        },
        popper: {
          borderRadius: `${borderRadius}px`,
          boxShadow:
            '0px 8px 10px -5px rgb(0 0 0 / 20%), 0px 16px 24px 2px rgb(0 0 0 / 14%), 0px 6px 30px 5px rgb(0 0 0 / 12%)'
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: theme.palette.divider,
          opacity: mode === 'dark' ? 0.2 : 1
        }
      }
    },
    MuiTablePagination: {
      styleOverrides: {
        toolbar: {
          padding: '0'
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          '&:focus': {
            backgroundColor: 'transparent'
          }
        }
      }
    },

    MuiChip: {
      styleOverrides: {
        root: {
          '&.MuiChip-deletable .MuiChip-deleteIcon': {
            color: 'inherit'
          }
        }
      }
    },
    MuiTimelineContent: {
      styleOverrides: {
        root: {
          color: theme.palette.text.dark,
          fontSize: '16px'
        }
      }
    },
    MuiTreeItem: {
      styleOverrides: {
        label: {
          marginTop: 14,
          marginBottom: 14
        }
      }
    },
    MuiTimelineDot: {
      styleOverrides: {
        root: {
          boxShadow: 'none'
        }
      }
    },
    MuiInternalDateTimePickerTabs: {
      styleOverrides: {
        tabs: {
          backgroundColor: theme.palette.primary.light,
          '& .MuiTabs-flexContainer': {
            borderColor: theme.palette.primary.main
          },
          '& .MuiTab-root': {
            color:
              mode === 'dark' ? theme.palette.text.secondary : theme.palette.grey[900]
          },
          '& .MuiTabs-indicator': {
            backgroundColor: theme.palette.primary.dark
          },
          '& .Mui-selected': {
            color: theme.palette.primary.dark
          }
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        flexContainer: {
          borderBottom: '1px solid',
          borderColor:
            mode === 'dark' ? theme.palette.text.primary + 20 : theme.palette.grey[200]
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          padding: '12px 0 12px 0'
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor:
            mode === 'dark' ? theme.palette.text.primary + 15 : theme.palette.grey[200],
          '&.MuiTableCell-head': {
            fontSize: '0.875rem',
            color: theme.palette.grey[600],
            fontWeight: 500
          }
        }
      }
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          color: theme.palette.background.paper,
          background: theme.palette.text.primary
        }
      }
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem'
        }
      }
    }
  };
}
