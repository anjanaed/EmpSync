import React from 'react';

const UserProfile = ({ user }) => {
  return (
    <div className="user-profile">
      <div className="profile-header">
        <img
          src={user.profilePicture || '/default-profile.png'}
          alt="Profile"
          className="profile-picture"
        />
        <h2 className="user-name">{user.name}</h2>
      </div>
      <div className="profile-details">
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
        <p><strong>Address:</strong> {user.address || 'N/A'}</p>
      </div>
    </div>
  );
};

export default UserProfile;