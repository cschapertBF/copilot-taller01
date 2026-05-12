# copilot-taller01

Este repositorio incluye una API Web construida con **FastAPI** y gestionada con **Poetry** para demostrar un flujo básico de autenticación con **JWT**.

## Estructura

```text
.
├── backend
│   ├── app
│   │   └── main.py
│   ├── Dockerfile
│   └── pyproject.toml
└── docker-compose.yml
```

## Requisitos funcionales implementados

- `POST /auth/token`: recibe `username` y `password`
- `POST /auth/refresh`: recibe `refresh_token`
- Token de acceso con expiración de **300 segundos**
- Token de refresco para solicitar un nuevo token de acceso

Las credenciales válidas son:

- Usuario: `admin`
- Password: `admin123`

## Uso local con Poetry

1. Instalar Poetry si aún no está disponible.
2. Definir las variables de entorno requeridas:

   ```bash
   export JWT_SECRET_KEY="un-secreto-largo-y-seguro"
   export JWT_USERNAME="admin"
   export JWT_PASSWORD="admin123"
   ```

   > `JWT_USERNAME` y `JWT_PASSWORD` son opcionales; si no se definen, la API usa `admin` y `admin123`.

3. Instalar dependencias:

   ```bash
   cd backend
   poetry install
   ```

4. Ejecutar la API:

   ```bash
   cd backend
   poetry run uvicorn app.main:app --reload
   ```

5. Abrir la documentación interactiva:

   - Swagger UI: `http://localhost:8000/docs`
   - Health check: `http://localhost:8000/health`

## Ejemplos de uso

### Obtener tokens

```bash
curl -X POST http://localhost:8000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Respuesta esperada:

```json
{
  "access_token": "<jwt>",
  "refresh_token": "<jwt>",
  "token_type": "bearer",
  "expires_in": 300
}
```

### Refrescar el token de acceso

```bash
curl -X POST http://localhost:8000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refresh_token":"<jwt>"}'
```

## Uso con Docker

1. Crear un archivo `.env` a partir del ejemplo:

   ```bash
   cp .env.example .env
   ```

2. Ajustar `JWT_SECRET_KEY` en `.env` con un valor seguro.

3. Levantar el servicio:

   ```bash
   docker compose up --build
   ```

La API quedará disponible en `http://localhost:8000`.
