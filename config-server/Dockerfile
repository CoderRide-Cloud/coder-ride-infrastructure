# Build from monorepo root: docker build -f config-server/Dockerfile -t config-server .
# syntax=docker/dockerfile:1
FROM eclipse-temurin:21-jdk-alpine AS build
RUN apk add --no-cache maven
WORKDIR /workspace
COPY config-server/pom.xml ./config-server/pom.xml
COPY config-server/src ./config-server/src
RUN cd config-server && mvn clean package -DskipTests -q
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /workspace/config-server/target/*.jar app.jar
EXPOSE 8888
ENTRYPOINT ["java", "-jar", "app.jar"]
