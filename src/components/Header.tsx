import React from 'react';
import { Shield, CheckCircle } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6 shadow-lg">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-center space-x-3">
          <Shield className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Age & Identity Verification</h1>
        </div>
        <p className="text-center mt-2 text-blue-100">
          Secure verification using face recognition and document analysis
        </p>
      </div>
    </header>
  );
};

export default Header;