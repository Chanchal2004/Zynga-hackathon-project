import React from 'react';
import { CheckCircle, XCircle, Clock, User, Calendar, Eye } from 'lucide-react';

interface VerificationData {
  age: number;
  faceMatchScore: number;
  isAgeValid: boolean;
  isFaceMatched: boolean;
  isVerified: boolean;
  extractedDOB: string;
}

interface VerificationResultsProps {
  data: VerificationData | null;
  isProcessing: boolean;
}

const VerificationResults: React.FC<VerificationResultsProps> = ({ data, isProcessing }) => {
  if (isProcessing) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center space-x-3">
          <Clock className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-lg font-medium text-gray-700">Processing verification...</span>
        </div>
        <div className="mt-4 bg-gray-100 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Extracting date of birth...</span>
              <div className="w-6 h-2 bg-blue-200 rounded animate-pulse"></div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Analyzing face features...</span>
              <div className="w-6 h-2 bg-purple-200 rounded animate-pulse"></div>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Calculating match score...</span>
              <div className="w-6 h-2 bg-green-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center text-gray-500">
          <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Upload both images to start verification</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <div className={`flex items-center space-x-3 mb-4 ${
          data.isVerified ? 'text-green-600' : 'text-red-600'
        }`}>
          {data.isVerified ? (
            <CheckCircle className="w-8 h-8" />
          ) : (
            <XCircle className="w-8 h-8" />
          )}
          <h3 className="text-2xl font-bold">
            {data.isVerified ? 'Verification Successful' : 'Verification Failed'}
          </h3>
        </div>
        
        <div className={`p-4 rounded-lg ${
          data.isVerified ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`font-medium ${data.isVerified ? 'text-green-800' : 'text-red-800'}`}>
            {data.isVerified 
              ? 'Identity verified successfully. All checks passed.'
              : 'Verification failed. Some requirements were not met.'
            }
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Date of Birth</span>
            </div>
            <span className="text-gray-700">{data.extractedDOB}</span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-purple-600" />
              <span className="font-medium">Calculated Age</span>
            </div>
            <span className="text-gray-700">{data.age} years</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-green-600" />
              <span className="font-medium">Face Match</span>
            </div>
            <span className="text-gray-700">{data.faceMatchScore.toFixed(1)}%</span>
          </div>

          <div className="space-y-2">
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              data.isAgeValid ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <span className="font-medium">Age Requirement (18+)</span>
              {data.isAgeValid ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>

            <div className={`flex items-center justify-between p-3 rounded-lg ${
              data.isFaceMatched ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <span className="font-medium">Face Match (70%+)</span>
              {data.isFaceMatched ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationResults;