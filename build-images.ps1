$FrontEndDockerfile = 'Dockerfile.frontend'
$BackEndDockerfile = 'Dockerfile.backend'
$FrontEndImageName = 'fastgen-frontend-delme'
$BackEndImageName = 'fastgen-backend-delme'

# Build both images
Write-Host "Building frontend image..."
podman build -f $FrontEndDockerfile -t $FrontEndImageName --log-level=debug .

Write-Host "Building backend image..."
podman build -f $BackEndDockerfile -t $BackEndImageName --log-level=debug .

Write-Host "Build complete!"
Write-Host "Frontend image: $FrontEndImageName"
Write-Host "Backend image: $BackEndImageName"