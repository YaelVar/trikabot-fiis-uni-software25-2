import os
from dotenv import load_dotenv
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware # Agregado para el permiso
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import text, inspect
from .ai.gemini import Gemini
# from .auth.dependencies import get_user_identifier # Descomentar cuando agregues login
# from .auth.throttling import apply_rate_limit # Descomentar cuando agregues limitación de tasa
from .database import get_db, engine, Base
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from src.auth.utils import get_user_by_email, verify_password, create_access_token
from .models import Ubicacion, Usuario
from .models import Docente, DocenteCursoInfo


load_dotenv()

# --- App Initialization ---
app = FastAPI()

# 1. PERMISOS CORS (NECESARIO para que el frontend hable)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Base.metadata.create_all(bind=engine) # Descomenta si usas modelos

# --- Funciones de Carga de Prompts ---

def get_dynamic_schema(engine):
    inspector = inspect(engine)
    schema_string = ""
    table_names = inspector.get_table_names()
    for table_name in table_names:
        if table_name.startswith('pg_') or table_name.startswith('sql_'):
            continue
        schema_string += f"TABLE: {table_name}\n"
        columns = inspector.get_columns(table_name)
        for column in columns:
            schema_string += f"  - {column['name']} ({column['type']})\n"
        fks = inspector.get_foreign_keys(table_name)
        if fks:
            schema_string += "  FOREIGN KEYS:\n"
            for fk in fks:
                schema_string += f"    - {fk['constrained_columns']} -> {fk['referred_table']}({fk['referred_columns']})\n"
        schema_string += "\n"
    return schema_string

def load_system_prompt():
    try:
        with open("src/prompts/system_prompt.md", "r") as f:
            return f.read()
    except FileNotFoundError:
        # Esto detendrá la app si no se encuentra, lo cual es bueno.
        print("Error: 'src/prompts/system_prompt.md' no encontrado.")
        raise
        
# --- 1. FUNCIÓN MODIFICADA: Sin plantilla de respaldo ---
def load_response_prompt():
    """
    Carga la plantilla de prompt de respuesta.
    Si el archivo no existe, la aplicación fallará al iniciar.
    """
    try:
        with open("src/prompts/response_prompt.md", "r") as f:
            return f.read()
    except FileNotFoundError:
        print("Error: 'src/prompts/response_prompt.md' no encontrado.")
        raise # Vuelve a lanzar el error para detener la app

# --- AI & Schema Configuration (Se ejecuta al inicio) ---
system_prompt = load_system_prompt()
gemini_api_key = os.getenv("GEMINI_API_KEY")
if not gemini_api_key:
    raise ValueError("GEMINI_API_KEY environment variable not set.")
ai_platform = Gemini(api_key=gemini_api_key, system_prompt=system_prompt)

print("Generando schema dinámico de la base de datos...")
DATABASE_SCHEMA = get_dynamic_schema(engine)
print("--- Schema Detectado ---")
print(DATABASE_SCHEMA)
print("------------------------")

# --- 2. CARGAMOS EL NUEVO TEMPLATE ---
# Si el archivo no existe, la app se detendrá aquí.
response_prompt_template = load_response_prompt()


# --- Pydantic Models ---
class ChatRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    response: str


class RegistrationRequest(BaseModel):
    fullName: str
    studentCode: str
    career: str
    semester: str | None = None
    phone: str | None = None
    email: str
    password: str


# --- API Endpoints ---
# RUTA CHAT (SIN LOGIN TEMPORALMENTE)
@app.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest, 
    # user_id: str = Depends(get_user_identifier), # COMENTADO: Desactivamos el login
    db: Session = Depends(get_db)
):
    print("--- [DEBUG] INICIO DEL CHAT ---")
    # print(f"--- [DEBUG] Usuario: {user_id}") # COMENTADO
    print(f"--- [DEBUG] Pregunta: {request.prompt}")
    
    # apply_rate_limit(user_id) # COMENTADO
    
    # --- PASO 1: Generar SQL ---
    print("--- [DEBUG] Paso 1: Generando SQL con Gemini...")
    prompt_para_sql = (
        "Eres un experto en PostgreSQL. Basado en el siguiente schema de base de datos:\n"
        f"<schema>{DATABASE_SCHEMA}</schema>\n"
        "Traduce la siguiente pregunta del usuario a una consulta SQL válida. "
        "Responde SÓLO con la consulta SQL, sin explicaciones ni comillas (```).\n"
        f"Pregunta del usuario: {request.prompt}"
    )

    try:
        sql_query = ai_platform.chat(prompt_para_sql).strip()
        sql_query = sql_query.replace("```sql", "").replace("```", "").replace(";", "").strip()
        print(f"--- [DEBUG] SQL Generado: {sql_query}")
    except Exception as e:
        print(f"--- [ERROR] Falló al generar SQL: {e}")
        return ChatResponse(response=f"ERROR TÉCNICO DETALLADO: Falló la IA. {str(e)}") # Devolvemos el error

    # --- PASO 2: Ejecutar SQL ---
    print("--- [DEBUG] Paso 2: Ejecutando en Base de Datos...")
    data_result = ""
    try:
        if not sql_query.upper().startswith("SELECT"):
            print("--- [ERROR] Intento de consulta no SELECT")
            raise ValueError("Operación no permitida. Solo se permiten consultas SELECT.")
        
        result = db.execute(text(sql_query + ";")).fetchall()
        data_result = str(result)
        print(f"--- [DEBUG] Datos obtenidos de BD: {data_result}")
        
    except Exception as e:
        print(f"--- [ERROR] Falló la Base de Datos: {e}")
        data_result = f"Error al ejecutar la consulta: {str(e)}"
        # AQUI FALLÓ LA CONEXIÓN: Si esto falla, el mensaje se va al frontend.

    # --- PASO 3: Generar Respuesta Final ---
    print("--- [DEBUG] Paso 3: Generando respuesta natural...")
    try:
        prompt_para_respuesta = response_prompt_template.format(
            pregunta_original=request.prompt,
            datos_sql=data_result
        )
        response_text = ai_platform.chat(prompt_para_respuesta)
        print("--- [DEBUG] ¡Respuesta generada con éxito!")
    except Exception as e:
        print(f"--- [ERROR] Falló al generar respuesta final: {e}")
        response_text = f"Lo siento, hubo un error interno procesando la respuesta final: {str(e)}"
    
    return ChatResponse(response=response_text)


@app.get("/")
async def root(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"message": "API is running", "db_status": "connected"}
    except Exception as e:
        return {"message": "API is running", "db_status": "error", "detail": str(e)}
    
@app.get("/api/locations")
def get_locations(db: Session = Depends(get_db)):
    # Consulta todas las ubicaciones en la base de datos
    locations = db.query(Ubicacion).all()
    return locations


@app.post("/api/register")
def register_user(payload: RegistrationRequest, db: Session = Depends(get_db)):
    # Validaciones básicas
    existing = db.query(Usuario).filter(Usuario.correo == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El correo ya está registrado")

    # Intentar hashear la contraseña con bcrypt si está disponible
    try:
        import bcrypt
        hashed = bcrypt.hashpw(payload.password.encode(), bcrypt.gensalt()).decode()
    except Exception:
        # Fallback (solo para entornos de desarrollo)
        hashed = payload.password
        print("WARNING: bcrypt no disponible. Almacenando contraseña en texto plano (solo dev).")

    # Creamos el usuario como tipo 2 (estudiante)
    new_user = Usuario(
        codigo_uni=payload.studentCode,
        nombre_completo=payload.fullName,
        correo=payload.email,
        contrasenia=hashed,
        estado=True,
        id_tipo_usuario=2,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generar token para uso inmediato en frontend
    token_data = {"sub": new_user.correo, "id_usuario": new_user.id_usuario, "id_tipo_usuario": new_user.id_tipo_usuario}
    access_token = create_access_token(token_data)

    return {"access_token": access_token, "token_type": "bearer", "role": "student", "email": new_user.correo, "name": new_user.nombre_completo, "id_tipo_usuario": new_user.id_tipo_usuario}


@app.get("/api/teachers")
def get_teachers(db: Session = Depends(get_db)):
    # Devuelve docentes con información agregada de cursos/metodología/consejos
    docentes = db.query(Docente).all()
    result = []
    for d in docentes:
        cursos = [info.codigo_curso for info in (d.info_cursos or []) if info.codigo_curso]
        metodos = [info.metodologia for info in (d.info_cursos or []) if info.metodologia]
        consejos = [info.consejos for info in (d.info_cursos or []) if info.consejos]
        validated = any((info.estado_validacion or '').lower() == 'validado' for info in (d.info_cursos or []))
        result.append({
            "id": d.id_docente,
            "name": d.nombres_completos,
            "email": d.correo_institucional,
            "specialty": d.especialidad or '',
            "courses": cursos,
            "methodology": '\n'.join(metodos) if metodos else '',
            "tips": '\n'.join(consejos) if consejos else '',
            "validated": validated,
            "status": "active",
        })
    return result


@app.post("/token")
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm usa el campo 'username' para el correo
    email = form_data.username
    password = form_data.password

    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.contrasenia):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

    # Generamos token con información mínima
    token_data = {"sub": user.correo, "id_usuario": user.id_usuario, "id_tipo_usuario": user.id_tipo_usuario}
    access_token = create_access_token(token_data)

    # Respondemos también con metadatos para que el frontend sepa la ruta a usar
    role = "admin" if user.id_tipo_usuario == 1 else "student"
    return {"access_token": access_token, "token_type": "bearer", "role": role, "email": user.correo, "name": user.nombre_completo, "id_tipo_usuario": user.id_tipo_usuario}