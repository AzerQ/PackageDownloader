# Build docker image
docker build -t packagedownloader .

# Run container
docker run -p 80:80 packagedownloader