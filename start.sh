set -e

# Git

git pull

# Build docker image
docker build -t packagedownloader -f DOCKERFILE .

# Remove old container
docker stop packagedownloader_app
docker rm packagedownloader_app

# Run container
docker run -d -p 80:80 --name packagedownloader_app  --env AI__API_KEY=$1 packagedownloader:latest
