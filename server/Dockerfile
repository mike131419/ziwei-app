FROM python:3.12-slim
WORKDIR /app
COPY server.py build_db.py ./
ENV DB_PATH=/data/ziwei13.db PORT=8787 QUIET=1
EXPOSE 8787
VOLUME ["/data"]
CMD ["python3", "server.py"]
