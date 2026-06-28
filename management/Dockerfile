# smart_inventory_management/Dockerfile
# ── Stage 1: Build the JAR using Maven ────────────────────────────────────────
# We use a Maven image so the developer doesn't need Maven installed locally.
# The build output is a single fat JAR in /app/target/
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy pom.xml first — Docker caches this layer.
# If only source code changes, Maven won't re-download all dependencies.
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Now copy source and build
COPY src ./src
RUN mvn clean package -DskipTests

# ── Stage 2: Run the JAR in a slim JRE image ──────────────────────────────────
# eclipse-temurin:17-jre is ~200MB vs the Maven image at ~500MB
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy only the built JAR from stage 1 — not Maven, not source code
COPY --from=build /app/target/*.jar app.jar

# The port Spring Boot listens on (matches server.port in application.properties)
EXPOSE 8080

# JVM flags:
# -Xms256m / -Xmx512m  — sensible heap for a small backend
# -Djava.security.egd  — faster random number generation (important for JWT)
ENTRYPOINT ["java", \
  "-Xms256m", \
  "-Xmx512m", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]