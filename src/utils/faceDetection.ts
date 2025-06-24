import * as faceapi from 'face-api.js';

let isModelLoaded = false;

export const loadFaceDetectionModels = async (): Promise<void> => {
  if (isModelLoaded) return;
  
  try {
    const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/model';
    
    await Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    
    isModelLoaded = true;
    console.log('Face detection models loaded successfully');
  } catch (error) {
    console.error('Error loading face detection models:', error);
  }
};

export const detectFaces = async (imageElement: HTMLImageElement): Promise<any[]> => {
  if (!isModelLoaded) {
    await loadFaceDetectionModels();
  }

  try {
    const detections = await faceapi
      .detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptors();
    
    return detections;
  } catch (error) {
    console.error('Error detecting faces:', error);
    return [];
  }
};

export const compareFaces = (descriptor1: Float32Array, descriptor2: Float32Array): number => {
  const distance = faceapi.euclideanDistance(descriptor1, descriptor2);
  const similarity = Math.max(0, (1 - distance) * 100);
  return similarity;
};