import { useState, useEffect } from 'react';
import { TextField, Button, Paper, Typography, Box, InputAdornment } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';

const Add = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    qrid: '' // ✅ will be auto-filled from URL
  });

  // ✅ Extract QRID from URL (the last part of the path)
  useEffect(() => {
    const urlParts = window.location.pathname.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    if (!isNaN(lastPart)) {
      setFormData((prev) => ({ ...prev, qrid: lastPart }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        'https://rupse_crm_backend.poudelanish17.com.np/api/unprotected/v1/forms/insert',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData), // ✅ sends { name, mobile, qrid }
        }
      );

      if (response.ok) {
        setFormData({ name: '', mobile: '', qrid: formData.qrid });
        alert('Submitted successfully!');
      } else {
        alert('Failed to submit. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error submitting form.');
    }
  };

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      background: '#f9fafb',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: { xs: 'flex-start', sm: 'center' },
      padding: { xs: '1rem', sm: '1.5rem', md: '2rem' },
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    formPaper: {
      padding: { xs: '1.5rem', sm: '2rem', md: '3rem' }, // Increased padding for larger screens
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      background: '#ffffff',
      maxWidth: { sm: '540px', md: '600px'},
      width: '100%',
      marginTop: { xs: '2rem', sm: '0' }
    },
    formTitle: {
      marginBottom: { xs: '1.5rem', sm: '2rem' },
      fontWeight: '800',
      fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }, // Adjusted font size for desktop
      color: '#1f2937',
      textAlign: 'center',
    },
    textField: {
      marginBottom: { xs: '1rem', sm: '1.5rem' },
      '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: '#2563eb',
          boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.1)',
        }
      },
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#d1d5db'
      },
      '& .MuiInputLabel-root': {
        color: '#6c757d',
      },
      '& .MuiInputLabel-root.Mui-focused': {
        color: '#2563eb'
      }
    },
    submitButton: {
      marginTop: '16px',
      padding: { xs: '10px', sm: '12px' },
      borderRadius: '8px',
      background: '#2563eb',
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: '600',
      textTransform: 'none',
      '&:hover': {
        background: '#1d4ed8',
      }
    },
    headerButtons: {
      position: 'absolute',
      top: '20px',
      right: { xs: '1rem', sm: '1.5rem', md: '2rem' },
      display: 'flex',
      gap: '1rem'
    },
    linkButton: {
      color: '#1f2937',
      fontWeight: '600',
      textTransform: 'none',
      textDecoration: 'none'
    }
  };

  return (
    <Box sx={styles.pageContainer}>
      <Box sx={styles.headerButtons}>
        <Link to="/entry-details" style={styles.linkButton}>
          Entry List
        </Link>
        <Link to="/login" style={styles.linkButton}>
          Login
        </Link>
      </Box>
      <Paper component="main" elevation={0} sx={styles.formPaper}>
        <Typography variant="h5" component="h1" sx={styles.formTitle}>
          Add Contact
        </Typography>
        <form onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            sx={styles.textField}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            fullWidth
            label="Phone Number"
            name="mobile"
            type="tel"
            value={formData.mobile}
            onChange={handleInputChange}
            sx={styles.textField}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneAndroidIcon />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            type="submit"
            sx={styles.submitButton}
            fullWidth
          >
            Submit
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Add;
       
