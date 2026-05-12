from datetime import datetime, timedelta, timezone
from hmac import compare_digest
import os
from uuid import uuid4

import jwt
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from jwt import ExpiredSignatureError, InvalidTokenError
from pydantic import BaseModel

app = FastAPI(title="JWT Demo API", version="1.0.0")

ACCESS_TOKEN_EXPIRE_SECONDS = 300
REFRESH_TOKEN_EXPIRE_SECONDS = 3600
ALGORITHM = "HS256"


def get_required_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"The {name} environment variable must be set.")
    return value


SECRET_KEY = get_required_env("JWT_SECRET_KEY")
VALID_USERNAME = os.getenv("JWT_USERNAME", "admin")
VALID_PASSWORD = os.getenv("JWT_PASSWORD", "admin123")
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


class LoginRequest(BaseModel):
    username: str
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


def create_token(subject: str, token_type: str, expires_in: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + timedelta(seconds=expires_in),
        "jti": uuid4().hex,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            options={"require": ["exp", "iat", "sub", "type"]},
        )
    except ExpiredSignatureError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        ) from exc
    except InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        ) from exc


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/token")
def login(payload: LoginRequest) -> dict[str, str | int]:
    if not compare_digest(payload.username, VALID_USERNAME) or not compare_digest(
        payload.password, VALID_PASSWORD
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    return {
        "access_token": create_token(
            subject=payload.username,
            token_type="access",
            expires_in=ACCESS_TOKEN_EXPIRE_SECONDS,
        ),
        "refresh_token": create_token(
            subject=payload.username,
            token_type="refresh",
            expires_in=REFRESH_TOKEN_EXPIRE_SECONDS,
        ),
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_SECONDS,
    }


@app.post("/auth/refresh")
def refresh_token(payload: RefreshRequest) -> dict[str, str | int]:
    claims = decode_token(payload.refresh_token)
    if claims["type"] != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    return {
        "access_token": create_token(
            subject=claims["sub"],
            token_type="access",
            expires_in=ACCESS_TOKEN_EXPIRE_SECONDS,
        ),
        "token_type": "bearer",
        "expires_in": ACCESS_TOKEN_EXPIRE_SECONDS,
    }
