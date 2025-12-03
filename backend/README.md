# FastAPI Gemini AI & Financial Data API

Una API FastAPI que integra Gemini AI con análisis de datos financieros desde PostgreSQL. Incluye autenticación JWT, limitación de tasa (rate limiting) y endpoints protegidos.

---

## 📋 Requisitos Previos

- **Python 3.11+** instalado
- **PostgreSQL 12+** instalado y corriendo en `localhost:5432`
- **pip** y **virtualenv** (incluidos con Python)
- (Opcional) **pgAdmin** o **psql** para gestionar la BD

---

## 🚀 Instalación y Configuración

### Paso 1: Crear y Activar Entorno Virtual (Windows PowerShell)

```powershell
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
.\venv\Scripts\Activate.ps1

# Si PowerShell bloquea ejecución de scripts:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
```

### Paso 2: Instalar Dependencias

```powershell
# Actualizar pip
python -m pip install --upgrade pip

# Instalar dependencias del proyecto
python -m pip install -r requirements.txt
```

### Paso 3: Configurar Base de Datos PostgreSQL

#### Opción A: Crear BD y usuario desde PowerShell (recomendado)

Reemplaza `myappuser` y `mipass123` con credenciales seguras que elijas.

```powershell
# Crear base de datos
psql -h localhost -U postgres -p 5432 -c "CREATE DATABASE InnovaIA;"

# Crear usuario y contraseña
psql -h localhost -U postgres -p 5432 -c "CREATE USER myappuser WITH PASSWORD 'mipass123';"

# Conceder permisos
psql -h localhost -U postgres -p 5432 -c "GRANT ALL PRIVILEGES ON DATABASE InnovaIA TO myappuser;"
```

Te pedirá la contraseña del usuario `postgres` (superusuario).

#### Opción B: Usar pgAdmin (interfaz gráfica)

1. Abre pgAdmin
2. Conecta al servidor PostgreSQL
3. Crea una nueva BD llamada `InnovaIA`
4. Crea un nuevo usuario `myappuser` con contraseña `mipass123`
5. Asigna permisos sobre la BD

### Paso 4: Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```
# Base de Datos PostgreSQL
DATABASE_URL=postgresql+psycopg2://myappuser:mipass123@localhost:5432/InnovaIA

# Seguridad JWT
SECRET_KEY=tu_clave_secreta_larga_y_aleatoria_aqui

# API Key de Google Gemini (opcional, solo si usas endpoints /chat)
GOOGLE_API_KEY=tu_api_key_de_google_aqui

# (Opcional) Usuarios demo para pruebas
DEMO_USERNAME=demo
DEMO_PASSWORD=demo
```

**Notas sobre `.env`:**
- Si tu contraseña contiene caracteres especiales (`@`, `:`, etc.), URL-encódealos o pónla entre comillas.
- El archivo `.env` NO se debe commitir a Git (ya está en `.gitignore`).

### Paso 5: Inicializar Tablas y Datos de Ejemplo

```powershell
# Asegúrate de que el venv esté activado
.\venv\Scripts\Activate.ps1

# Ejecutar script de inicialización
python scripts/init_db.py
```

**Salida esperada:**
```
Intentando conectar a la base de datos: postgresql+psycopg2://myappuser:mipass123@localhost:5432/InnovaIA
Creando tablas (si no existen)...
Tablas creadas.
Insertando datos de ejemplo si las tablas están vacías...
- Añadido 1 registro a 'datos_financieros'.
- Añadido 1 registro a 'umbral_alerta'.
- Añadido 1 registro a 'predicciones'.
Datos de ejemplo insertados (si aplicó).
Inicialización completada.
```

---

## ▶️ Cómo Ejecutar

### Iniciar el servidor FastAPI

```powershell
# Asegúrate de que el venv esté activado
.\venv\Scripts\Activate.ps1

# Iniciar uvicorn con recarga automática
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```

**Salida esperada:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete
```

El API estará disponible en `http://127.0.0.1:8000`.

---

## 🧪 Pruebas en Swagger (Recomendado)

### Acceder a la Documentación Interactiva

1. Abre tu navegador en: **`http://127.0.0.1:8000/docs`** (Swagger UI)
   - O alternativamente: `http://127.0.0.1:8000/redoc` (ReDoc)

### Flujo de Prueba Recomendado

#### 1️⃣ Obtener Token JWT (Autenticación)

- Navega a la sección **`POST /auth/token`** en Swagger
- Haz clic en **"Try it out"**
- Ingresa las credenciales:
  - **username:** `demo`
  - **password:** `demo`
- Haz clic en **"Execute"**
- Copia el valor de `access_token` de la respuesta

#### 2️⃣ Usar el Token en Endpoints Protegidos

- En Swagger, haz clic en el botón **"Authorize"** (esquina superior derecha)
- En el campo **"Bearer (HTTP Bearer authentication)"**, pega: `Bearer <tu_token>`
- Haz clic en **"Authorize"** para guardar

#### 3️⃣ Probar Endpoints

**GET `/`** (sin autenticación)
- Devuelve: `{"message":"API está funcionando"}`

**POST `/chat`** (con autenticación)
- Ingresa un prompt (ej: `"Hola, ¿cómo estás?"`)
- El servidor responde con la IA

**POST `/financial-ai-query`** (requiere autenticación + BD)
- Ingresa una consulta (ej: `"¿Cuál es el saldo final del día?"`)
- La IA analiza datos de la BD y responde

---

## 📊 Estructura del Proyecto

```
src/
├── main.py                 # Aplicación FastAPI principal
├── database.py             # Configuración de SQLAlchemy y conexión a BD
├── models.py               # Modelos ORM (DatoFinanciero, UmbralAlerta, Prediccion)
├── ai/
│   ├── base.py            # Interfaz AIPlatform
│   └── gemini.py          # Implementación para Google Gemini
├── auth/
│   ├── auth_router.py     # Router de autenticación y endpoint /token
│   ├── auth_untils.py     # Funciones JWT y hashing de contraseñas
│   ├── dependencies.py    # Dependencia get_user_identifier
│   └── throttling.py      # Rate limiting (limitación de tasa)
└── prompts/
    ├── system_prompt.md   # Prompt del sistema para Gemini
    └── response_prompt.md # Prompt de respuesta (opcional)

scripts/
├── init_db.py            # Script para crear tablas e insertar datos

requirements.txt          # Dependencias de Python
.env                      # Variables de entorno (NO commitir a Git)
README.md                 # Este archivo
```

---

## 🔐 Autenticación y Rate Limiting

### Autenticación JWT

- El endpoint `/auth/token` genera un token JWT usando credenciales demo (`demo:demo`)
- Los tokens expiran en **30 minutos**
- El token debe incluirse en el header `Authorization: Bearer <token>` para endpoints protegidos

### Limitación de Tasa (Rate Limiting)

- **Usuarios no autenticados:** 3 peticiones por 60 segundos
- **Usuarios autenticados:** 5 peticiones por 60 segundos
- Si alcanzas el límite, recibirás un error `429 Too Many Requests`

**Para ajustar los límites**, edita `src/auth/throttling.py`:
```python
GLOBAL_RATE_LIMIT = 3           # Cambiar límite global
AUTH_RATE_LIMIT = 5             # Cambiar límite autenticados
GLOBAL_TIME_WINDOW_SECONDS = 60 # Cambiar ventana de tiempo
```

---

## 🛠️ Troubleshooting (Solución de Problemas)

### Error: `psycopg2._psycopg` no encontrado
**Solución:** Asegúrate de que `psycopg2-binary` esté instalado:
```powershell
python -m pip install psycopg2-binary
```

### Error: "could not connect to server: Connection refused"
**Solución:** Verifica que PostgreSQL está corriendo:
```powershell
Get-Service | Where-Object Name -Match 'postgres'
```

### Error: "authentication failed for user"
**Solución:** Verifica credenciales en `.env`:
```powershell
psql -h localhost -U myappuser -d InnovaIA
```

### Error: `429 Too Many Requests`
**Solución:** Usa autenticación (obtén un token) para aumentar el límite, o reinicia el servidor para limpiar contadores.

### Error: Archivo `.env` no cargado
**Solución:** Asegúrate de que `python-dotenv` esté instalado:
```powershell
python -m pip install python-dotenv
```

---

## 📖 Endpoints Principales

### Autenticación
- **POST `/auth/token`** - Obtener JWT token (credenciales: `demo:demo`)

### Chat General
- **POST `/chat`** - Enviar mensaje a la IA (rate-limited)
- **GET `/`** - Verificar que la API está funcionando

### Análisis Financiero (requiere autenticación)
- **POST `/financial-ai-query`** - Consultar datos financieros con IA

---

## 🔧 Configuración Avanzada

### Usar SQLite para Desarrollo Sin PostgreSQL

Si no tienes PostgreSQL disponible, la app crea automáticamente un fallback a SQLite (`./dev.db`). Sin embargo, para usar PostgreSQL:

1. Verifica que PostgreSQL está corriendo
2. Crea la BD y usuario (pasos 3-4 arriba)
3. Configura `.env` con `DATABASE_URL` correcta
4. Ejecuta `python scripts/init_db.py`

### Cambiar Esquema de Hashing de Contraseñas

Por defecto usamos `pbkdf2_sha256`. Si deseas cambiar a `bcrypt`:

```python
# En src/auth/auth_untils.py
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
```

Esto requiere instalar el backend de bcrypt:
```powershell
python -m pip install bcrypt
```

---

## 📝 Ejemplo Completo: Desde 0 Hasta Pruebas

```powershell
# 1. Crear y activar venv
python -m venv venv
.\venv\Scripts\Activate.ps1

# 2. Instalar dependencias
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# 3. Crear BD y usuario en PostgreSQL
psql -h localhost -U postgres -p 5432 -c "CREATE DATABASE InnovaIA;"
psql -h localhost -U postgres -p 5432 -c "CREATE USER myappuser WITH PASSWORD 'mipass123';"
psql -h localhost -U postgres -p 5432 -c "GRANT ALL PRIVILEGES ON DATABASE InnovaIA TO myappuser;"

# 4. Crear .env
@"
DATABASE_URL=postgresql+psycopg2://myappuser:mipass123@localhost:5432/InnovaIA
SECRET_KEY=tu_clave_secreta_larga_aqui
GOOGLE_API_KEY=tu_api_key_aqui
DEMO_USERNAME=demo
DEMO_PASSWORD=demo
"@ | Out-File -Encoding utf8 .env

# 5. Inicializar tablas
python scripts/init_db.py

# 6. Iniciar servidor
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port 8000

# 7. Abrir Swagger en navegador
start http://127.0.0.1:8000/docs
```

---

## 📧 Soporte

Si encuentras problemas, verifica:
1. El archivo `.env` existe en la raíz del proyecto
2. PostgreSQL está corriendo y accesible
3. Las credenciales en `.env` son correctas
4. El `venv` está activado antes de ejecutar cualquier comando

---

## 📄 Licencia

Este proyecto es de código abierto y disponible bajo la licencia MIT.
