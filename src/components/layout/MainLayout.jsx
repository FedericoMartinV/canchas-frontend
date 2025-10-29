import React from 'react';
import Header from '../shared/Header';
import Footer from '../shared/Footer';

export default function MainLayout({ user, logout, children, title, subtitle }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        user={user} 
        logout={logout} 
        title={title}
        subtitle={subtitle}
      />

      <main className="container mx-auto px-4 py-8 flex-grow">
        {children}
      </main>

      <Footer />
    </div>
  );
}