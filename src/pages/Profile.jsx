import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Profile.css';


const AVATAR_OPTIONS = ['👤', '👨', '👩', '🧔', '👱', '🧑', '👨‍💼', '👩‍💼', '🦸', '🧙'];

export default function Profile({ showToast, onBack }) {
  const { user, logout, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '👤'
  });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const handleProfileChange = (e) => {
    setProfileForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      showToast('Name cannot be empty', 'error');
      return;
    }
    setProfileLoading(true);
    try {
      const res = await axios.put('/api/auth/profile', {
        name: profileForm.name,
        avatar: profileForm.avatar
      });
      if (res.data.success) {
        updateUser(res.data.data.user);
        showToast('Profile updated! ✅', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePassChange = (e) => {
    setPassForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setPassError('');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passForm.currentPassword || !passForm.newPassword || !passForm.confirm) {
      setPassError('Please fill in all fields');
      return;
    }
    if (passForm.newPassword.length < 6) {
      setPassError('New password must be at least 6 characters');
      return;
    }
    if (passForm.newPassword !== passForm.confirm) {
      setPassError('New passwords do not match');
      return;
    }
    setPassLoading(true);
    try {
      const res = await axios.put('/api/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      if (res.data.success) {
        showToast('Password changed successfully! 🔐', 'success');
        setPassForm({ currentPassword: '', newPassword: '', confirm: '' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to change password';
      setPassError(msg);
      showToast(msg, 'error');
    } finally {
      setPassLoading(false);
    }
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  return (
    <div className="profile-page">
      <div className="profile-header-bar">
        <button className="profile-back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>My Profile</h2>
        <button className="logout-btn" onClick={logout}>
          🚪 Logout
        </button>
      </div>

      <div className="profile-content">
        {/* User card */}
        <div className="profile-user-card">
          <div className="profile-avatar-display">
            {profileForm.avatar || '👤'}
          </div>
          <div className="profile-user-info">
            <h3>{user?.name}</h3>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-joined">Member since {joinedDate}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'info' ? 'active' : ''}`}
            onClick={() => setActiveTab('info')}
          >
            👤 Personal Info
          </button>
          <button
            className={`profile-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            🔐 Security
          </button>
        </div>

        {/* Info Tab */}
        {activeTab === 'info' && (
          <form className="profile-form" onSubmit={handleSaveProfile}>
            <div className="profile-field">
              <label htmlFor="profile-name">Display Name</label>
              <input
                id="profile-name"
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                placeholder="Your name"
                disabled={profileLoading}
              />
            </div>

            <div className="profile-field">
              <label htmlFor="profile-email-display">Email Address</label>
              <input
                id="profile-email-display"
                type="email"
                value={user?.email || ''}
                disabled
                className="profile-disabled-input"
              />
              <small>Email cannot be changed</small>
            </div>


            <div className="profile-field">
              <label>Choose Avatar</label>
              <div className="avatar-grid">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    className={`avatar-option ${profileForm.avatar === av ? 'selected' : ''}`}
                    onClick={() => setProfileForm((f) => ({ ...f, avatar: av }))}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="profile-save-btn" disabled={profileLoading}>
              {profileLoading ? (
                <><span className="spinner spinner-sm" /> Saving...</>
              ) : (
                '✅ Save Changes'
              )}
            </button>
          </form>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <form className="profile-form" onSubmit={handleChangePassword}>
            <div className="security-info-box">
              🔒 Change your password regularly to keep your account secure.
            </div>

            {passError && (
              <div className="auth-error">
                <span>❌</span> {passError}
              </div>
            )}

            <div className="profile-field">
              <label htmlFor="curr-pass">Current Password</label>
              <div className="auth-input-wrap">
                
                <input
                  id="curr-pass"
                  type={showPasswords ? 'text' : 'password'}
                  name="currentPassword"
                  value={passForm.currentPassword}
                  onChange={handlePassChange}
                  placeholder="Enter current password"
                  disabled={passLoading}
                />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="new-pass">New Password</label>
              <div className="auth-input-wrap">
      
                <input
                  id="new-pass"
                  type={showPasswords ? 'text' : 'password'}
                  name="newPassword"
                  value={passForm.newPassword}
                  onChange={handlePassChange}
                  placeholder="At least 6 characters"
                  disabled={passLoading}
                />
              </div>
            </div>

            <div className="profile-field">
              <label htmlFor="confirm-pass">Confirm New Password</label>
              <div className="auth-input-wrap">
                
                <input
                  id="confirm-pass"
                  type={showPasswords ? 'text' : 'password'}
                  name="confirm"
                  value={passForm.confirm}
                  onChange={handlePassChange}
                  placeholder="Re-enter new password"
                  disabled={passLoading}
                />
              </div>
            </div>

            <label className="show-pass-toggle">
              <input
                type="checkbox"
                checked={showPasswords}
                onChange={(e) => setShowPasswords(e.target.checked)}
              />
              Show passwords
            </label>

            <button type="submit" className="profile-save-btn" disabled={passLoading}>
              {passLoading ? (
                <><span className="spinner spinner-sm" /> Changing...</>
              ) : (
                '🔐 Change Password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
