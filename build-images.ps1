$FrontEndDockerfile = 'Dockerfile.frontend'
$BackEndDockerfile = 'Dockerfile.backend'
$FrontEndImageName = 'fastgen-frontend'
$BackEndImageName = 'fastgen-backend'

# Build both images
Write-Host "Building frontend image..."
podman build -f $FrontEndDockerfile -t $FrontEndImageName --log-level=debug .

Write-Host "Building backend image..."
podman build -f $BackEndDockerfile -t $BackEndImageName --log-level=debug .

Write-Host "Build complete!"
Write-Host "Frontend image: $FrontEndImageName"
Write-Host "Backend image: $BackEndImageName"

# Run the frontend container
Write-Host "Running frontend container..."
podman run -d --rm --name fastgen-frontend -p 3000:80 $FrontEndImageName

# Run the backend container
Write-Host "Running backend container..."
podman run -d --rm --name fastgen-backend -p 5000:80 $BackEndImageName