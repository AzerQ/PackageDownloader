set -e

# Git

git pull

# Run docker-compose
export AI__API_KEY=$1
docker-compose up --build -d
