import httpx


SAFARI_GUIDE_BASE_URL = "http://127.0.0.1:8504"


async def check_safari_guide():
    async with httpx.AsyncClient(timeout=10.0) as client:
        response = await client.get(
            f"{SAFARI_GUIDE_BASE_URL}/api/health"
        )

        response.raise_for_status()

        return response.json()


async def send_to_safari_guide(
    api_key: str,
    message: str,
    history: list | None = None,
    conversation_id: int | None = None,
    animal_context: dict | None = None,
):
    history = history or []

    enriched_message = message

    if animal_context:
        animal = animal_context.get("animal")
        confidence = animal_context.get("confidence")

        if animal:
            enriched_message = (
                "Wildlife detection context:\n"
                f"The user's most recently detected animal is {animal}. "
                f"The detector confidence was {confidence}%.\n\n"
                "Use this animal as the reference when the user uses "
                "words such as 'it', 'this animal', 'them', or similar "
                "follow-up references.\n\n"
                f"User question: {message}"
            )

    payload = {
        "api_key": api_key,
        "message": enriched_message,
        "history": history,
        "conversation_id": conversation_id,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{SAFARI_GUIDE_BASE_URL}/api/chat",
            json=payload,
        )

        try:
            data = response.json()
        except Exception:
            data = {
                "error": "Safari Guide returned an invalid response."
            }

        if response.status_code != 200:
            raise RuntimeError(
                data.get(
                    "error",
                    "Safari Guide request failed."
                )
            )

        return data