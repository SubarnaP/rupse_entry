import { useState, useEffect } from 'react';
import { TextField, Button, Paper, Typography, Box, InputAdornment, Chip } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import ListAltIcon from '@mui/icons-material/ListAlt';
import LoginIcon from '@mui/icons-material/Login';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const Add = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    qrid: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Extract QRID from URL (the last part of the path)
  useEffect(() => {
    const urlParts = window.location.pathname.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    
    console.log('URL pathname:', window.location.pathname);
    console.log('URL parts:', urlParts);
    console.log('Last part:', lastPart);
    
    // Check if lastPart exists and is not 'add'
    if (lastPart && lastPart !== 'add' && lastPart.trim() !== '') {
      console.log('Setting QRID to:', lastPart);
      setFormData((prev) => ({ ...prev, qrid: lastPart }));
    } else {
      console.log('QRID not set - last part is:', lastPart);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // ✅ Prepare data with QRID as number if it exists
    const dataToSend = {
      name: formData.name,
      mobile: formData.mobile,
      qrid: formData.qrid ? parseInt(formData.qrid, 10) : null
    };
    
    // ✅ Debug: Log the form data before sending
    console.log('Form data being sent:', dataToSend);
    console.log('QRID value:', dataToSend.qrid);
    console.log('QRID type:', typeof dataToSend.qrid);
    
    try {
      const response = await fetch(
        'https://rupse_crm_backend.poudelanish17.com.np/api/unprotected/v1/forms/insert',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataToSend), 
        }
      );

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Success response:', data);
        setFormData({ name: '', mobile: '', qrid: formData.qrid });
        alert('Submitted successfully!');
      } else {
        // ✅ Get detailed error information
        const errorText = await response.text();
        console.error('Error response status:', response.status);
        console.error('Error response body:', errorText);
        
        let errorMessage = 'Failed to submit. ';
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage += errorJson.message || errorJson.error || 'Please try again.';
        } catch {
          errorMessage += `Server error: ${response.status}`;
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Network or other error:', error);
      alert('Error submitting form: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const styles = {
    pageContainer: {
      minHeight: '100vh',
      minWidth: '100vw',
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: '20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      overflow: 'auto',
      boxSizing: 'border-box'
    },
    backgroundDecoration: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.1,
      background: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 80%, white 1px, transparent 1px)',
      backgroundSize: '50px 50px',
      pointerEvents: 'none'
    },
    formPaper: {
      padding: { xs: '2rem', sm: '2.5rem', md: '3rem' },
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(10px)',
      maxWidth: '500px',
      width: '100%',
      position: 'relative',
      zIndex: 1,
      border: '1px solid rgba(255, 255, 255, 0.3)'
    },
    formHeader: {
      textAlign: 'center',
      marginBottom: '2rem'
    },
    iconContainer: {
      width: '70px',
      height: '70px',
      margin: '0 auto 1rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderRadius: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)'
    },
    formTitle: {
      fontWeight: '800',
      fontSize: { xs: '1.75rem', sm: '2rem' },
      color: '#1f2937',
      marginBottom: '0.5rem',
      letterSpacing: '-0.5px'
    },
    formSubtitle: {
      color: '#6b7280',
      fontSize: '0.95rem',
      fontWeight: '400'
    },
    textField: {
      marginBottom: '1.5rem',
      '& .MuiOutlinedInput-root': {
        borderRadius: '12px',
        backgroundColor: '#f9fafb',
        transition: 'all 0.3s ease',
        '& fieldset': {
          borderColor: '#e5e7eb',
          borderWidth: '2px'
        },
        '&:hover fieldset': {
          borderColor: '#667eea',
        },
        '&.Mui-focused': {
          backgroundColor: '#ffffff',
          '& fieldset': {
            borderColor: '#667eea',
            borderWidth: '2px'
          }
        }
      },
      '& .MuiInputLabel-root': {
        color: '#6b7280',
        fontWeight: '500'
      },
      '& .MuiInputLabel-root.Mui-focused': {
        color: '#667eea',
        fontWeight: '600'
      },
      '& .MuiOutlinedInput-input': {
        padding: '16px 14px',
        fontSize: '1rem'
      }
    },
    submitButton: {
      marginTop: '1rem',
      padding: '14px',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: '#ffffff',
      fontSize: '1.05rem',
      fontWeight: '700',
      textTransform: 'none',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: 'linear-gradient(135deg, #5568d3 0%, #6a3f8f 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(102, 126, 234, 0.5)',
      },
      '&:disabled': {
        background: '#9ca3af',
        color: '#ffffff',
        opacity: 0.7
      }
    },
    headerButtons: {
      position: 'absolute',
      top: { xs: '15px', sm: '25px' },
      right: { xs: '15px', sm: '25px' },
      display: 'flex',
      gap: '0.75rem',
      zIndex: 2,
      flexWrap: 'wrap',
      justifyContent: 'flex-end'
    },
    navButton: {
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      color: '#667eea',
      fontWeight: '600',
      textTransform: 'none',
      borderRadius: '10px',
      padding: '8px 16px',
      fontSize: '0.9rem',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      textDecoration: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      transition: 'all 0.3s ease',
      border: '1px solid rgba(255, 255, 255, 0.3)',
      '&:hover': {
        background: '#ffffff',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
      }
    },
    qrChip: {
      marginTop: '1rem',
      display: 'flex',
      justifyContent: 'center'
    }
  };

  return (
    <Box sx={styles.pageContainer}>
      <Box sx={styles.backgroundDecoration} />
      
      <Box sx={styles.headerButtons}>
        <Link to="/entry-details" style={{ textDecoration: 'none' }}>
          <Box sx={styles.navButton}>
            <ListAltIcon sx={{ fontSize: '1.1rem' }} />
            Entry List
          </Box>
        </Link>
        <Link to="/login" style={{ textDecoration: 'none' }}>
          <Box sx={styles.navButton}>
            <LoginIcon sx={{ fontSize: '1.1rem' }} />
            Login
          </Box>
        </Link>
      </Box>

      <Paper component="main" elevation={0} sx={styles.formPaper}>
        <Box sx={styles.formHeader}>
          <Box sx={styles.iconContainer}>
            <AddCircleOutlineIcon sx={{ fontSize: '2.5rem', color: '#ffffff' }} />
          </Box>
          <Typography variant="h4" component="h1" sx={styles.formTitle}>
            Add New Contact
          </Typography>
          <Typography sx={styles.formSubtitle}>
            Fill in the details to create a new entry
          </Typography>
        </Box>

        <form onSubmit={handleSubmit} noValidate>
          <TextField
            fullWidth
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            sx={styles.textField}
            required
            placeholder="Enter full name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon sx={{ color: '#667eea' }} />
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
            placeholder="Enter phone number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneAndroidIcon sx={{ color: '#667eea' }} />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="contained"
            type="submit"
            sx={styles.submitButton}
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Entry'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default Add;
       
