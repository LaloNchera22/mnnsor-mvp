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

# --- ESTILOS CSS (DISEÑO VISUAL AVANZADO) ---
st.markdown("""
<style>
    /* 1. Fondo Negro Total y Texto Blanco */
    .stApp {
        background-color: #000000;
        color: #FFFFFF;
    }
    
    /* 2. Ocultar elementos estándar de Streamlit */
    header {visibility: hidden;}
    footer {visibility: hidden;}
    
    /* 3. Títulos y Textos */
    .header-text {
        font-family: 'Helvetica', sans-serif;
        font-size: 14px;
        color: #E0E0E0;
        letter-spacing: 1px;
    }
    .prometeo-title {
        text-align: right;
        font-family: 'Helvetica', sans-serif;
        font-size: 16px;
        letter-spacing: 2px;
        color: #FFFFFF;
    }
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

    /* 4. ESTILOS DE LA BARRA DE ENTRADA (CÁPSULA BLANCA) */
    .stTextInput input {
        background-color: #FFFFFF !important;
        color: #000000 !important;
        border-radius: 50px; /* Bordes redondos */
        padding: 10px 20px;
        border: none;
        height: 50px; /* Altura fija para alinear con botón */
    }
    
    /* Color del texto de "Ayuda" (Placeholder) */
    ::placeholder {
        color: #666666 !important;
        opacity: 1; 
        font-weight: 500;
    }

    /* 5. ESTILO DEL BOTÓN "ENVIAR" */
    /* Lo hacemos blanco o de acento para que resalte */
    div.stButton > button {
        background-color: #333333;
        color: white;
        border-radius: 50px;
        border: 1px solid #555555;
        height: 50px;
        width: 100%;
        font-weight: bold;
    }
    div.stButton > button:hover {
        background-color: #555555;
        color: white;
        border-color: #FFFFFF;
    }

    /* Ocultar etiquetas de inputs para limpieza visual */
    .stTextInput label { display: none; }
    
    /* Footer */
    .small-footer {
        position: fixed;
        bottom: 20px; width: 100%; text-align: center;
        color: #444444; font-size: 12px;
    }
    
    /* Ajuste para quitar espacios extra del formulario */
    .stForm {
        border: none;
        padding: 0;
    }
</style>
""", unsafe_allow_html=True)

# --- LÓGICA DE ESTADO (HISTORIAL) ---
if "messages" not in st.session_state:
    st.session_state.messages = []

# --- PANTALLA DE INICIO (HOME) ---
def show_landing_page():
    # 1. Header
    col1, col2 = st.columns([1, 1])
    with col1:
        st.markdown('<p class="header-text">✖ MNNSOR</p>', unsafe_allow_html=True)
    with col2:
        st.markdown('<p class="prometeo-title">PROMETEO</p>', unsafe_allow_html=True)

    # Espacio vertical para centrar
    st.write("")
    st.write("")
    st.write("") 
    st.write("") 

    # 2. Título Central
    st.markdown('<div style="text-align: left; margin-top: 50px;">', unsafe_allow_html=True)
    st.markdown('<p class="big-title">HOLA.</p>', unsafe_allow_html=True)
    st.markdown('<p class="subtitle">¿QUÉ QUIERES CONSTRUIR?</p>', unsafe_allow_html=True)
    st.markdown('</div>', unsafe_allow_html=True)

    # 3. FORMULARIO DE ENTRADA (Input + Botón)
    # Usamos st.form para que ENTER funcione nativamente
    with st.form(key='search_form', clear_on_submit=True):
        # Columnas para poner la barra y el botón pegados
        c_input, c_btn = st.columns([5, 1]) 
        
        with c_input:
            # El input principal
            query = st.text_input(
                label="search", 
                placeholder="PREGUNTA A PROMETEO (Escribe aquí...)", 
                label_visibility="collapsed"
            )
            
        with c_btn:
            # El botón de enviar
            submitted = st.form_submit_button("ENVIAR ➤")

        # LÓGICA DE ENVÍO
        # Si se presiona el botón O se da Enter en el input, 'submitted' será True
        if submitted and query:
            st.session_state.messages.append({"role": "user", "content": query})
            # Respuesta simulada rápida para transición
            st.session_state.messages.append({"role": "assistant", "content": f"Entendido. Analizando solicitud sobre: '{query}'..."})
            st.rerun()

    # Footer
    st.markdown('<p class="small-footer">Plataforma de AI para construcción por MNNSOR.</p>', unsafe_allow_html=True)


# --- PANTALLA DE CHAT (RESULTADOS) ---
def show_chat_interface():
    # Header pequeño
    c1, c2 = st.columns([1, 1])
    with c1: st.markdown('<p class="header-text">✖ MNNSOR</p>', unsafe_allow_html=True)
    with c2: st.markdown('<p class="prometeo-title">PROMETEO</p>', unsafe_allow_html=True)
    st.divider()

    # Historial de Chat
    for message in st.session_state.messages:
        avatar = "👤" if message["role"] == "user" else "🏗️"
        with st.chat_message(message["role"], avatar=avatar):
            st.markdown(message["content"])

    # Input Flotante (Abajo) para seguir conversando
    if prompt := st.chat_input("Escribe tu consulta..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user", avatar="👤"):
            st.markdown(prompt)

        # RESPUESTA DE LA IA (Simulación)
        with st.chat_message("assistant", avatar="🏗️"):
            message_placeholder = st.empty()
            full_response = ""
            # --- AQUÍ CONECTAS TU LLM REAL ---
            assistant_text = "Aquí tienes la información sobre tu proyecto de construcción. ¿Deseas ver los planos o el presupuesto?"
            
            for chunk in assistant_text.split():
                full_response += chunk + " "
                time.sleep(0.05)
                message_placeholder.markdown(full_response + "▌")
            message_placeholder.markdown(full_response)
        
        st.session_state.messages.append({"role": "assistant", "content": full_response})

# --- CONTROLADOR ---
if not st.session_state.messages:
    show_landing_page()
else:
    show_chat_interface()
