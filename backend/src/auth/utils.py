from datetime import datetime, timedelta
from typing import Optional

from jose import jwt

from src.models import Usuario

# Reuse same secret/alg as dependencies.py
SECRET_KEY = "a-string-secret-at-least-256-bits-long"
ALGORITHM = "HS256"

# Import bcrypt conditionally to avoid static analysis warnings when not installed
try:
    import bcrypt  # type: ignore
except Exception:  # pragma: no cover
    bcrypt = None


def get_user_by_email(db, email: str) -> Optional[Usuario]:
    return db.query(Usuario).filter(Usuario.correo == email).first()


def verify_password(plain_password: str, stored_password: str) -> bool:
    """
    Intenta verificar la contraseña contra el valor almacenado.
    - Si el paquete `bcrypt` está disponible, lo usa.
    - Como fallback (por compatibilidad con datos de ingestión), acepta
      comparaciones planas o el patrón observado en la base de datos
      (por ejemplo: '$2a$12$Generico123'). Esto permite que las cuentas
      insertadas manualmente en desarrollo funcionen.
    """
    try:
        if bcrypt:
            # stored_password debe ser el hash completo
            return bcrypt.checkpw(plain_password.encode(), stored_password.encode())
    except Exception:
        pass
    # Fallbacks razonables para ambientes de desarrollo
    if stored_password == plain_password:
        return True
    # Patrón observado: se guardó '$2a$12$' + contraseña literal
    if stored_password.startswith("$2") and stored_password.endswith(plain_password):
        return True
    return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=60)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
