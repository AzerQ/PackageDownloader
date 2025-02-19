# Build docker image
docker build -t packagedownloader .

# Remove old container
docker stop packagedownloader_app
docker rm packagedownloader_app

# Run container
docker run --name packagedownloader_app  --env AI__API_KEY -d packagedownloader:latest  -p 80:80
