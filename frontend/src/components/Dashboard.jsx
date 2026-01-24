/**
 * Dashboard Component
 * My Drafts Library - Shows user's saved documents
 * Matches the design from dash.html using plain CSS
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useLoading } from '../context/LoadingContext';
import { Loading } from './loading';
import '../styles/dashboard.css';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, isLoaded, isSignedIn } = useUser();
    const { signOut } = useClerk();
    const { showLoader, hideLoader } = useLoading();

    // State for active tab
    const [activeTab, setActiveTab] = useState('all');
    
    // State for search
    const [searchQuery, setSearchQuery] = useState('');

    // Sample drafts data (will be replaced with actual data from backend)
    const [drafts, setDrafts] = useState([
        {
            id: 1,
            title: 'The Silent Echo',
            preview: 'The wind howled through the canyon, carrying secrets buried...',
            editedAt: '2h ago',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcazu51GARKGqEVBqCavSN5hMJabjr7tX10kRB0j7bCwYmLyxXaSB0Yu_DNADZB4pk4-PLU4VTCIhKCrfZ4rA6ztJIcpmUQfATIaBsJrQc5s2moNXWx0Lm86HRnqCIHAaQ99Czhmyj0IILHCJcuvbTp0yAAbJkneIieliakL994p3PA1X8jliP-lhzfQa1klmIBibbAtN966IEBCxePeTfS2IQQrpiJcfIrjDcTslXuMFbD6Pua_bSbuqOnKcaezidb9em6xqh35o-'
        },
        {
            id: 2,
            title: 'Midnight Protocol',
            preview: 'The neon glow of the city flickered like a broken heart...',
            editedAt: '5h ago',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD4da_3Kc_Y0X7J0iYj-px7YeHrV_w2z0xSxUf2z47rVzno50XrrjjnGs4ut6uoZMbLagMqETGEhQCXnnsMZwsEZdaqwJASBlFBvRBgz7PPAFDhOu3-P45LpokAPed_fXnOGQxwvq_urt9n-a-tWROHn5nxFwybK3ykCrUcc6SUS8wgJTpRYB7TxWnjXd3LR71pMw61NsWysoUAwndLDjOOJKUE414DDTcVCCggriyaKf4U_QQ38UOFOVROi6G980seXS3_c5djgI6q'
        },
        {
            id: 3,
            title: 'Whispering Pines',
            preview: 'The smell of damp earth and needles filled the morning air...',
            editedAt: '1d ago',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD384HGQCJZVFGGNgzDuhtdZXIPQpomd9SzSKcAoa6lIdMH1VCdPx7n51tJHUVuDV-zIy3IVPetE2kF1-7Gk_z3vSv9oRqHsu06UML0Js8e4ryMPy5eDYrx02HZgqoMFXLYZjFpsl9BKoVAT20rEhOirtrY05_a2fkNFU-A7IYHWnEcWPe5BvG3hqh4Y_EtWzGAlmki_Vy7W1p2FGQaQQUPvzKFtkltD84t5KfTB5hKJz-EfHiu6BSGFs9EKGvQkgUdkwd8ZlWlmj8u'
        },
        // {
        //     id: 4,
        //     title: 'Digital Solace',
        //     preview: 'In the quiet hum of the server room, he found peace...',
        //     editedAt: '3d ago',
        //     image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_BLvxmA5lM9jQtglZnpE8kFWyOEt6Xj1Kb5zVZ-g-hKUrkACxuFRNphQr7UwtGpqVJjD-KgGn1CogHvQkDvRT9FzDPhWHE6Ixcn9w8fYcQPnf6YJsJMpxJ8VsXDlhyQuf9iv3eVv4o3pbVBl8KP4URXyTHBgknTuB-13zAzkGJUQAb7HTkEizfuylBMRMap3Zhoi3Rh-2cLZL9QFEzjmJJ8WPqHHSrolhsxRft0Bny9GCDefXM8JLaSkyY5g-5pAeGaTVGiFbDY1C'
        // },
        // {
        //     id: 5,
        //     title: 'Forgotten Memoirs',
        //     preview: 'It was 1924, and the world was just beginning to turn...',
        //     editedAt: '1w ago',
        //     image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpdCThJEXBO_ophW7UKuvp4O4YF6GPIXIpmoBir3EZ3wtqKhST29scYlSAkT5CGs7Jw9BAMhzN_7f820etufW_9vpP4BsW224Xf7ENQZVNW_GYMz7P3TxWSwjuuH8RlxeRz2Vv4wr54X3AsLlLOf6OtUMRdiO9MHI0QAje1nXT_YLc-9XSSLe3qy0QKxRZ8Vs9S9LJNKPwbG2kXeMAIfmt2RuHC58Mx1wlYPoI52IodBYEEtoj0rEMwZWDsZnEyb8edGUeSRp-78A8'
        // }
    ]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (isLoaded && !isSignedIn) {
            navigate('/login');
        }
    }, [isLoaded, isSignedIn, navigate]);

    // Handle sign out
    const handleSignOut = async () => {
        showLoader('Signing out...');
        await signOut();
        hideLoader();
        navigate('/');
    };

    // Handle new document creation
    const handleNewDocument = () => {
        // TODO: Navigate to editor or create new document
        console.log('Create new document');
    };

    // Show loading state
    if (!isLoaded) {
        return <Loading fullScreen={true} message="Loading your drafts..." />;
    }

    if (!isSignedIn) {
        return null;
    }

    return (
        <div className="dashboard">
            {/* Top Navigation Bar */}
            <header className="dashboard-header">
                <div className="header-content">
                    {/* <button className="icon-btn menu-btn">
                        <span className="material-icon">☰</span>
                    </button> */}
                    <h1 className="header-title">My Drafts</h1>
                    <button className="icon-btn profile-btn" onClick={handleSignOut}>
                        <img 
                            src={user?.imageUrl || '/default-avatar.png'} 
                            alt="Profile" 
                            className="profile-avatar"
                        />
                    </button>
                </div>
            </header>

            <main className="dashboard-main">
                {/* Search Bar */}
                <div className="search-container">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search your stories..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="tabs-container">
                    <div className="tabs">
                        <button 
                            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveTab('all')}
                        >
                            All Drafts
                        </button>
                        <button 
                            className={`tab ${activeTab === 'recent' ? 'active' : ''}`}
                            onClick={() => setActiveTab('recent')}
                        >
                            Recent
                        </button>
                        <button 
                            className={`tab ${activeTab === 'favorites' ? 'active' : ''}`}
                            onClick={() => setActiveTab('favorites')}
                        >
                            Favorites
                        </button>
                        <button 
                            className={`tab ${activeTab === 'archive' ? 'active' : ''}`}
                            onClick={() => setActiveTab('archive')}
                        >
                            Archive
                        </button>
                    </div>
                </div>

                {/* Document Grid */}
                <div className="drafts-grid">
                    {/* New Document Button */}
                    <div className="new-doc-card" onClick={handleNewDocument}>
                        <div className="new-doc-icon">
                            <span>+</span>
                        </div>
                        <p className="new-doc-text">New Document</p>
                    </div>

                    {/* Draft Cards */}
                    {drafts.map((draft) => (
                        <div key={draft.id} className="draft-card">
                            <div 
                                className="draft-image"
                                style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.1), rgba(0,0,0,0.4)), url("${draft.image}")` }}
                            >
                                <button className="draft-menu-btn">⋮</button>
                            </div>
                            <div className="draft-info">
                                <h3 className="draft-title">{draft.title}</h3>
                                <p className="draft-preview">{draft.preview}</p>
                                <p className="draft-time">Edited {draft.editedAt}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="bottom-nav">
                <button className="nav-item active">
                    <span className="nav-icon">📄</span>
                    <span className="nav-label">Library</span>
                </button>
                <button className="nav-item">
                    <span className="nav-icon">✏️</span>
                    <span className="nav-label">Writing Lab</span>
                </button>
                {/* <button className="nav-item">
                    <span className="nav-icon">✨</span>
                    <span className="nav-label">AI Assistant</span>
                </button> */}
                <button className="nav-item" onClick={handleSignOut}>
                    <span className="nav-icon">⚙️</span>
                    <span className="nav-label">Settings</span>
                </button>
            </nav>

            {/* Floating Action Button */}
            <button className="fab" onClick={handleNewDocument}>
                <span>+</span>
            </button>
        </div>
    );
};

export default Dashboard;
