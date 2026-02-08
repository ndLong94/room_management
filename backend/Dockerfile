# Build stage
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests -B

# Run stage
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create non-root user
RUN addgroup -g 1000 app && adduser -u 1000 -G app -D app

# Copy jar from build stage
COPY --from=build /app/target/management-backend-*.jar app.jar

# Upload dir (bind mount or volume in production)
RUN mkdir -p /app/uploads && chown -R app:app /app

USER app

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
