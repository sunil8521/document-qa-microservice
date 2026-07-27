# ==========================================
# STAGE 1: Build the application
# ==========================================
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /build

# Copy the Maven wrapper execution scripts and configuration files
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Download dependencies in a separate layer to leverage Docker caching
RUN ./mvnw dependency:go-offline -B

# Copy the actual application source code
COPY src ./src

# Build the production-ready executable package (skip unit tests for speed)
RUN ./mvnw clean package -DskipTests

# ==========================================
# STAGE 2: Lightweight Production Runtime
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create a non-privileged system user for secure container execution
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy the compiled jar from the builder stage
# (Matches default spring boot build artifact name pattern)
COPY --from=builder /build/target/*.jar app.jar

# Expose the standard Spring Boot application web port
EXPOSE 8080

# Configure production-optimized JVM flags for container environments
ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:+ExitOnOutOfMemoryError", "-jar", "app.jar"]
