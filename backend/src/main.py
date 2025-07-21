import dotenv
import uvicorn
import logging
from fastapi import FastAPI, Security
from fastapi.middleware.cors import CORSMiddleware
from people.people import peopleRouter
from os import environ
from auth import azure_scheme

dotenv.load_dotenv("../.env")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    swagger_ui_oauth2_redirect_url='/oauth2-redirect',
    swagger_ui_init_oauth={
        'usePkceWithAuthorizationCodeGrant': True,
        'clientId': environ.get("FE_CLIENT_ID"),
        'scopes': environ.get("SCOPE")
    },
)

logger.info(f"=-=-=-=-=-=-=-=-=-=-=-=-=-=-= FastAPI Backend Server =-=-=-=-=-=-=-=-=")
logger.info(f"API Client ID is: {environ.get('APP_CLIENT_ID')}")
logger.info(f"Front-end Client ID is: {environ.get('FE_CLIENT_ID')}")
logger.info(f"Tenant Id is: {environ.get('TENANT_ID')}")
logger.info(f"Scopes are: {environ.get('API_SCOPES')}")
logger.info(f"Front-end scope is: {environ.get('SCOPE')}")

app.add_middleware(CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(peopleRouter, dependencies=[Security(azure_scheme)])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)