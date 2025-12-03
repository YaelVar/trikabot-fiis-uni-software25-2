"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Send, Bot, User, Plus, MessageSquare, Sparkles, Clock, TrendingUp } from "lucide-react"
import { getChatResponse } from "@/lib/chat-responses" // Conexión con el backend
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface Chat {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
  messages: Message[]
}

interface ChatInterfaceProps {
  user: { email: string; role: string; name: string }
}

export function ChatInterface({ user }: ChatInterfaceProps) {
  const [chats, setChats] = useState<Chat[]>([
    {
      id: "1",
      title: "Bienvenida",
      lastMessage: "¡Hola! Soy TRIKABOT...",
      timestamp: new Date(),
      messages: [
        {
          id: "1",
          role: "assistant",
          content:
            "¡Hola! Soy TRIKABOT, tu asistente virtual de FIIS-UNI conectado a la Base de Datos oficial.\n\nPuedo ayudarte con:\n• Ubicación de salones y laboratorios\n• Información de docentes\n• Trámites y Matrícula\n\n¿Qué deseas consultar?",
          timestamp: new Date(),
        },
      ],
    },
  ])
  const [currentChatId, setCurrentChatId] = useState("1")
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentChat = chats.find((c) => c.id === currentChatId)
  const messages = currentChat?.messages || []

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleNewChat = () => {
    const newChatId = Date.now().toString()
    const newChat: Chat = {
      id: newChatId,
      title: "Nueva conversación",
      lastMessage: "",
      timestamp: new Date(),
      messages: [
        {
          id: `${newChatId}-0`, 
          role: "assistant",
          content: "¡Hola! ¿En qué puedo ayudarte hoy?",
          timestamp: new Date(),
        },
      ],
    }
    setChats([newChat, ...chats])
    setCurrentChatId(newChat.id)
  }

  // --- LÓGICA DE ENVÍO CONECTADA AL BACKEND ---
  // --- LÓGICA DE ENVÍO CORREGIDA PARA HIDRATACIÓN ---
  const handleSend = async () => {
    if (!input.trim() || !currentChat) return

    const messageId = Date.now().toString() // Generar ID solo aquí
    const now = new Date()

    const userMessage: Message = {
      id: messageId,
      role: "user",
      content: input,
      timestamp: now,
    }

    // 1. Agregar mensaje del usuario inmediatamente
    const updatedChats = chats.map((chat) => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          messages: [...chat.messages, userMessage],
          lastMessage: input,
          timestamp: now,
          title: chat.title === "Nueva conversación" ? input.slice(0, 30) + "..." : chat.title,
        }
      }
      return chat
    })

    setChats(updatedChats)
    setInput("")
    setIsTyping(true)

    try {
      // 2. PEDIR RESPUESTA REAL AL BACKEND (Esperar)
      const responseText = await getChatResponse(input)

      const botMessage: Message = {
        id: `${messageId}-bot`, // ID única del bot
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      }

      // 3. Agregar respuesta del bot
      setChats((prevChats) => 
        prevChats.map((chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, botMessage],
              lastMessage: botMessage.content.slice(0, 50) + "...",
            }
          }
          return chat
        })
      )
    } catch (error) {
      console.error("Error en chat:", error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const discoverItems = [
    {
      icon: Clock,
      title: "Horarios de atención",
      desc: "Consulta horarios de oficinas",
      message: "¿Cuáles son los horarios de atención de las oficinas?",
    },
    {
      icon: TrendingUp,
      title: "Docentes FIIS",
      desc: "Información sobre profesores",
      message: "Dame información sobre los docentes registrados.",
    },
    {
      icon: MessageSquare,
      title: "Trámites frecuentes",
      desc: "Guías para matrícula",
      message: "¿Cómo realizo el trámite de matrícula?",
    },
  ]

  // --- LÓGICA DE BOTONES RÁPIDOS CONECTADA ---
  // --- LÓGICA DE BOTONES RÁPIDOS CORREGIDA ---
  const handleDiscoverClick = async (item: (typeof discoverItems)[0]) => {
    if (!currentChat) return

    const messageId = Date.now().toString()
    const now = new Date()

    const userMessage: Message = {
      id: messageId,
      role: "user",
      content: item.message,
      timestamp: now,
    }

    // Mostrar mensaje usuario
    const updatedChats = chats.map((chat) => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          messages: [...chat.messages, userMessage],
          lastMessage: item.message,
          timestamp: now,
        }
      }
      return chat
    })

    setChats(updatedChats)
    setIsTyping(true)

    try {
        const responseText = await getChatResponse(item.message)

        const botResponse: Message = {
            id: `${messageId}-bot`,
            role: "assistant",
            content: responseText,
            timestamp: new Date(),
        }

        setChats((prevChats) => 
            prevChats.map((chat) => {
            if (chat.id === currentChatId) {
                return {
                ...chat,
                messages: [...chat.messages, botResponse],
                lastMessage: botResponse.content.slice(0, 50) + "...",
                }
            }
            return chat
            })
        )
    } catch (error) {
        console.error("Error discover:", error)
    } finally {
        setIsTyping(false)
    }
  }

  return (
    <div className="flex w-full h-[calc(100vh-64px)]">
      {showSidebar && (
        <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col">
          <div className="p-4 border-b border-gray-200 bg-white">
            <Button onClick={handleNewChat} className="w-full bg-cyan-600 hover:bg-cyan-700 gap-2">
              <Plus className="w-4 h-4" />
              Nuevo Chat
            </Button>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-4 space-y-4">
              {/* Recent Chats */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Recientes</h3>
                <div className="space-y-1">
                  {chats.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => setCurrentChatId(chat.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        currentChatId === chat.id
                          ? "bg-cyan-100 border border-cyan-200"
                          : "bg-white hover:bg-gray-100 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{chat.title}</p>
                          <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Discover Section */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Descubrir
                </h3>
                <div className="space-y-2">
                  {discoverItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleDiscoverClick(item)}
                      className="w-full text-left p-3 rounded-lg bg-white hover:bg-cyan-50 border border-gray-200 hover:border-cyan-200 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <item.icon className="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        <Card className="flex-1 flex flex-col border-0 rounded-none bg-white">
          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      message.role === "user" ? "bg-cyan-600 text-white" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                    <p className={`text-xs mt-2 ${message.role === "user" ? "text-cyan-100" : "text-gray-500"}`}>
                      {message.timestamp.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-gray-700" />
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-cyan-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="max-w-4xl mx-auto">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Escribe tu pregunta aquí..."
                  className="flex-1 border-gray-300 focus:border-cyan-500 focus:ring-cyan-500 bg-white"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="bg-cyan-600 hover:bg-cyan-700"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2">TRIKABOT - Conectado a PostgreSQL & Gemini AI</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}