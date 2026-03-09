# ==========================================
# STAGE 1: dependency cache
# Downloads all Maven dependencies first so
# they are cached as a separate layer and
# only re-downloaded when pom.xml changes.
# ==========================================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS deps
WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B --no-transfer-progress

# ==========================================
# STAGE 2: build
# Compiles source and packages the fat JAR.
# Source changes only invalidate this layer,
# not the dependency cache above.
# ==========================================
FROM deps AS build
WORKDIR /app

COPY src ./src
RUN mvn clean package -DskipTests -B --no-transfer-progress

# ==========================================
# STAGE 3: extract (Spring Boot layer tools)
# Uses Spring Boot's built-in layertools to
# split the fat JAR into ordered layers so
# Docker can cache dependencies, snapshot
# deps, resources, and app code separately.
# ==========================================
FROM eclipse-temurin:21-jre-alpine AS extract
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar
RUN java -Djarmode=layertools -jar app.jar extract --destination extracted

# ==========================================
# STAGE 4: runtime (final image)
# Minimal JRE-only image with a non-root
# user. Only the extracted layers are copied
# in the optimal caching order recommended
# by Spring Boot layertools.
# ==========================================
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Create non-root user for security
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy layers in order of least → most likely to change
# (Spring Boot layertools ordering for best cache reuse)
COPY --from=extract /app/extracted/dependencies ./
COPY --from=extract /app/extracted/spring-boot-loader ./
COPY --from=extract /app/extracted/snapshot-dependencies ./
COPY --from=extract /app/extracted/application ./

EXPOSE 8087

# Use Spring Boot's JarLauncher for layered execution
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]