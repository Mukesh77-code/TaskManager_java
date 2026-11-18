# ========================================================
# Task Manager REST API - Multi-stage Production Dockerfile
# ========================================================

# Stage 1: Build & Package
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app

# Copy Maven wrapper & POM
COPY pom.xml .
COPY src ./src

# Build production JAR (offline-tolerant / skip test in container builder)
RUN ./mvnw clean package -DskipTests 2>/dev/null || (apk add --no-cache maven && mvn clean package -DskipTests)

# Stage 2: Minimal Distroless / JRE Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy built JAR from builder stage or local target
COPY --from=builder /app/target/task-manager-api-1.0.0.jar app.jar

# Dynamic PORT environment variable for cloud host compatibility (Render, Railway, Heroku)
ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=h2
EXPOSE 8080

ENTRYPOINT ["java", "-Dserver.port=${PORT}", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
