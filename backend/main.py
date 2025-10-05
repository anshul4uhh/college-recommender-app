from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import os
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ✅ Configure Gemini API
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

configuration = {
    "temperature": 0.5,
    "top_p": 0.9,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "application/json"
}

model = genai.GenerativeModel(
    model_name="models/gemini-2.5-flash",
    generation_config=configuration
)

# ✅ FastAPI setup
app = FastAPI(title="College Recommender API")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Input model
class CollegeInput(BaseModel):
    location: str
    budget: str
    interest: str
    course: str


# ✅ Gemini Logic
def generate_college_recommendation(location, budget, interest, course):
    prompt = f"""
    You are an intelligent Indian college recommendation system.

    Based on the user's preferences:
    - Preferred Location: {location}
    - Budget Range: {budget}
    - Interest Field: {interest}
    - Course: {course}

    Task:
    1. Suggest the **Top 10 Colleges in India** that best fit these preferences.
    2. Consider affordability, NIRF ranking, reputation, and relevance to the course.
    3. Include entrance exam details (if required).
    4. Return response ONLY in **valid JSON** with the following schema:

    [
      {{
        "college_name": "string",
        "nirf_rank": "string or number",
        "course_offered": "string",
        "expected_price_per_course": "string or number",
        "entrance_exam": "string (JEE, NEET, CUET, etc.,(if entrance is optional mention it also))",
        "official_website": "string (URL)"
      }}
    ]
    """

    try:
        response = model.generate_content(prompt)
        result = response.text.strip()

        if result.startswith("```json"):
            result = result.replace("```json", "").replace("```", "").strip()

        return json.loads(result)

    except Exception as e:
        return {"error": str(e)}


# ✅ REST Endpoints
@app.get("/")
def health_check():
    return {"status": "✅ College Recommender API is running!"}


@app.post("/recommend_colleges/")
def recommend_colleges(data: CollegeInput):
    output = generate_college_recommendation(
        data.location,
        data.budget,
        data.interest,
        data.course
    )
    return {"result": output}
