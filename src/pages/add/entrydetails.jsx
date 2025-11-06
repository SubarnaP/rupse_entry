import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { useAuthGuard } from "../login/auth.jsx"; // ✅ Import authentication guard

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

 
  if (error) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>{error}</p>
      </div>
    );
  }

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '40px 20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    },
    headerActions: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: '1200px',
      margin: '0 auto 30px'
    },
    header: {
      maxWidth: '1200px',
      margin: '0 auto 30px',
      textAlign: 'center'
    },
    title: {
      fontSize: '36px',
      fontWeight: '800',
      background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      marginBottom: '10px',
      letterSpacing: '-0.5px'
    },
    subtitle: {
      color: '#ffffff',
      fontSize: '16px',
      opacity: 0.9
    },
    searchContainer: {
      maxWidth: '1200px',
      margin: '0 auto 30px',
      position: 'relative'
    },
    searchInput: {
      width: '100%',
      padding: '16px 50px 16px 20px',
      fontSize: '16px',
      border: 'none',
      borderRadius: '16px',
      backgroundColor: '#ffffff',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
      outline: 'none',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box'
    },
    searchIcon: {
      position: 'absolute',
      right: '20px',
      top: '50%',
      transform: 'translateY(-50%)',
      fontSize: '20px',
      color: '#667eea',
      pointerEvents: 'none'
    },
    listContainer: {
      maxWidth: '1200px',
      margin: '0 auto'
    },
    entryList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '20px',
      marginBottom: '40px'
    },
    entryCard: {
      background: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden'
    },
    entryCardHover: {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 30px rgba(102, 126, 234, 0.3)'
    },
    cardGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    entryName: {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1a1a2e',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    nameIcon: {
      fontSize: '18px'
    },
    entryMobile: {
      fontSize: '16px',
      color: '#6c757d',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontWeight: '500'
    },
    mobileIcon: {
      fontSize: '16px'
    },
    noResults: {
      textAlign: 'center',
      padding: '60px 20px',
      background: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
    },
    noResultsText: {
      fontSize: '18px',
      color: '#6c757d',
      marginTop: '10px'
    },
    noResultsIcon: {
      fontSize: '48px',
      marginBottom: '10px'
    },
    loadingContainer: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    spinner: {
      width: '50px',
      height: '50px',
      border: '5px solid rgba(255, 255, 255, 0.3)',
      borderTop: '5px solid #ffffff',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    },
    loadingText: {
      color: '#ffffff',
      fontSize: '18px',
      marginTop: '20px',
      fontWeight: '500'
    },
    errorContainer: {
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    },
    errorText: {
      color: '#ffffff',
      fontSize: '18px',
      background: 'rgba(255, 255, 255, 0.1)',
      padding: '20px 40px',
      borderRadius: '12px',
      backdropFilter: 'blur(10px)'
    },
    createButton: {
      background: 'rgba(255, 255, 255, 0.2)',
      color: '#ffffff',
      padding: '10px 20px',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: '600',
      transition: 'all 0.3s ease',
      '&:hover': {
        background: 'rgba(255, 255, 255, 0.3)',
      }
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.headerActions}>
        <div style={styles.header}>
          <h1 style={styles.title}>Entry List</h1>
          <p style={styles.subtitle}>
            {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'} found
          </p>
        </div>
        <Button
          variant="contained"
          sx={styles.createButton}
          onClick={() => navigate('/add')}
        >
          Create New Entry
        </Button>
      </div>

      <div style={styles.searchContainer}>
        <input
          type="text"
          placeholder="Search by name or mobile number..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <span style={styles.searchIcon}>🔍</span>
      </div>

      <div style={styles.listContainer}>
        {filteredEntries.length > 0 ? (
          <div style={styles.entryList}>
            {filteredEntries.map((entry, index) => (
              <div
                key={index}
                style={styles.entryCard}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(102, 126, 234, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div style={styles.cardGradient}></div>
                <div style={styles.entryName}>
                  <span style={styles.nameIcon}>👤</span>
                  {entry.name}
                </div>
                <div style={styles.entryMobile}>
                  <span style={styles.mobileIcon}>📱</span>
                  {entry.mobile}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.noResults}>
            <div style={styles.noResultsIcon}>🔍</div>
            <p style={styles.noResultsText}>
              No entries found matching "{searchQuery}"
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default EntryDetails;
