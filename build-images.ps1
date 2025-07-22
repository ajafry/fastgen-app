$FrontEndDockerfile = 'Dockerfile.frontend'
$BackEndDockerfile = 'Dockerfile.backend'
$FrontEndImageName = 'app-frontend'
$BackEndImageName = 'app-backend'
$AzureRegistory = 'crusnhfi7unql3o.azurecr.io'
$ResourceGroupName = 'rg-azdopenaimcp'
$ContainerAppEnvName = 'cae-usnhfi7unql3o'


# Build both images
Write-Host "Building frontend image..."
podman build -f $FrontEndDockerfile -t ${AzureRegistory}/${FrontEndImageName}:latest `
  --build-arg REACT_APP_CLIENT_ID=6b4328eb-ec24-4546-ae28-ba3f29114db8 `
  --build-arg REACT_APP_TENANT_ID=ef1d4b1e-bd3c-4e1e-a8de-525e802c43d1 `
  --build-arg REACT_APP_API_BASE_URL=https://backend.wittygrass-ef2e9b18.westus3.azurecontainerapps.io `
   .

Write-Host "Building backend image..."
podman build -f $BackEndDockerfile -t ${AzureRegistory}/${BackEndImageName}:latest --log-level=debug .

Write-Host "Build complete!"
Write-Host "Frontend image: $FrontEndImageName"
Write-Host "Backend image: $BackEndImageName"

# Run the frontend container
Write-Host "Running frontend container..."
podman run -d --rm --name fastgen-frontend -p 3000:80 $FrontEndImageName

# Run the backend container
Write-Host "Running backend container..."
podman run -d --rm --name fastgen-backend -p 5000:80 $BackEndImageName

#push containers to Azure Container Registry
Write-Host "Pushing frontend image to Azure Container Registry..."
podman push ${AzureRegistory}/${FrontEndImageName}:latest

Write-Host "Pushing backend image to Azure Container Registry..."
podman push ${AzureRegistory}/${BackEndImageName}:latest
Write-Host "Images pushed to Azure Container Registry successfully!"

# Create an Azure Container App using the frontend and backend images. Also set environment variables
# for each of the apps based upon the .env file in the respective folders.

# Create the Azure Container Apps
az containerapp create --name frontend --resource-group ${ResourceGroupName} --image ${AzureRegistory}/${FrontEndImageName}:latest  --env-vars 'frontend/.env' --ingress external --target-port 80 --environment ${ContainerAppEnvName}

az containerapp create --name backend --resource-group ${ResourceGroupName} --image ${AzureRegistory}/${BackEndImageName}:latest --env-vars 'backend/.env' --ingress external --target-port 80 --environment ${ContainerAppEnvName}

# Run the backend image
podman run `
  -e TENANT_ID=ef1d4b1e-bd3c-4e1e-a8de-525e802c43d1 `
  -e APP_CLIENT_ID=95f37204-669c-4dc9-a9a7-292918a0a5f8 `
  -e FE_CLIENT_ID=6b4328eb-ec24-4546-ae28-ba3f29114db8 `
  -e API_SCOPES='{"api://fastapi-backend/User.CallApi": "User.CallApi"}' `
  -e SCOPE='api://fastapi-backend/User.CallApi' `
  --dns=8.8.8.8 `
  --dns=8.8.4.4 `
  --dns=1.1.1.1 `
  -p 8000:80 `
  --rm `
  ${BackEndImageName}:latest