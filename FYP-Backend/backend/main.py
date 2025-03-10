from fastapi import FastAPI, File, UploadFile, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
from PIL import Image
import io
from reportlab.pdfgen import canvas
from io import BytesIO
import json
import joblib
import pandas as pd
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, firestore
from groq import Groq

app = FastAPI()

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Ultrasound Prediction Endpoints -----------------
# Load YOLO models for ultrasound predictions
model1 = YOLO("appendix.pt")  # First trained model
model2 = YOLO("Appendicitis.pt")  # Second trained model

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    """Predict appendicitis from an ultrasound image using YOLO models."""
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")

    # Run predictions
    results1 = model1([image], verbose=False)
    results2 = model2([image], verbose=False)

    # Extract class names
    class_names1 = [
        results1[0].names[int(cls_id)]
        for cls_id in results1[0].boxes.cls.cpu().numpy()
    ]
    class_names2 = [
        results2[0].names[int(cls_id)]
        for cls_id in results2[0].boxes.cls.cpu().numpy()
    ]

    return {
        "model1_predictions": class_names1,
        "model2_predictions": class_names2
    }

# ----------------- PDF Report Generation Endpoint -----------------
@app.post("/generate-report/")
async def generate_report(
    source: str = Query(..., description="Type of report: ultrasound, quiz, both"),
    data: str = Query("", description="Additional data in JSON format")
):
    """Generate and return a PDF report based on the prediction source."""
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer)

    # Report Title
    pdf.setFont("Helvetica-Bold", 16)
    pdf.drawString(200, 800, "Appendicitis Prediction Report")

    pdf.setFont("Helvetica", 12)
    pdf.drawString(100, 750, f"Report Type: {source.capitalize()}")

    # Process additional data (if provided)
    parsed_data = json.loads(data) if data else {}

    if source == "ultrasound":
        pdf.drawString(100, 700, "Report based on Ultrasound Analysis")
        pdf.drawString(100, 680, f"Model 1 Predictions: {parsed_data.get('model1_predictions', 'N/A')}")
        pdf.drawString(100, 660, f"Model 2 Predictions: {parsed_data.get('model2_predictions', 'N/A')}")
    elif source == "quiz":
        pdf.drawString(100, 700, "Report based on Quick Quiz Assessment")
        for i, (question, answer) in enumerate(parsed_data.items(), start=1):
            pdf.drawString(100, 700 - (i * 20), f"{question}: {answer}")
 
    pdf.showPage()
    pdf.save()
    buffer.seek(0)

    return Response(
        content=buffer.read(),
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=report.pdf"}
    )

# ----------------- Firebase Initialization -----------------
cred = credentials.Certificate("key.json")  # Replace with your Firebase JSON key file
firebase_admin.initialize_app(cred)
db = firestore.client()

# ----------------- Quick Test Endpoints -----------------
class UserInput(BaseModel):
    Sex: str
    Fever: str
    MigratoryPain: str
    IpsilateralReboundTenderness: str
    ContralateralReboundTenderness: str
    LowerRightAbdPain: str
    CoughingPain: str
    Nausea: str
    LossofAppetite: str

@app.post("/submit_quicktest")
def submit_quicktest(user_data: UserInput):
    """
    Store the quick test responses in Firebase Firestore.
    """
    user_dict = user_data.dict()
    # Save data in Firestore under a 'quick_tests' collection
    doc_ref = db.collection("quick_tests").add(user_dict)
    return {"message": "Data successfully stored!", "document_id": doc_ref[0].id}

# Load decision tree model and expected columns
dt = joblib.load("decision_tree_model.pkl")
final_columns = joblib.load("final_columns.pkl")

@app.post("/predict_quicktest")
def predict_quicktest(user_data: UserInput):
    """
    Predict appendicitis based on user input.
    """
    user_df = pd.DataFrame([user_data.dict()])
    user_df = pd.get_dummies(user_df, dtype=int)
    user_df = user_df.reindex(columns=final_columns, fill_value=0)
    
    prediction = dt.predict(user_df)
    result = "Appendicitis" if prediction[0] == 1 else "No Appendicitis"
    
    # Store the prediction in Firebase
    user_dict = user_data.dict()
    user_dict["diagnosis"] = result
    db.collection("quick_tests").add(user_dict)
    
    return {"diagnosis": result}

# ----------------- Chatbot Endpoint -----------------
client = Groq(api_key="YOUR_GROQ_API")

class QuestionRequest(BaseModel):
    question: str

@app.post("/ask")
async def ask_question(request: QuestionRequest):
    """
    API endpoint to ask a question and get a response from the Groq model.
    """
    completion = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a highly experienced medical professional specializing in appendicitis and emergency surgical care. "
                    "Your role is to provide accurate, reliable, and medically sound answers to users' queries "
                    "specifically related to appendicitis, its symptoms, diagnosis, treatment options, and surgical procedures. "
                    "If a user asks about topics outside appendicitis and emergency abdominal conditions, politely decline to answer, "
                    "stating that your expertise is limited to appendicitis and related medical issues. "
                    "Keep responses informative, clear, and accessible to both medical professionals and the general public."
                ),
            },
            {"role": "user", "content": request.question},
        ],
        temperature=1,
        max_tokens=500,
        top_p=1,
        stream=False,
    )

    return {"response": completion.choices[0].message.content}
