import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CameraCapture from './components/CameraCapture';
import DocumentUpload from './components/DocumentUpload';
import VerificationResults from './components/VerificationResults';
import BackendStatus from './components/BackendStatus';
import { verifyIdentity, checkBackendHealth } from './utils/apiClient';

interface VerificationData {
  age: number;
  faceMatchScore: number;
  isAgeValid: boolean;
  isFaceMatched: boolean;
  isVerified: boolean;
  extractedDOB: string;
}

function App() {
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [aadharImage, setAadharImage] = useState<string | null>(null);
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check backend connection on mount
    checkBackendConnection();
  }, []);

  useEffect(() => {
    // Trigger verification when both images are available and backend is connected
    if (selfieImage && aadharImage && backendConnected) {
      performVerification();
    }
  }, [selfieImage, aadharImage, backendConnected]);

  const checkBackendConnection = async () => {
    const isConnected = await checkBackendHealth();
    setBackendConnected(isConnected);
  };

  const handleSelfieCapture = (imageData: string) => {
    setSelfieImage(imageData);
    setError(null);
  };

  const handleAadharUpload = (file: File, preview: string) => {
    setAadharFile(file);
    setAadharImage(preview);
    setError(null);
  };

  const handleAadharClear = () => {
    setAadharFile(null);
    setAadharImage(null);
    setVerificationData(null);
    setError(null);
  };

  const performVerification = async () => {
    if (!selfieImage || !aadharImage) return;

    setIsProcessing(true);
    setVerificationData(null);
    setError(null);

    try {
      console.log('🔄 Starting verification process...');
      
      const result = await verifyIdentity(selfieImage, aadharImage);
      
      const verificationResult: VerificationData = {
        age: result.age,
        faceMatchScore: result.face_match_score,
        isAgeValid: result.age_valid,
        isFaceMatched: result.face_matched,
        isVerified: result.verification_passed,
        extractedDOB: result.extracted_dob
      };

      setVerificationData(verificationResult);
      console.log('✅ Verification completed:', verificationResult);
      
    } catch (error) {
      console.error('❌ Verification failed:', error);
      setError(error instanceof Error ? error.message : 'Verification failed');
      
      // Set failed verification data
      setVerificationData({
        age: 0,
        faceMatchScore: 0,
        isAgeValid: false,
        isFaceMatched: false,
        isVerified: false,
        extractedDOB: 'Not detected'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        {/* Backend Status */}
        <BackendStatus 
          isConnected={backendConnected} 
          onRetry={checkBackendConnection}
        />

        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 font-medium">Error: {error}</div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CameraCapture 
            onCapture={handleSelfieCapture}
            capturedImage={selfieImage}
          />
          
          <DocumentUpload 
            onUpload={handleAadharUpload}
            uploadedImage={aadharImage}
            onClear={handleAadharClear}
          />
        </div>

        <VerificationResults 
          data={verificationData}
          isProcessing={isProcessing}
        />

        {/* How It Works Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">How The System Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Document Upload</h3>
              <p className="text-sm text-gray-600">Upload your Aadhar card image containing your photo and date of birth</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">OCR Processing</h3>
              <p className="text-sm text-gray-600">Backend extracts date of birth using optical character recognition</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Face Detection</h3>
              <p className="text-sm text-gray-600">AI compares facial features between document and live selfie</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">Verification</h3>
              <p className="text-sm text-gray-600">Final decision based on age requirement and face match confidence</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;