from pathlib import Path

import numpy as np
import tensorflow as tf
from PIL import Image


# ---------------------------------------------------------
# PATHS
# ---------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parents[2]
MODEL_PATH = PROJECT_ROOT / "models" / "wildlife_model.h5"


# ---------------------------------------------------------
# MODEL CONFIGURATION
# ---------------------------------------------------------

CLASS_NAMES = [
    "buffalo",
    "cheetah",
    "crocodile",
    "elephant",
    "giraffe",
    "leopard",
    "lion",
    "rhino",
    "zebra",
]

MIN_ANIMAL_CONFIDENCE = 70.0


# ---------------------------------------------------------
# LOAD MODEL
# ---------------------------------------------------------

_model = None


def get_model():
    global _model

    if _model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"Wildlife model was not found at: {MODEL_PATH}"
            )

        _model = tf.keras.models.load_model(
            MODEL_PATH,
            compile=False,
        )

        if _model.output_shape[-1] != len(CLASS_NAMES):
            raise ValueError(
                f"Model has {_model.output_shape[-1]} outputs, "
                f"but {len(CLASS_NAMES)} classes are configured."
            )

    return _model


# ---------------------------------------------------------
# PREDICTION
# ---------------------------------------------------------

def predict_animal(image: Image.Image) -> dict:
    model = get_model()

    input_height = model.input_shape[1]
    input_width = model.input_shape[2]

    image = image.convert("RGB")
    image = image.resize((input_width, input_height))

    # Important:
    # Keep raw 0-255 pixel values because the trained model already
    # contains its own Rescaling layer.
    image_array = np.array(image, dtype=np.float32)
    image_array = np.expand_dims(image_array, axis=0)

    prediction = model.predict(
        image_array,
        verbose=0,
    )[0]

    # Normally the model already returns softmax probabilities.
    # This check protects us if the output format ever changes.
    if (
        np.min(prediction) < 0
        or np.max(prediction) > 1
        or not np.isclose(np.sum(prediction), 1.0, atol=0.01)
    ):
        prediction = tf.nn.softmax(prediction).numpy()

    predicted_index = int(np.argmax(prediction))

    predicted_class = CLASS_NAMES[predicted_index]

    confidence = float(
        prediction[predicted_index] * 100
    )

    supported = confidence >= MIN_ANIMAL_CONFIDENCE

    probabilities = {
        class_name: round(float(probability * 100), 2)
        for class_name, probability in zip(
            CLASS_NAMES,
            prediction,
        )
    }

    sorted_probabilities = sorted(
        probabilities.items(),
        key=lambda item: item[1],
        reverse=True,
    )

    top_matches = [
        {
            "animal": animal,
            "confidence": score,
        }
        for animal, score in sorted_probabilities[:5]
    ]

    return {
        "animal": predicted_class if supported else None,
        "predicted_class": predicted_class,
        "confidence": round(confidence, 2),
        "supported": supported,
        "threshold": MIN_ANIMAL_CONFIDENCE,
        "probabilities": probabilities,
        "top_matches": top_matches,
    }