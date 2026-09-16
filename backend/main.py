from io import BytesIO
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from PIL import Image, UnidentifiedImageError

from backend.config import GROQ_API_KEY

from backend.services.animal_detector import (
    CLASS_NAMES,
    MODEL_PATH,
    get_model,
    predict_animal,
)

from backend.services.safari_guide import (
    check_safari_guide,
    send_to_safari_guide,
)

from data.animal_profiles import ANIMAL_PROFILES


# ============================================================
# PATHS
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]

FRONTEND_DIR = PROJECT_ROOT / "frontend"


# ============================================================
# APPLICATION
# ============================================================

app = FastAPI(
    title="Wildlife Safari Assistant API",
    description=(
        "Backend API combining wildlife image classification "
        "with Tanzania safari guidance."
    ),
    version="1.0.0",
)


# ============================================================
# REQUEST MODELS
# ============================================================

class AnimalContext(BaseModel):
    animal: str | None = None
    confidence: float | None = None


class ChatRequest(BaseModel):
    message: str = Field(
        min_length=1
    )

    history: list[dict] = Field(
        default_factory=list
    )

    conversation_id: int | None = None

    animal_context: AnimalContext | None = None


# ============================================================
# MAIN HEALTH CHECK
# ============================================================

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "model_exists": MODEL_PATH.exists(),
        "supported_animals": CLASS_NAMES,
    }


# ============================================================
# MODEL INFORMATION
# ============================================================

@app.get("/api/model")
def model_information():
    try:
        model = get_model()

        return {
            "model": "wildlife_model.h5",
            "input_shape": list(
                model.input_shape
            ),
            "output_shape": list(
                model.output_shape
            ),
            "classes": CLASS_NAMES,
        }

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# ============================================================
# ANIMAL DETECTION
# ============================================================

@app.post("/api/detect")
async def detect_animal(
    file: UploadFile = File(...)
):
    allowed_types = {
        "image/jpeg",
        "image/png",
        "image/webp",
    }

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                "Only JPG, JPEG, PNG and WEBP "
                "images are supported."
            ),
        )

    try:
        contents = await file.read()

        if not contents:
            raise HTTPException(
                status_code=400,
                detail=(
                    "The uploaded image is empty."
                ),
            )

        image = Image.open(
            BytesIO(contents)
        )

        result = predict_animal(
            image
        )

        result["filename"] = (
            file.filename
        )

        return result

    except UnidentifiedImageError:
        raise HTTPException(
            status_code=400,
            detail=(
                "The uploaded file is not "
                "a valid image."
            ),
        )

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# ============================================================
# ANIMAL INFORMATION
# ============================================================

@app.get("/api/animals/{animal_name}")
def animal_information(
    animal_name: str
):
    animal_key = (
        animal_name
        .lower()
        .strip()
    )

    profile = ANIMAL_PROFILES.get(
        animal_key
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail=(
                "Animal profile was not found."
            ),
        )

    return {
        "animal": animal_key,
        **profile,
    }


# ============================================================
# SAFARI GUIDE HEALTH CHECK
# ============================================================

@app.get("/api/safari-guide/health")
async def safari_guide_health():
    try:
        result = (
            await check_safari_guide()
        )

        return {
            "connected": True,
            "safari_guide": result,
        }

    except Exception as error:
        return {
            "connected": False,
            "error": str(error),
        }


# ============================================================
# SAFARI GUIDE CHAT
# ============================================================

@app.post("/api/chat")
async def chat(
    request: ChatRequest
):
    try:
        animal_context = None

        if request.animal_context:
            animal_context = (
                request
                .animal_context
                .model_dump()
            )

        result = (
            await send_to_safari_guide(
                api_key=GROQ_API_KEY,
                message=request.message,
                history=request.history,
                conversation_id=(
                    request.conversation_id
                ),
                animal_context=(
                    animal_context
                ),
            )
        )

        return {
            "reply": result["reply"],
            "conversation_id": result[
                "conversation_id"
            ],
            "animal_context": (
                animal_context
            ),
        }

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=str(error),
        )


# ============================================================
# FRONTEND
# ============================================================
# IMPORTANT:
# Keep this mount AFTER all /api/... endpoints.
# It serves:
#   /
#   /index.html
#   /styles.css
#   /app.js
# from the frontend directory.

app.mount(
    "/",
    StaticFiles(
        directory=str(FRONTEND_DIR),
        html=True,
    ),
    name="frontend",
)