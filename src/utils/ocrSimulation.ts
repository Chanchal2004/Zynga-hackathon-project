// Simulated OCR function that extracts DOB from image
// In a real implementation, this would use a service like Tesseract.js or cloud OCR APIs

interface OCRResult {
  dateOfBirth: string | null;
  confidence: number;
}

const simulatedAadharData = [
  { dob: '15/08/1995', pattern: 'aadhar1' },
  { dob: '22/03/2001', pattern: 'aadhar2' },
  { dob: '10/12/1998', pattern: 'aadhar3' },
  { dob: '05/06/2005', pattern: 'young' },
  { dob: '18/09/1985', pattern: 'old' },
];

export const extractDOBFromImage = async (imageData: string): Promise<OCRResult> => {
  // Simulate OCR processing time
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  try {
    // For demonstration, we'll simulate finding a DOB
    // In real implementation, this would analyze the actual image
    const randomIndex = Math.floor(Math.random() * simulatedAadharData.length);
    const selectedData = simulatedAadharData[randomIndex];
    
    // Simulate some failed cases
    if (Math.random() < 0.1) {
      return { dateOfBirth: null, confidence: 0 };
    }
    
    return {
      dateOfBirth: selectedData.dob,
      confidence: 85 + Math.random() * 15 // 85-100% confidence
    };
  } catch (error) {
    console.error('OCR processing failed:', error);
    return { dateOfBirth: null, confidence: 0 };
  }
};

export const calculateAge = (dateOfBirth: string): number => {
  const [day, month, year] = dateOfBirth.split('/').map(Number);
  const dob = new Date(year, month - 1, day);
  const today = new Date();
  
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
};