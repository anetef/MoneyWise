# ============================================================
# Estágio 1: build — compila o projeto e gera o JAR
# ============================================================
FROM eclipse-temurin:21-jdk AS build
WORKDIR /workspace

# 1) Copia só o que define as dependências e baixa tudo.
#    Enquanto o pom.xml não mudar, o Docker reaproveita esta etapa (cache).
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline

# 2) Copia o código e gera o JAR.
#    Os testes rodam no "./mvnw verify" e no CI, não na montagem da imagem.
COPY src src
RUN ./mvnw -B package -DskipTests && cp target/*.jar app.jar

# ============================================================
# Estágio 2: runtime — só o Java e o JAR
# ============================================================
FROM eclipse-temurin:21-jre
WORKDIR /app

# Usuário sem privilégios de administrador (boa prática de segurança)
RUN useradd --system --create-home appuser
USER appuser

# A única coisa trazida do estágio 1 é o JAR
COPY --from=build /workspace/app.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]