import streamlit as st
from openai import OpenAI
from dotenv import load_dotenv
import os

# --- CONFIGURACIÓN DE PÁGINA ---
st.set_page_config(
    page_title="Prometeo | MNNSOR",
    page_icon="🏗️",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# --- ESTILOS CSS (EL DISEÑO VISUAL) ---
# Esto hace la magia del fondo negro, letras blancas y el input redondo
st.markdown("""
<style>
    /* Fondo Negro Total y Texto Blanco */
    .stApp {
        background-color: #000000;
        color: #FFFFFF;
    }
    
    /* Eliminar barra superior de Streamlit y footer */
    header {visibility: hidden;}
    footer {visibility: hidden;}
    
    /* Estilo del Header (Logo y Nombre) */
    .header-text {
        font-family: 'Helvetica', sans-serif;
        font-size: 14px;
        font-weight: 400;
        color: #E0E0E0;
        letter-spacing: 1px;
    }
    
    .prometeo-title {
        text-align: right;
        font-family: 'Helvetica', sans-serif;
        font-size: 16px;
        font-weight: 300;
        letter-spacing: 2px;
        color: #FFFFFF;
    }

    /* Estilo del Título Central (HOLA...) */
    .big-title {
        font-size: 60px;
        font-weight: 700;
        color: #FFFFFF;
        margin-bottom: 0px;
        line-height: 1.1;
    }
    
    .subtitle {
        font-size: 40px;
        font-weight: 300;
        color: #FFFFFF;
        margin-bottom: 40px;
    }

    /* Estilo Personalizado para el Input (La cápsula blanca) */
    /* Esto redondea el input de texto y lo pone blanco con letras negras */
    .stTextInput input {
        background-color: #FFFFFF !important;
        color: #000000 !important;
        border-radius: 50px;
        padding: 15px 20px;
        border: none;
    }
    
    /* Ocultar etiqueta del input */
    .stTextInput label {
        display: none;
    }

    /* Footer pequeño */
    .small-footer {
        position: fixed;
        bottom: 20px;
        width: 100%;
        text-align: center;
        color: #666666;
        font-size: 12px;
    }
    
</style>
""", unsafe_allow_html=True)

# --- LÓGICA DE ESTADO (HISTORIAL) ---
if "messages" not in st.session_state:
    st.session_state.messages = []

# --- FUNCIÓN: PANTALLA DE INICIO (Diseño de tu imagen) ---
def show_landing_page():
    # 1. Header (Simulado con Columnas)
    col1, col2 = st.columns([1, 1])
    with col1:
        # Aquí puedes poner st.image("logo.png", width=100)
        st.markdown('<p class="header-text">✖ MNNSOR</p>', unsafe_allow_html=True)
    with col2:
        st.markdown('<p class="prometeo-title">PROMETEO</p>', unsafe_allow_html=True)

    # 2. Espacio vertical para centrar
    st.write("")
    st.write("")
    st.write("") # Ajusta cantidad de espacios según tu pantalla
    
    # 3. Título Central
    st.markdown('<div style="text-align: left; margin-top: 100px;">', unsafe_allow_html=True)
    st.markdown('<p class="big-title">HOLA.</p>', unsafe_allow_html=True)
    st.markdown('<p class="subtitle">¿QUE QUIERES CONSTRUIR?</p>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

    # 4. Input Central (La cápsula)
    query = st.text_input("Pregunta a Prometeo", placeholder="PREGUNTA A PROMETEO", key="landing_input")
    
    # 5. Footer
    st.markdown('<p class="small-footer">Plataforma de AI para construcción.</p>', unsafe_allow_html=True)

    # Lógica: Si el usuario escribe algo, guardarlo y recargar para pasar al chat
    if query:
        st.session_state.messages.append({"role": "user", "content": query})
        # Generar respuesta simulada o conectar tu AI aquí
        # Por ahora simularemos una respuesta rápida para probar
        response = f"Entendido, vamos a trabajar en: {query}. ¿Necesitas un reporte o un presupuesto?"
        st.session_state.messages.append({"role": "assistant", "content": response})
        st.rerun()

# --- FUNCIÓN: INTERFAZ DE CHAT (Después de la primera pregunta) ---
def show_chat_interface():
    # Header simple
    col1, col2 = st.columns([1, 1])
    with col1:
        st.markdown('<p class="header-text">✖ MNNSOR</p>', unsafe_allow_html=True)
    with col2:
        st.markdown('<p class="prometeo-title">PROMETEO</p>', unsafe_allow_html=True)

    st.divider() # Una línea sutil para separar header del chat

    # Mostrar historial
    for message in st.session_state.messages:
        # Aquí mantenemos los iconos que pediste
        avatar = "👤" if message["role"] == "user" else "🏗️" # Icono de Prometeo
        with st.chat_message(message["role"], avatar=avatar):
            st.markdown(message["content"])

    # Input del Chat (Fijo abajo)
    if prompt := st.chat_input("Escribe tu consulta..."):
        # 1. Mostrar mensaje usuario
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user", avatar="👤"):
            st.markdown(prompt)

        # 2. Respuesta de la IA (Simulada - AQUÍ CONECTAS TU LÓGICA REAL)
        with st.chat_message("assistant", avatar="🏗️"):
            message_placeholder = st.empty()
            full_response = ""
            # Simulación de "escribiendo"
            assistant_response = "Estoy procesando tu solicitud sobre construcción..." 
            
            for chunk in assistant_response.split():
                full_response += chunk + " "
                time.sleep(0.05)
                message_placeholder.markdown(full_response + "▌")
            message_placeholder.markdown(full_response)
        
        st.session_state.messages.append({"role": "assistant", "content": full_response})

# --- CONTROLADOR PRINCIPAL ---
# Si no hay mensajes, muestra la portada (tu diseño). Si hay mensajes, muestra el chat.
if not st.session_state.messages:
    show_landing_page()
else:
    show_chat_interface()
