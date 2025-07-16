# React-Python-FE-BE App

This repository contains two main projects:

## Backend

The backend is a server-side application responsible for handling API requests, business logic, and data management. The backend app was built using FastAPI and uses FastAPI-Azure-Auth (https://intility.github.io/fastapi-azure-auth/single-tenant/fastapi_configuration) for supporting authentication with an Azure Entra Id. Please refer to the `backend/README.md` for detailed setup and usage instructions.

## Frontend

The frontend is a client-side application that provides the user interface and interacts with the backend via APIs. It it a React based application and uses MSAL for authentication with Entra Id. For setup and usage details, see the `frontend/README.md`.

---

**Note:**  
Each project (`backend` and `frontend`) has its own `README.md` file with specific instructions for installation, configuration, and running the respective application. Please review those files to perform the necessary setup.
