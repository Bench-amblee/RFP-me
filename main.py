import os
import re
import json
import aiofiles
import textract
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI

# Load environment variables
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
    # Ensure temp directory exists
    os.makedirs("temp", exist_ok=True)

    # Clean filename to avoid special character issues
    safe_filename = re.sub(r'\W+', '_', file.filename)
    file_path = os.path.join("temp", safe_filename)  # Ensure cross-platform compatibility

    print(f"Saving file to: {file_path}")  # Debugging message

    # Save uploaded file asynchronously
    try:
        async with aiofiles.open(file_path, "wb") as buffer:
            while chunk := await file.read(1024):  # Read in chunks
                await buffer.write(chunk)
            await buffer.flush()  # Ensure all data is written

        # Confirm file was saved successfully
        if not os.path.exists(file_path):
            print(f"❌ ERROR: File not found after saving -> {file_path}")  # Debugging message
            raise FileNotFoundError(f"File {file_path} was not saved properly.")
    except Exception as e:
        print(f"❌ ERROR while saving file: {str(e)}")  # Debugging message
        return JSONResponse(content={"error": f"File upload failed: {str(e)}"}, status_code=500)

    print(f"✅ File successfully saved: {file_path}")  # Debugging message

    # Extract text from the document
    try:
        extracted_text = textract.process(file_path).decode("utf-8")
        print(f"✅ Extracted text (first 500 chars): {extracted_text[:500]}")
    except Exception as e:
        extracted_text = f"Error reading file: {str(e)}"
        print(f"❌ ERROR extracting text: {str(e)}")

    # Remove file after extraction
    try:
        os.remove(file_path)
        print(f"✅ Successfully deleted file: {file_path}")
    except Exception as e:
        print(f"❌ ERROR deleting file: {str(e)}")

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

    print("🚀 Sending request to OpenAI...")  # Debugging message

    response = client.chat.completions.create(
        model="gpt-4-turbo",
        messages=[
            {"role": "system", "content": "You are an expert at writing RFP responses in structured JSON format."},
            {"role": "user", "content": system_prompt},
        ],
        temperature=0.7,
        response_format={"type": "json_object"}
    )

    # Extract response content
    response_content = response.choices[0].message.content

    try:
        structured_response = json.loads(response_content)  # Ensure valid JSON
    except json.JSONDecodeError:
        print("❌ ERROR: Invalid JSON response from OpenAI")  # Debugging message
        structured_response = {"error": "Invalid JSON response from AI."}

    print("✅ Returning AI-generated response")  # Debugging message
    return JSONResponse(content=structured_response)
