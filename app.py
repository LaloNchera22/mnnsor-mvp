import streamlit as st
from openai import OpenAI
from dotenv import load_dotenv
import os

# 1. Configuración de página
st.set_page_config(page_title="MNNSOR | Prometeo", page_icon="🏗️")

# 2. Cargar llaves
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

# 3. Título e intro
st.title("🏗️ MNNSOR - PROMETEO")
st.write("Sistema de Inteligencia Artificial para Construcción")

# 4. Inicializar el cliente de OpenAI
client = OpenAI(api_key=api_key)

# 5. Memoria del chat (Para que no olvide lo que hablan)
if "messages" not in st.session_state:
    st.session_state.messages = []

# 6. Mostrar mensajes anteriores en la pantalla
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# 7. CAJA DE TEXTO (Donde tú escribes)
if prompt := st.chat_input("Escribe tu consulta aquí..."):
    
    # A. Mostrar tu mensaje
    with st.chat_message("user"):
        st.markdown(prompt)
    
    # B. Guardar tu mensaje en memoria
    st.session_state.messages.append({"role": "user", "content": prompt})

    # C. Generar respuesta de la IA
    with st.chat_message("assistant"):
        stream = client.chat.completions.create(
            model="gpt-4o", # O usa "gpt-3.5-turbo" si quieres ahorrar
            messages=[
                {"role": "system", "content": "Eres Prometeo, un ingeniero experto en construcción. Responde de forma técnica y directa."},
                *st.session_state.messages
            ],
            stream=True,
        )
        response = st.write_stream(stream)
    
    # D. Guardar respuesta de la IA en memoria
    st.session_state.messages.append({"role": "assistant", "content": response})