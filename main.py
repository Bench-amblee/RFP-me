from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
import shutil
import os
from dotenv import load_dotenv
import textract

load_dotenv()


app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Hello, FastAPI!"}

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai_api_key = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=openai_api_key)

@app.post("/process_rfp/")
async def process_rfp(file: UploadFile = File(...), description: str = Form(...)):
    file_path = f"temp/{file.filename}"

    # Save uploaded file
    os.makedirs("temp", exist_ok=True)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Extract text from the document
    try:
        extracted_text = textract.process(file_path).decode("utf-8")
    except Exception as e:
        extracted_text = f"Error reading file: {str(e)}"

    # AI Processing with OpenAI
    prompt = f"""
    Company Description: {description}

    You are a professional proposal writer. Your task is to generate a well-structured and visually appealing RFP (Request for Proposal) response tailored to the company’s description and tone.

    ### **Response Format:**
    - Use **clear section headings** (e.g., Executive Summary, Technical Approach, Past Performance).
    - Use **bullet points** for key details when appropriate.
    - Keep **paragraphs concise** for readability.
    - Maintain **professional and formal tone**.

    ### **RFP Content to Respond To:**
    {extracted_text}

    Ensure the response is **well-organized** and adheres to best practices for professional proposals.
    """

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "system", "content": "You are an expert at writing RFP responses."},
                  {"role": "user", "content": prompt}]
    )

    # Delete temporary file
    os.remove(file_path)

    return {"response": response.choices[0].message.content}