from fastapi_azure_auth import SingleTenantAzureAuthorizationCodeBearer
from os import environ
import json
import logging

logger = logging.getLogger(__name__)

tenant_id = environ.get("TENANT_ID")
client_id = environ.get("APP_CLIENT_ID")
scopes = json.loads(environ.get("API_SCOPES"))

logger.info(f"Tenant ID: {tenant_id}")
logger.info(f"App Client ID: {client_id}")
logger.info(f"Scopes: {scopes}")

azure_scheme = SingleTenantAzureAuthorizationCodeBearer(
    app_client_id=client_id,
    tenant_id=tenant_id,
    scopes=scopes,
)