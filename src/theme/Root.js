import React from 'react';
import UserMenu from '../components/auth/UserMenu';
import ChatbotWidget from '../components/ChatbotWidget';

export default function Root({ children }) {
  return (
    <>
      {children}
      <ChatbotWidget />
      {/* Render UserMenu - it will position itself in navbar via CSS */}
      <div id="user-menu-portal">
        <UserMenu />
      </div>
    </>
  );
}
