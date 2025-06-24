# Backend Setup Instructions

## Step 1: Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

## Step 2: Run Backend Server
```bash
python app.py
```

Backend will start on: http://localhost:5000

## Step 3: Test Backend
Open browser and go to: http://localhost:5000/health
You should see: {"status": "Backend is running!"}

## Troubleshooting:
- If face_recognition fails to install, try: `pip install cmake` first
- On Windows, you might need Visual Studio Build Tools
- Alternative: Use the simulation mode (already included)