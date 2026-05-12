# copilot-taller01

Este repositorio incluye una API Web construida con **FastAPI** y una aplicación **React** para demostrar un flujo básico de autenticación con **JWT**.

## Estructura

```text
.
├── frontend
│   ├── src
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
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
- Frontend React con pantalla de login y pantalla de bienvenida
- Sesión almacenada en `sessionStorage`
- Protección de la pantalla de bienvenida cuando no existe sesión activa

Las credenciales válidas son:

- Usuario: `admin`
- Password: `admin123`

## Frontend

La aplicación web está pensada para ejecutarse junto con el backend y ofrece:

- Página de login en `/#/login`
- Página de bienvenida en `/#/welcome`
- Redirección automática al login cuando no hay sesión iniciada
- Cierre de sesión para limpiar la sesión almacenada

Por defecto, el frontend consume el backend en `http://localhost:8000`. Si necesitas otra URL, puedes definir:

```bash
VITE_API_URL=http://localhost:8000
```

## Uso local

1. Instalar Poetry si aún no está disponible.
2. Definir las variables de entorno requeridas:

   ```bash
   export JWT_SECRET_KEY="un-secreto-largo-y-seguro"
   export JWT_USERNAME="admin"
   export JWT_PASSWORD="admin123"
   ```

   > `JWT_USERNAME` y `JWT_PASSWORD` son opcionales; si no se definen, la API usa `admin` y `admin123`.

3. Instalar dependencias del backend:

   ```bash
   cd backend
   poetry install
   ```

4. Ejecutar la API:

   ```bash
   cd backend
   poetry run uvicorn app.main:app --reload
   ```

5. En otra terminal, instalar dependencias del frontend:

   ```bash
   cd frontend
   npm install
   ```

6. Ejecutar el frontend:

   ```bash
   cd frontend
   npm run dev
   ```

7. Abrir la aplicación:

   - Frontend: `http://localhost:5173/#/login`
   - Swagger UI: `http://localhost:8000/docs`
   - Health check: `http://localhost:8000/health`

## Uso del login

1. Abrir `http://localhost:5173/#/login`
2. Ingresar las credenciales:

   - Usuario: `admin`
   - Password: `admin123`

3. Al iniciar sesión correctamente se guarda la sesión en el navegador y se redirige a `/#/welcome`
4. Si intentas abrir `/#/welcome` sin sesión, el frontend vuelve automáticamente al login

## Ejemplos de uso del backend

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
