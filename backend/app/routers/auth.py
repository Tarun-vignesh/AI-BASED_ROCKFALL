from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.schemas.auth import UserRegister, UserLogin, Token
from app.schemas.user import UserResponse
from app.services.auth_service import register_user, authenticate_user
from app.core.security import decode_token
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    payload = decode_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.id == payload["sub"]).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user


@router.post("/register", response_model=UserResponse, summary="Register new user")
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    return register_user(db, user_in)


@router.post("/login", response_model=Token, summary="User Login (JSON)")
def login_json(credentials: UserLogin, db: Session = Depends(get_db)):
    return authenticate_user(db, credentials)


@router.post("/token", response_model=Token, summary="OAuth2 compatible token endpoint")
def login_oauth(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    credentials = UserLogin(email=form_data.username, password=form_data.password)
    return authenticate_user(db, credentials)


@router.get("/me", response_model=UserResponse, summary="Get current logged in user")
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout", summary="Logout current user")
def logout():
    return {"message": "Successfully logged out"}
