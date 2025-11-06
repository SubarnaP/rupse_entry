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
  const [groupedEntries, setGroupedEntries] = useState({});
  const [urlQRID, setUrlQRID] = useState(null); // ✅ Store QRID from URL

  // ✅ Extract QRID from URL (same logic as add.jsx)
  useEffect(() => {
    const urlParts = window.location.pathname.split('/');
    const lastPart = urlParts[urlParts.length - 1];
    
    console.log('Entry Details - URL pathname:', window.location.pathname);
    console.log('Entry Details - Last part:', lastPart);
    
    // Check if lastPart exists and is not 'entry-details'
    if (lastPart && lastPart !== 'entry-details' && lastPart.trim() !== '') {
      console.log('Entry Details - Setting QRID filter to:', lastPart);
      setUrlQRID(lastPart);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, []);

  // ✅ Group entries by QRID whenever entries or search changes
  useEffect(() => {
    let filtered = entries.filter(
      (entry) =>
        entry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.mobile.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // ✅ If QRID is in URL, filter entries to show only that QRID
    if (urlQRID) {
      const qridNumber = urlQRID; // Keep as string to match backend format
      filtered = filtered.filter(entry => entry.qr === qridNumber || entry.qr === parseInt(qridNumber, 10));
      console.log(`Filtering entries for QR ID: ${qridNumber}`, filtered);
    }
    
    setFilteredEntries(filtered);
    
    // Group filtered entries by QR ID (from backend it's 'qr' field, not 'qrid')
    const grouped = filtered.reduce((acc, entry) => {
      const qrId = entry.qr || 'No QR ID';
      if (!acc[qrId]) {
        acc[qrId] = [];
      }
      acc[qrId].push(entry);
      return acc;
    }, {});
    
    // ✅ Sort each QR ID group by name
    Object.keys(grouped).forEach(qrId => {
      grouped[qrId].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    setGroupedEntries(grouped);
  }, [searchQuery, entries, urlQRID]);

  // ✅ Function to generate consistent colors for each QRID
  const getQRIDColor = (qrid) => {
    const colors = [
      { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', badge: '#667eea', light: 'rgba(102, 126, 234, 0.1)' },
      { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', badge: '#f093fb', light: 'rgba(240, 147, 251, 0.1)' },
      { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', badge: '#4facfe', light: 'rgba(79, 172, 254, 0.1)' },
      { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', badge: '#43e97b', light: 'rgba(67, 233, 123, 0.1)' },
      { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', badge: '#fa709a', light: 'rgba(250, 112, 154, 0.1)' },
      { bg: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', badge: '#30cfd0', light: 'rgba(48, 207, 208, 0.1)' },
      { bg: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', badge: '#a8edea', light: 'rgba(168, 237, 234, 0.1)' },
      { bg: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', badge: '#ff9a9e', light: 'rgba(255, 154, 158, 0.1)' },
      { bg: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', badge: '#fcb69f', light: 'rgba(252, 182, 159, 0.1)' },
      { bg: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)', badge: '#ff6e7f', light: 'rgba(255, 110, 127, 0.1)' },
    ];
    
    // Use QRID to consistently pick a color
    const index = typeof qrid === 'string' && qrid !== 'No QR ID' 
      ? parseInt(qrid) % colors.length 
      : Math.abs(qrid?.toString().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) || 0) % colors.length;
    
    return colors[index];
  };

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
    qrSection: {
      marginBottom: '40px'
    },
    qrSectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      marginBottom: '20px',
      padding: '16px 24px',
      borderRadius: '16px',
      backdropFilter: 'blur(10px)',
      border: '2px solid rgba(255, 255, 255, 0.3)',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
    },
    qrBadge: {
      padding: '12px 24px',
      borderRadius: '12px',
      fontWeight: '800',
      fontSize: '18px',
      color: '#ffffff',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    qrCount: {
      color: '#ffffff',
      fontSize: '16px',
      fontWeight: '600',
      background: 'rgba(255, 255, 255, 0.2)',
      padding: '8px 16px',
      borderRadius: '8px',
      backdropFilter: 'blur(5px)'
    },
    entryCard: {
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(10px)',
      borderRadius: '20px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      border: '1px solid rgba(255, 255, 255, 0.8)',
      position: 'relative',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 12px 40px rgba(102, 126, 234, 0.25)',
      }
    },
    qrColorBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '6px',
      zIndex: 1
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
          <>
            {Object.entries(groupedEntries)
              .sort(([qridA], [qridB]) => {
                // ✅ Sort QRIDs: 'No QR ID' goes last, numbers are sorted ascending
                if (qridA === 'No QR ID') return 1;
                if (qridB === 'No QR ID') return -1;
                return parseInt(qridA) - parseInt(qridB);
              })
              .map(([qrid, qrEntries]) => {
              const colorScheme = getQRIDColor(qrid);
              return (
                <Box key={qrid} sx={styles.qrSection}>
                  {/* QRID Section Header */}
                  <Box sx={{ ...styles.qrSectionHeader, background: colorScheme.light }}>
                    <Box sx={{ ...styles.qrBadge, background: colorScheme.bg }}>
                      🎯 QR ID: {qrid}
                    </Box>
                    <Box sx={styles.qrCount}>
                      {qrEntries.length} {qrEntries.length === 1 ? 'entry' : 'entries'}
                    </Box>
                  </Box>

                  {/* Grid of Cards for this QRID */}
                  <Box sx={styles.gridContainer}>
                    {qrEntries.map((entry, index) => (
                      <Card key={index} sx={styles.entryCard}>
                        {/* Color bar at top of card */}
                        <Box sx={{ ...styles.qrColorBar, background: colorScheme.bg }} />
                        
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
                          {entry.qr && (
                            <Box sx={{ ...styles.infoRow, borderBottom: 'none' }}>
                              <Typography sx={styles.infoLabel}>QR ID</Typography>
                              <Chip 
                                label={entry.qr} 
                                size="small"
                                sx={{ 
                                  background: colorScheme.bg,
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
                </Box>
              );
            })}
          </>
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
