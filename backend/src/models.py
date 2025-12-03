from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from src.database import Base

# ----------------------------------------------------------
# Módulo de Usuarios y Roles
# ----------------------------------------------------------

class TipoUsuario(Base):
    __tablename__ = "tipos_usuario"

    id_tipo = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), nullable=False)
    descripcion = Column(Text)

    # Relación inversa (opcional, para acceder a usuarios desde el tipo)
    usuarios = relationship("Usuario", back_populates="tipo_usuario")

class Usuario(Base):
    __tablename__ = "usuarios"

    id_usuario = Column(Integer, primary_key=True, index=True)
    codigo_uni = Column(String(15), unique=True)
    nombre_completo = Column(String(150), nullable=False)
    correo = Column(String(100), unique=True, nullable=False)
    contrasenia = Column(String(255), nullable=False)
    estado = Column(Boolean, default=True)
    id_tipo_usuario = Column(Integer, ForeignKey("tipos_usuario.id_tipo"))
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    tipo_usuario = relationship("TipoUsuario", back_populates="usuarios")
    chats = relationship("Chat", back_populates="usuario")

# ----------------------------------------------------------
# Módulo Core del Chatbot (RAG & Historial)
# ----------------------------------------------------------

class SistemaChatbot(Base):
    __tablename__ = "sistema_chatbot"

    id_config = Column(Integer, primary_key=True, index=True)
    api_key_ref = Column(String(255))
    modelo_ia = Column(String(50), default='gemini-1.5-flash')
    contexto_global = Column(Text)

class Chat(Base):
    __tablename__ = "chats"

    id_chat = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    titulo = Column(String(100), default='Nueva conversación')
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    fecha_ult_mens = Column(DateTime(timezone=True), server_default=func.now())
    estado_chat = Column(String(20), default='activo') # activo, archivado, cerrado

    # Relaciones
    usuario = relationship("Usuario", back_populates="chats")
    consultas = relationship("Consulta", back_populates="chat", cascade="all, delete-orphan")

class Consulta(Base):
    __tablename__ = "consultas"

    id_mensaje = Column(Integer, primary_key=True, index=True)
    id_chat = Column(Integer, ForeignKey("chats.id_chat"))
    contenido = Column(Text, nullable=False)
    fecha_enviado = Column(DateTime(timezone=True), server_default=func.now())
    tokens_usados = Column(Integer, default=0)

    # Relaciones
    chat = relationship("Chat", back_populates="consultas")
    respuestas = relationship("Respuesta", back_populates="consulta", cascade="all, delete-orphan")

class Respuesta(Base):
    __tablename__ = "respuestas"

    id_respuesta = Column(Integer, primary_key=True, index=True)
    id_consulta = Column(Integer, ForeignKey("consultas.id_mensaje"))
    contenido = Column(Text, nullable=False)
    fecha_generado = Column(DateTime(timezone=True), server_default=func.now())
    estado = Column(String(20), default='generada') # generada, editada

    # Relaciones
    consulta = relationship("Consulta", back_populates="respuestas")

# ----------------------------------------------------------
# Módulo de Gestión de Conocimiento (Fuentes)
# ----------------------------------------------------------

class FuenteInformacion(Base):
    __tablename__ = "fuentes_de_informacion"

    id_fuente = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(150))
    tipo_origen = Column(String(50), default='manual')
    descripcion = Column(Text)
    autor = Column(String(100))
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

    # Relación
    preguntas_frecuentes = relationship("PreguntaFrecuente", back_populates="fuente")

class PreguntaFrecuente(Base):
    __tablename__ = "preguntas_frecuentes"

    id_pregunta = Column(Integer, primary_key=True, index=True)
    pregunta = Column(String(255), nullable=False)
    respuesta = Column(Text, nullable=False)
    categoria = Column(String(50))
    id_fuente = Column(Integer, ForeignKey("fuentes_de_informacion.id_fuente"))

    # Relación
    fuente = relationship("FuenteInformacion", back_populates="preguntas_frecuentes")

# ----------------------------------------------------------
# Módulo Académico y Administrativo
# ----------------------------------------------------------

class Ubicacion(Base):
    __tablename__ = "ubicaciones"

    id_ubicacion = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    tipo = Column(String(50), nullable=False)
    pabellon = Column(String(50))
    piso = Column(String(10))
    descripcion = Column(Text)
    referencia_llegada = Column(Text)
    imagen_url = Column(String(255))

class Docente(Base):
    __tablename__ = "docentes"

    id_docente = Column(Integer, primary_key=True, index=True)
    nombres_completos = Column(String(200), nullable=False)
    correo_institucional = Column(String(100))
    especialidad = Column(String(150))
    grado_academico = Column(String(50), default='Docente')
    foto_url = Column(String(255))

    # Relación con cursos a través de la tabla intermedia
    info_cursos = relationship("DocenteCursoInfo", back_populates="docente")

class Curso(Base):
    __tablename__ = "cursos"

    codigo_curso = Column(String(15), primary_key=True, index=True) # Nota: PK es String aquí
    nombre = Column(String(150), nullable=False)
    ciclo_sugerido = Column(Integer)

    # Relación
    info_docentes = relationship("DocenteCursoInfo", back_populates="curso")

class DocenteCursoInfo(Base):
    __tablename__ = "docente_curso_info"

    id_detalle = Column(Integer, primary_key=True, index=True)
    id_docente = Column(Integer, ForeignKey("docentes.id_docente"))
    codigo_curso = Column(String(15), ForeignKey("cursos.codigo_curso"))
    metodologia = Column(Text)
    consejos = Column(Text)
    estado_validacion = Column(String(20), default='pendiente')
    fecha_registro = Column(DateTime(timezone=True), server_default=func.now())

    # Relaciones
    docente = relationship("Docente", back_populates="info_cursos")
    curso = relationship("Curso", back_populates="info_docentes")

class Tramite(Base):
    __tablename__ = "tramites"

    id_tramite = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(150), nullable=False)
    descripcion_general = Column(Text)
    pasos_guia = Column(Text)
    plataforma_asociada = Column(String(50))
    enlace_externo = Column(String(255))