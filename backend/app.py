from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import base64
import cv2
import numpy as np
from datetime import datetime
import re
import face_recognition
from PIL import Image
import io
import pytesseract
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def extract_dob_from_text(text):
    patterns = [
        r'DOB[:\s]*([0-3]?\d[/-][01]?\d[/-]\d{4})',
        r'Date of Birth[:\s]*([0-3]?\d[/-][01]?\d[/-]\d{4})',
        r'([0-3]?\d[/-][01]?\d[/-]\d{4})'
    ]
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            try:
                for fmt in ['%d/%m/%Y', '%d-%m-%Y']:
                    try:
                        dob = datetime.strptime(match.strip(), fmt)
                        if 1900 < dob.year <= datetime.now().year:
                            logging.info(f"DOB found: {dob.strftime(fmt)}")
                            return dob
                    except ValueError:
                        continue
            except Exception as e:
                logging.error(f"DOB parsing error for match '{match}': {e}")
                continue
    logging.warning("No valid DOB found from OCR text.")
    return None

def calculate_age(dob):
    today = datetime.today()
    age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
    return age

def base64_to_image(base64_string):
    logging.info(f"Received base64 string length: {len(base64_string)}")
    if ',' in base64_string:
        prefix, base64_string_cleaned = base64_string.split(',', 1)
        logging.info(f"Base64 prefix detected: {prefix[:50]}...")
    else:
        base64_string_cleaned = base64_string
        logging.info("No base64 prefix found.")

    try:
        image_data = base64.b64decode(base64_string_cleaned)
        logging.info(f"Decoded image_data length: {len(image_data)}")

        debug_file_path = "debug_image.png"
        with open(debug_file_path, "wb") as f:
            f.write(image_data)
        logging.info(f"Decoded image data saved to {debug_file_path} for manual inspection.")

        image = Image.open(io.BytesIO(image_data)).convert('RGB')
        return np.array(image)
    except Exception as e:
        logging.error(f"Error in base64_to_image: {e}", exc_info=True)
        raise ValueError(f"Could not process image data: {e}. Is the image valid and not corrupted?")

def is_image_blurry(image_array):
    gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
    lap_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    logging.info(f"Image blurriness (Laplacian Variance): {lap_var}")
    return lap_var < 100

def perform_ocr(image_array):
    gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
    ocr_text = pytesseract.image_to_string(gray, lang='eng+hin')
    logging.info(f"OCR extracted text: \n{ocr_text[:200]}...")
    return ocr_text

@app.route('/')
def home():
    return "Backend is running. Use /verify or /health for API."

@app.route('/verify', methods=['POST'])
def verify():
    logging.info("Verification request received.")
    try:
        data = request.json
        if 'selfie' in data:
            logging.info(f"Selfie data received (first 50 chars): {data['selfie'][:50]}...")
        if 'aadhar' in data:
            logging.info(f"Aadhar data received (first 50 chars): {data['aadhar'][:50]}...")

        if 'selfie' not in data or 'aadhar' not in data:
            logging.error("Missing selfie or aadhar in request.")
            return jsonify({'error': 'Selfie and Aadhar images are required'}), 400

        selfie_img = base64_to_image(data['selfie'])
        aadhar_img = base64_to_image(data['aadhar'])

        if is_image_blurry(selfie_img):
            logging.warning("Selfie image is blurry.")
            return jsonify({'error': 'Selfie image is too blurry. Please capture a clear photo.'}), 400
        if is_image_blurry(aadhar_img):
            logging.warning("Aadhar image is blurry.")
            return jsonify({'error': 'Aadhar image is too blurry. Please upload a clear image.'}), 400

        ocr_text = perform_ocr(aadhar_img)
        dob = extract_dob_from_text(ocr_text)

        if not dob:
            logging.warning("Could not extract DOB from document.")
            return jsonify({
                'error': 'Could not extract date of birth from document',
                'ocr_text': ocr_text,
                'extracted_dob': None,
                'age': None
            }), 400

        age = calculate_age(dob)
        logging.info(f"Extracted DOB: {dob.strftime('%d/%m/%Y')}, Calculated Age: {age}")

        face_detection_status = "Detected in both images"
        selfie_encodings = []
        aadhar_encodings = []

        try:
            selfie_encodings = face_recognition.face_encodings(selfie_img)
            if not selfie_encodings:
                face_detection_status = "No face detected in selfie"
                logging.warning("No face detected in selfie.")
        except Exception as e:
            logging.error(f"Error detecting face in selfie: {e}")
            face_detection_status = "Error detecting face in selfie"

        try:
            aadhar_encodings = face_recognition.face_encodings(aadhar_img)
            if not aadhar_encodings:
                if face_detection_status == "No face detected in selfie":
                    face_detection_status = "No faces detected in either image"
                else:
                    face_detection_status = "No face detected in Aadhar"
                logging.warning("No face detected in Aadhar.")
        except Exception as e:
            logging.error(f"Error detecting face in Aadhar: {e}")
            if face_detection_status in ["No face detected in selfie", "Error detecting face in selfie"]:
                face_detection_status = "Error detecting faces in both images"
            else:
                face_detection_status = "Error detecting face in Aadhar"

        face_match_score = 0.0
        face_matched = False

        if selfie_encodings and aadhar_encodings:
            try:
                distance = face_recognition.face_distance([aadhar_encodings[0]], selfie_encodings[0])[0]
                face_match_score = max(0, (1 - distance) * 100)
                face_matched = distance < 0.5
                logging.info(f"Face match score: {face_match_score:.2f}%, Face matched: {face_matched}")
            except Exception as face_comparison_error:
                logging.error(f"Face comparison error: {face_comparison_error}")
                face_detection_status = "Error during face comparison"

        age_valid = age >= 18
        verification_passed = bool(age_valid and face_matched)
        logging.info(f"Age valid: {age_valid}, Face matched: {face_matched}, Verification Passed: {verification_passed}")

        return jsonify({
            'age': int(age),
            'extracted_dob': dob.strftime('%d/%m/%Y'),
            'face_match_score': float(round(face_match_score, 2)),
            'face_matched': bool(face_matched),
            'age_valid': bool(age_valid),
            'verification_passed': bool(verification_passed),
            'ocr_text': ocr_text,
            'face_detection_status': face_detection_status
        })

    except Exception as e:
        logging.critical(f"General error in /verify: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'Backend is running!'})

if __name__ == '__main__':
    print("\U0001F680 Starting Face Verification Backend...")
    print("\U0001F4E1 Frontend can connect to: http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)
