from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from openai import OpenAI
import shutil
import os
from dotenv import load_dotenv
import textract
import aiofiles  # For async file handling

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

    # Ensure temp directory exists
    os.makedirs("temp", exist_ok=True)

    # Save uploaded file asynchronously
    async with aiofiles.open(file_path, "wb") as buffer:
        while chunk := await file.read(1024):  # Read in chunks
            await buffer.write(chunk)

    # Extract text from the document
    try:
        extracted_text = textract.process(file_path).decode("utf-8")
    except Exception as e:
        extracted_text = f"Error reading file: {str(e)}"

    # Remove file after extraction
    os.remove(file_path)

    # Define the AI prompt
    system_prompt = f"""
    Company Description: {description}

    You are a professional proposal writer. Your task is to generate a well-structured and visually appealing RFP (Request for Proposal) response tailored to the company’s description and tone.

    The response should be organized into the following sections:
    - Exective Summary
    - Project Approach
    - Pricing and Deliverables
    - Conclusion

    Each section will take up its own page or possible more than one page so make sure to keep the content visually appealing by ocassionally adding in bullet points or tables.
    
    Response Format:
    - Generate a professional RFP response in HTML format, using <h2> tags for section headings, <p> for paragraphs, <strong> for bold text, and <ul> or <ol> for bullet and numbered lists. The output should look structured and ready for presentation.
    - Use **clear section headings** (e.g., Executive Summary, Technical Approach, Past Performance).
    - Use **bullet points** for key details when appropriate.
    - Keep **paragraphs concise** for readability.
    - Add space between sections for **visual appeal**.
    - Maintain **professional and formal tone**.

    ### **RFP Content to Respond To:**
    {extracted_text}

    Ensure the response is **well-organized** and adheres to best practices for professional proposals.
    """

    async def generate_response():
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert at writing RFP responses."},
                {"role": "user", "content": system_prompt},
            ],
            stream=True,  # Enables streaming
        )

        for chunk in response:
            if hasattr(chunk.choices[0].delta, "content"): #check if content exists
                yield chunk.choices[0].delta.content  # send text in real-time

    return StreamingResponse(generate_response(), media_type="text/plain")