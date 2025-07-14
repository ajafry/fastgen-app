from fastapi_azure_auth import SingleTenantAzureAuthorizationCodeBearer
from os import environ
import json
import logging

tenant_id = 'ef1d4b1e-bd3c-4e1e-a8de-525e802c43d1'
client_id = '95f37204-669c-4dc9-a9a7-292918a0a5f8'
logger = logging.getLogger(__name__)
logger.info(f"Tenant ID is -->> {environ.get('TENANT_ID')}")

azure_scheme = SingleTenantAzureAuthorizationCodeBearer(
    app_client_id=client_id,
    tenant_id=tenant_id,
    scopes={"api://fastapi-backend/User.CallApi": "User.CallApi"},
)

# app_client_id=environ.get("APP_CLIENT_ID")
# scopes=json.loads(environ.get("API_SCOPES", "[]")),
