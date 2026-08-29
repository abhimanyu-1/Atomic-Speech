import os
import random
from fastapi import FastAPI, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Load environment variables
load_dotenv()

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://atomic-speech.vercel.app"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TOPICS_DB = {
    "Computer Science": [
        "Attention Mechanism", "Time Complexity", "Recursion", "Polymorphism", "Microservices Architecture",
        "Gradient Descent", "RESTful APIs", "Virtual Memory", "Garbage Collection", "Deadlocks in Operating Systems",
        "Object-Oriented Programming", "Functional Programming", "Data Structures", "Algorithms", "Machine Learning",
        "Deep Learning", "Neural Networks", "Natural Language Processing", "Computer Vision", "Reinforcement Learning",
        "Database Indexing", "ACID Properties", "CAP Theorem", "Distributed Systems", "Cloud Computing",
        "Containers (Docker)", "Kubernetes", "CI/CD Pipelines", "Cybersecurity Basics", "Encryption Algorithms"
    ],
    "History": [
        "The Fall of the Roman Empire", "The Renaissance", "The Industrial Revolution", "World War I", "World War II",
        "The Cold War", "The French Revolution", "The American Civil War", "The Ming Dynasty", "The Ottoman Empire",
        "The Viking Age", "Ancient Egypt", "The Mongol Empire", "The Enlightenment", "The Space Race",
        "The Great Depression", "The Civil Rights Movement", "The Cuban Missile Crisis", "The Fall of the Berlin Wall", "The Crusades",
        "The Silk Road", "The Black Death", "The Aztec Empire", "The Inca Empire", "The Mayflower Compact",
        "The Magna Carta", "The Declaration of Independence", "The Treaty of Versailles", "The Reign of Terror", "The Samurai"
    ],
    "Biology": [
        "Photosynthesis", "Cellular Respiration", "DNA Replication", "Transcription and Translation", "Mitosis vs Meiosis",
        "Mendelian Genetics", "Evolution by Natural Selection", "The Immune System", "The Human Nervous System", "The Endocrine System",
        "Ecosystems and Biomes", "Food Chains and Webs", "The Carbon Cycle", "The Nitrogen Cycle", "Biodiversity",
        "Symbiosis", "Homeostasis", "Enzyme Function", "Proteins and Amino Acids", "Carbohydrates and Lipids",
        "Viruses vs Bacteria", "Antibiotic Resistance", "Vaccines and Immunity", "The Human Microbiome", "Stem Cells",
        "CRISPR and Gene Editing", "Cloning", "Genetically Modified Organisms (GMOs)", "The Brain and Memory", "Sleep and Circadian Rhythms"
    ],
    "General Knowledge": [
        "The Seven Wonders of the Ancient World", "The Solar System", "The Continents and Oceans", "Major World Religions", "The United Nations",
        "The Olympic Games", "Nobel Prizes", "The Internet and World Wide Web", "Climate Change", "Renewable Energy",
        "The Global Economy", "Human Rights", "Democracy vs Autocracy", "The Print Revolution", "The Information Age",
        "Artificial Intelligence", "Space Exploration", "The Human Genome Project", "Famous Explorers", "Great Inventors",
        "World Geography", "Basic Economics", "Political Systems", "Cultural Anthropology", "Linguistics",
        "Psychology Basics", "Sociology Basics", "Philosophy Basics", "Ethics and Morality", "Logic and Reasoning"
    ],
    "Pop Culture": [
        "The Marvel Cinematic Universe", "Star Wars Franchise", "Harry Potter Series", "The Lord of the Rings", "Game of Thrones",
        "Anime and Manga", "K-Pop", "Video Game History", "The Evolution of Hip Hop", "Classic Rock",
        "The Golden Age of Hollywood", "Reality Television", "Social Media Influencers", "Viral Memes", "The Oscars",
        "The Grammys", "Super Bowl Halftime Shows", "Late Night Talk Shows", "Sitcoms", "Streaming Services",
        "Podcasts", "E-sports", "Comic Books", "Sci-Fi and Fantasy Literature", "True Crime Documentaries",
        "Fashion Trends", "Celebrity Culture", "Internet Slang", "Fandoms", "The Metaverse"
    ]
}

class FeedbackResponse(BaseModel):
    score: float
    improvements: list[str]
    transcript: str
    ideal_explanation: str

@app.get("/")
async def read_root():
    return {"status": "Atomic Speech API is live"}

@app.get("/ping")
async def ping():
    """Lightweight health endpoint for Render keep-alive pings."""
    return {"status": "ok"}

@app.get("/categories")
async def get_categories():
    return {"categories": list(TOPICS_DB.keys())}

@app.get("/topics/random")
@limiter.limit("30/minute")
async def get_random_topic(request: Request, category: Optional[str] = None):
    if category and category in TOPICS_DB:
        topic = random.choice(TOPICS_DB[category])
    else:
        # If no category or invalid category, pick a random one from all categories
        all_topics = [topic for topics in TOPICS_DB.values() for topic in topics]
        topic = random.choice(all_topics)
    return {"topic": topic}

@app.post("/analyze", response_model=FeedbackResponse)
@limiter.limit("10/day")
async def analyze_speech(request: Request, audio: UploadFile = File(...), topic: str = Form(...)):
    from google import genai
    from google.genai import types
    import json
    
    # Read the audio file bytes in memory
    audio_content = await audio.read()
    
    try:
        print("Sending audio to Gemini API for transcription and evaluation...")
        client = genai.Client()
        
        prompt = f"""
        You are an expert public speaking coach and knowledgeable professor.
        I am providing you with an audio recording of a 1-minute speech about the topic: '{topic}'.
        
        1. Listen to the audio and transcribe the speech accurately. Return the transcribed text in the `transcript` field.
        2. Evaluate the clarity, accuracy, delivery, and structure of the speech you just heard.
        3. Score it out of 10 and provide a list of specific, actionable improvements based on their delivery and content.
        4. Provide a concise, ideal 1-minute explanation of the topic to show the speaker how it could be explained perfectly.
        """
        
        # Get the actual MIME type of the uploaded file (which handles iOS audio/mp4 vs PC audio/webm)
        mime_type = audio.content_type or 'audio/webm'
        # Gemini does not like codecs parameters, so we strip them out if they exist (e.g., audio/webm;codecs=opus)
        if ';' in mime_type:
            mime_type = mime_type.split(';')[0]
            
        # Use Gemini native multi-modal capabilities by passing the audio bytes directly
        audio_part = types.Part.from_bytes(
            data=audio_content,
            mime_type=mime_type
        )
        
        from tenacity import retry, stop_after_attempt, wait_exponential
        
        @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
        def call_gemini():
            return client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[
                    audio_part,
                    prompt
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=FeedbackResponse,
                )
            )
        
        response = await run_in_threadpool(call_gemini)
        
        print("Received successful response from Gemini!")
        return response.parsed
        
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        # Fallback response in case of error
        return FeedbackResponse(
            score=0,
            improvements=[f"Failed to analyze audio with Gemini AI: {str(e)}"],
            transcript="(Failed to transcribe due to API error)",
            ideal_explanation="Failed to generate ideal explanation due to API error."
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
