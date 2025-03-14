from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from openai import OpenAI
import os
import textract
import aiofiles  # For async file handling
import json
from dotenv import load_dotenv

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

    ### **Response Format (JSON Output Required)**
    Your response **must be formatted as valid JSON** with an array of sections, where each section contains:
    - A `"title"` field (e.g., "Executive Summary", "Project Approach").
    - A `"content"` field containing structured content in JSON format, with:
      - `"type"`: "paragraph" or "list"
      - `"data"`: The actual text or bullet points.

    **Example JSON Output:**
    ```json
    [
      {
        "title": "Executive Summary",
        "content": [
          { "type": "paragraph", "data": "Our company brings 10+ years of expertise in software development..." },
          { "type": "list", "data": ["Custom AI-driven solutions", "Proven track record in RFP responses"] }
        ]
      },
      {
        "title": "Project Approach",
        "content": [
          { "type": "paragraph", "data": "Our approach is structured around three key phases..." },
          { "type": "list", "data": ["Phase 1: Discovery & Planning", "Phase 2: Implementation", "Phase 3: Quality Assurance"] }
        ]
      }
    ]
    ```

    Ensure the response is **properly structured JSON** that follows this format.

    ### **Sections to Include:**
    - Executive Summary
    - Project Approach
    - Pricing and Deliverables
    - Conclusion

    ### **RFP Content to Respond To:**
    {extracted_text}

    Ensure the response is **well-organized**, professional, and adheres to best practices for proposal writing.
    """

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are an expert at writing RFP responses in structured JSON format."},
            {"role": "user", "content": system_prompt},
        ],
        temperature=0.7,
        response_format="json",  # Ensures JSON response
    )

    # Extract response content
    response_content = response.choices[0].message.content

    try:
        structured_response = json.loads(response_content)  # Ensure valid JSON
    except json.JSONDecodeError:
        structured_response = {"error": "Invalid JSON response from AI."}

    return JSONResponse(content=structured_response)
