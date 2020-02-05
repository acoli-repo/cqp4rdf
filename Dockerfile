# using the latest version of a basic light weight alpine os 
FROM alpine:latest

# install python3-dev
RUN apk add --no-cache python3-dev 
# install git
RUN apk add --no-cache git 
# upgrade python3 pip
RUN pip3 install --upgrade pip
# copy requirements.txt to /tmp/
COPY ./requirements.txt /tmp/
# install the dependencies in the requirements.txt recursively
RUN pip3 install -r /tmp/requirements.txt

# making a repo where the code would be copied
RUN mkdir /cqp4rdf
# copying the code present in ./cqp4rdf to /cqp4rdf/cqp4rdf of the container
COPY ./cqp4rdf /cqp4rdf/cqp4rdf
# copying the grammar file to /cqp4rdf of the cntainer 
COPY ./cqp.ebnf /cqp4rdf

# shift the working directory to /cqp4rdf/cqp4rdf/
WORKDIR /cqp4rdf/cqp4rdf/

# expose the port on which the app would be working
EXPOSE 8088

# on entering the container will upload the data followed by running the flask app 
CMD ["sh", "-c", "python3 data_upload.py && python3 main.py"]
