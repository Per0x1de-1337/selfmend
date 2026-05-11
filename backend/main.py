import os
import pathlib
import logging
from dotenv import load_dotenv

# load_dotenv MUST run before any local module is imported, because llm.py
# reads LLM_PROVIDER / GROQ_API_KEY at module-import time.
load_dotenv(pathlib.Path(__file__).parent.parent / ".env")

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from pipeline import Session

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

OPENAI_KEY    = os.environ["OPENAI_API_KEY"]
DEEPGRAM_KEY  = os.environ["DEEPGRAM_API_KEY"]
CARTESIA_KEY  = os.environ["CARTESIA_API_KEY"]
VOICE_ID      = os.getenv("CARTESIA_VOICE_ID", "a0e99841-438c-4a64-b679-ae501e7d6091")

app = FastAPI(title="Duplex Voice Agent")


@app.websocket("/ws")
async def ws_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info(f"Client connected: {websocket.client}")

    session = Session(websocket, OPENAI_KEY, DEEPGRAM_KEY, CARTESIA_KEY, VOICE_ID)
    try:
        await session.start()
        while True:
            msg = await websocket.receive()
            # "type" == "websocket.disconnect" means the client closed
            if msg.get("type") == "websocket.disconnect":
                break
            if "bytes" in msg and msg["bytes"]:
                await session.handle(msg["bytes"])
            elif "text" in msg and msg["text"]:
                await session.handle(msg["text"])
    except WebSocketDisconnect:
        logger.info("Client disconnected")
    except Exception as e:
        logger.debug(f"Session ended: {e}")
    finally:
        await session.stop()


# Serve the built React frontend (frontend_dist/).
# Run `npm run build` inside frontend/ first, or use `npm run dev` for hot-reload dev.
FRONTEND_DIST = pathlib.Path(__file__).parent.parent / "frontend_dist"
if FRONTEND_DIST.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIST), html=True), name="static")
else:
    logger.warning("frontend_dist/ not found — run `cd frontend && npm run build` first")
