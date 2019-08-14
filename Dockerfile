FROM alpine:latest

RUN apk add --no-cache python3-dev 
RUN pip3 install --upgrade pip
COPY ./requirements.txt /tmp/
RUN pip3 install -r /tmp/requirements.txt

RUN mkdir /cqp4rdf
COPY ./cqp4rdf /cqp4rdf/cqp4rdf
COPY ./cqp.ebnf /cqp4rdf

WORKDIR /cqp4rdf/cqp4rdf/

EXPOSE 8088

ENTRYPOINT ["python3"]
CMD ["main.py"]
