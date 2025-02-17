# Build docker image
docker build -t packagedownloader .

# Run container
docker run --env AI__API_KEY=YOUR_API_KEY -d -p 80:80 packagedownloader