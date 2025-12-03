// lib/chat-responses.ts - VERSIÓN FINAL SIN LOGIN
export async function getChatResponse(query: string): Promise<string> {
  try {
    const chatResponse = await fetch("http://127.0.0.1:8080/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: query,
      }),
    });

    if (!chatResponse.ok) {
        // Si el servidor da un 500, capturamos el error detallado que enviamos
        const errorData = await chatResponse.json();
        if(errorData.response) return `Error del servidor: ${errorData.response}`; 
        return "Error al procesar la pregunta. El servidor no respondió correctamente.";
    }

    const chatData = await chatResponse.json();
    
    // Si el backend devuelve un mensaje de error técnico, lo mostramos
    if (chatData.response.includes("Error técnico")) {
        return chatData.response;
    }

    return chatData.response;

  } catch (error) {
    console.error("Error de conexión:", error);
    return "Error de conexión: ¿Está encendido el backend en 8080? (Verifica la terminal negra)";
  }
}