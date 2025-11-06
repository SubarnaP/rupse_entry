import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, Typography, Box, Chip, Divider, Skeleton } from "@mui/material";
import { useAuthGuard } from "../login/auth.jsx"; // ✅ Import authentication guard
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import LogoutIcon from '@mui/icons-material/Logout';

const EntryDetails = () => {
  const navigate = useNavigate();
  useAuthGuard(); // ✅ Protect this page

  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  useEffect(() => {
    const filtered = entries.filter(
      (entry) =>
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.mobile.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEntries(filtered);
  }, [searchQuery, entries]);

  const fetchEntries = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Add token validation
      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        navigate('/login');
        return;
      }

      console.log("Fetching entries with token:", token);

      const response = await axios.post(
        "https://rupse_crm_backend.poudelanish17.com.np/api/protected/v1/forms/read",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      console.log("API Response:", response);

      if (response.data) {
        setEntries(response.data);
        setFilteredEntries(response.data);
        console.log("Entries loaded:", response.data);
      } else {
        setError("No data received from server");
      }
      setLoading(false);
    } catch (err) {
      console.error("Detailed error:", err);
      
      if (err.response) {
        // Server responded with error
        console.log("Error response:", err.response);
        if (err.response.status === 401) {
          localStorage.removeItem("token");
          navigate('/login');
          setError("Session expired. Please login again.");
        } else {
          setError(`Server error: ${err.response.data.message || 'Unknown error'}`);
        }
      } else if (err.request) {
        // Request made but no response
        setError("Could not connect to server. Please check your internet connection.");
      } else {
        setError("An unexpected error occurred.");
      }
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate('/login');
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: { xs: '20px', sm: '30px', md: '40px' },
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    },
    backgroundPattern: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.05,
      background: 'radial-gradient(circle at 20% 50%, white 2px, transparent 2px), radial-gradient(circle at 80% 80%, white 2px, transparent 2px)',
      backgroundSize: '60px 60px',
      pointerEvents: 'none'
    },
    topBar: {
      maxWidth: '1400px',
      margin: '0 auto 30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '15px',
      position: 'relative',
      zIndex: 1
    },
    headerSection: {
      flex: '1',
      minWidth: '250px'
    },
    title: {
      fontSize: { xs: '28px', sm: '36px', md: '42px' },
      fontWeight: '800',
      color: '#ffffff',
      marginBottom: '8px',
      letterSpacing: '-1px',
      textShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    subtitle: {
      color: 'rgba(255, 255, 255, 0.95)',
      fontSize: { xs: '14px', sm: '16px' },
      fontWeight: '500',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    actionButtons: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap'
    },
    button: {
      background: 'rgba(255, 255, 255, 0.95)',
      color: '#667eea',
      padding: { xs: '10px 16px', sm: '12px 24px' },
      borderRadius: '12px',
      fontSize: { xs: '14px', sm: '15px' },
      fontWeight: '700',
      textTransform: 'none',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      '&:hover': {
        background: '#ffffff',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.2)',
      }
    },
    logoutButton: {
      background: 'rgba(239, 68, 68, 0.15)',
      color: '#ffffff',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      '&:hover': {
        background: 'rgba(239, 68, 68, 0.25)',
        borderColor: 'rgba(255, 255, 255, 0.5)',
      }
    },
    searchSection: {
      maxWidth: '1400px',
      margin: '0 auto 40px',
      position: 'relative',
      zIndex: 1
    },
    searchBox: {
      position: 'relative',
      background: 'rgba(255, 255, 255, 0.98)',
      borderRadius: '16px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
      overflow: 'hidden',
      backdropFilter: 'blur(10px)'
    },
    searchInput: {
      width: '100%',
      padding: { xs: '16px 50px 16px 50px', sm: '18px 60px 18px 60px' },
      fontSize: { xs: '15px', sm: '16px' },
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontWeight: '500',
      color: '#1f2937',
      '&::placeholder': {
        color: '#9ca3af'
      }
    },
    searchIconContainer: {
      position: 'absolute',
      left: { xs: '16px', sm: '20px' },
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#667eea',
      display: 'flex',
      alignItems: 'center'
    },
    contentContainer: {
      maxWidth: '1400px',
      margin: '0 auto',
      position: 'relative',
      zIndex: 1
    },
    statsBar: {
      background: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '16px 24px',
      marginBottom: '30px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '12px',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    },
    statItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      color: '#ffffff'
    },
    statLabel: {
      fontSize: '14px',
      opacity: 0.9,
      fontWeight: '500'
    },
    statValue: {
      fontSize: '24px',
      fontWeight: '800'
    },
    gridContainer: {
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(auto-fill, minmax(340px, 1fr))',
        md: 'repeat(auto-fill, minmax(360px, 1fr))'
      },
      gap: { xs: '16px', sm: '20px', md: '24px' },
      marginBottom: '40px'
    },
    entryCard: {
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 12px 40px rgba(102, 126, 234, 0.25)',
      }
    },
    cardHeader: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px 24px',
      position: 'relative'
    },
    cardContent: {
      padding: '24px'
    },
    cardTitle: {
      fontSize: '22px',
      fontWeight: '800',
      color: '#ffffff',
      marginBottom: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      textShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    infoRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 0',
      borderBottom: '1px solid #f3f4f6'
    },
    infoLabel: {
      fontSize: '13px',
      fontWeight: '600',
      color: '#9ca3af',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      minWidth: '80px'
    },
    infoValue: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#1f2937',
      flex: 1
    },
    emptyState: {
      textAlign: 'center',
      padding: { xs: '40px 20px', sm: '60px 40px' },
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '20px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
      backdropFilter: 'blur(10px)'
    },
    emptyIcon: {
      fontSize: { xs: '60px', sm: '80px' },
      marginBottom: '20px',
      opacity: 0.5
    },
    emptyTitle: {
      fontSize: { xs: '20px', sm: '24px' },
      fontWeight: '700',
      color: '#374151',
      marginBottom: '12px'
    },
    emptyText: {
      fontSize: { xs: '15px', sm: '16px' },
      color: '#6b7280',
      lineHeight: '1.6'
    },
    loadingContainer: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      gap: '20px'
    },
    loadingText: {
      color: '#ffffff',
      fontSize: { xs: '16px', sm: '18px' },
      fontWeight: '600'
    },
    errorContainer: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    },
    errorBox: {
      background: 'rgba(239, 68, 68, 0.15)',
      backdropFilter: 'blur(10px)',
      padding: { xs: '24px', sm: '32px' },
      borderRadius: '20px',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      maxWidth: '500px',
      textAlign: 'center'
    },
    errorIcon: {
      fontSize: { xs: '48px', sm: '64px' },
      marginBottom: '16px'
    },
    errorText: {
      color: '#ffffff',
      fontSize: { xs: '16px', sm: '18px' },
      fontWeight: '600',
      lineHeight: '1.6'
    }
  };

  if (loading) {
    return (
      <Box sx={styles.loadingContainer}>
        <Box sx={{ 
          width: '60px', 
          height: '60px', 
          border: '6px solid rgba(255, 255, 255, 0.3)',
          borderTop: '6px solid #ffffff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <Typography sx={styles.loadingText}>Loading entries...</Typography>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Box>
    );
  }
 
  if (error) {
    return (
      <Box sx={styles.errorContainer}>
        <Box sx={styles.errorBox}>
          <Box sx={styles.errorIcon}>⚠️</Box>
          <Typography sx={styles.errorText}>{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={styles.container}>
      <Box sx={styles.backgroundPattern} />
      
      {/* Top Bar */}
      <Box sx={styles.topBar}>
        <Box sx={styles.headerSection}>
          <Typography sx={styles.title}>
            📋 Entry Directory
          </Typography>
          <Box sx={styles.subtitle}>
            <Chip 
              label={`${filteredEntries.length} ${filteredEntries.length === 1 ? 'entry' : 'entries'}`}
              size="small"
              sx={{ 
                background: 'rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '14px'
              }}
            />
          </Box>
        </Box>
        <Box sx={styles.actionButtons}>
          <Button
            variant="contained"
            sx={styles.button}
            onClick={() => navigate('/add')}
          >
            <AddCircleOutlineIcon />
            New Entry
          </Button>
          <Button
            variant="outlined"
            sx={[styles.button, styles.logoutButton]}
            onClick={handleLogout}
          >
            <LogoutIcon />
            Logout
          </Button>
        </Box>
      </Box>

      {/* Search Section */}
      <Box sx={styles.searchSection}>
        <Box sx={styles.searchBox}>
          <Box sx={styles.searchIconContainer}>
            <SearchIcon sx={{ fontSize: { xs: '20px', sm: '24px' } }} />
          </Box>
          <input
            type="text"
            placeholder="Search by name or mobile number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: window.innerWidth < 600 ? '16px 50px' : '18px 60px',
              fontSize: window.innerWidth < 600 ? '15px' : '16px',
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontWeight: '500',
              color: '#1f2937'
            }}
          />
        </Box>
      </Box>

      {/* Content */}
      <Box sx={styles.contentContainer}>
        {filteredEntries.length > 0 ? (
          <Box sx={styles.gridContainer}>
            {filteredEntries.map((entry, index) => (
              <Card key={index} sx={styles.entryCard}>
                <Box sx={styles.cardHeader}>
                  <Typography sx={styles.cardTitle}>
                    <PersonIcon sx={{ fontSize: '24px' }} />
                    {entry.name}
                  </Typography>
                </Box>
                <CardContent sx={styles.cardContent}>
                  <Box sx={styles.infoRow}>
                    <PhoneIcon sx={{ color: '#667eea', fontSize: '20px' }} />
                    <Box>
                      <Typography sx={styles.infoLabel}>Phone</Typography>
                      <Typography sx={styles.infoValue}>{entry.mobile}</Typography>
                    </Box>
                  </Box>
                  {entry.qrid && (
                    <Box sx={{ ...styles.infoRow, borderBottom: 'none' }}>
                      <Typography sx={styles.infoLabel}>QR ID</Typography>
                      <Chip 
                        label={entry.qrid} 
                        size="small"
                        sx={{ 
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: '#ffffff',
                          fontWeight: '700'
                        }}
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : (
          <Box sx={styles.emptyState}>
            <Box sx={styles.emptyIcon}>🔍</Box>
            <Typography sx={styles.emptyTitle}>
              No Entries Found
            </Typography>
            <Typography sx={styles.emptyText}>
              {searchQuery 
                ? `No results matching "${searchQuery}". Try a different search term.`
                : "No entries available. Create your first entry to get started!"}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default EntryDetails;
