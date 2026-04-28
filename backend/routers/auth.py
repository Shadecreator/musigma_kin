from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from backend.database import create_user, get_user_by_email
from backend.security import create_access_token, get_current_user, hash_password, verify_password

router = APIRouter(prefix="/auth", tags=["Authentication"])


class UserSignup(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None
    name: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


@router.post("/signup", response_model=Token)
def signup(payload: UserSignup):
    existing_user = get_user_by_email(payload.email.lower())
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    resolved_name = (payload.full_name or payload.name or "").strip()
    if not resolved_name:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="full_name (or name) is required"
        )

    if len(payload.password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 6 characters long"
        )

    hashed = hash_password(payload.password)
    user = create_user(payload.email.lower(), resolved_name, hashed)

    access_token = create_access_token(data={"sub": user["id"]})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.post("/login", response_model=Token)
def login(payload: UserLogin):
    user = get_user_by_email(payload.email.lower())
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_resp = {k: v for k, v in user.items() if k != "hashed_password"}
    access_token = create_access_token(data={"sub": user_resp["id"]})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_resp,
    }


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {"user": {k: v for k, v in current_user.items() if k != "hashed_password"}}
