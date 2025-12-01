"use client"

import { useEffect, useState, useCallback } from "react"
import { 
  MessageCircle, 
  Send, 
  Sparkles,
  User,
  Settings,
  RefreshCw,
  Bot,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface Conversation {
  id: string
  igConversationId: string
  participant: {
    igId: string
    username: string | null
    name: string | null
    picture: string | null
  }
  instagramAccount: {
    id: string
    username: string
    profilePicture: string | null
  }
  isActive: boolean
  isAutomated: boolean
  lastMessageAt: string | null
  unreadCount: number
  lastMessage: {
    id: string
    content: string
    direction: string
    sentAt: string
    aiStatus: string | null
  } | null
}

interface Message {
  id: string
  direction: string
  messageType: string
  content: string
  status: string
  aiStatus: string | null
  aiResponse: string | null
  sentAt: string
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [generating, setGenerating] = useState(false)
  const [aiResponse, setAiResponse] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])

  const fetchConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/dm/conversations")
      if (response.ok) {
        const data = await response.json()
        setConversations(data.conversations)
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true)
    try {
      const response = await fetch(`/api/dm/messages?conversationId=${conversationId}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setMessagesLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation, fetchMessages])

  const generateAIResponse = async () => {
    if (!selectedConversation) return

    const lastInboundMessage = messages
      .filter(m => m.direction === "INBOUND")
      .pop()

    if (!lastInboundMessage) return

    setGenerating(true)
    setAiResponse(null)
    setSuggestions([])

    try {
      const response = await fetch("/api/dm/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          messageId: lastInboundMessage.id,
          message: lastInboundMessage.content,
          generateSuggestions: true,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAiResponse(data.response)
        setSuggestions(data.suggestions || [])
        setReplyText(data.response)
      }
    } catch (error) {
      console.error("Error generating AI response:", error)
    } finally {
      setGenerating(false)
    }
  }

  const sendReply = async () => {
    if (!selectedConversation || !replyText.trim()) return

    try {
      // Create outbound message
      await fetch("/api/dm/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          direction: "OUTBOUND",
          content: replyText,
          status: "REPLIED",
          aiStatus: aiResponse === replyText ? "SENT" : "APPROVED",
        }),
      })

      setReplyText("")
      setAiResponse(null)
      setSuggestions([])
      fetchMessages(selectedConversation.id)
    } catch (error) {
      console.error("Error sending reply:", error)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Heute"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Gestern"
    }
    return date.toLocaleDateString("de-DE", { day: "numeric", month: "short" })
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Conversations List */}
      <div className="w-1/3 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Direktnachrichten</h1>
            <p className="text-sm text-muted-foreground">KI-gestützte DM-Verwaltung</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={fetchConversations}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Link href="/dashboard/messages/settings">
              <Button variant="outline" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-0 h-full overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <MessageCircle className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium text-foreground">Keine Konversationen</h3>
                <p className="text-sm text-muted-foreground mt-2">
                  Verbinde deinen Instagram Account, um DMs zu empfangen.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-4 text-left hover:bg-secondary/50 transition-colors ${
                      selectedConversation?.id === conv.id ? "bg-secondary" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        {conv.participant.picture ? (
                          <img
                            src={conv.participant.picture}
                            alt={conv.participant.username || "User"}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center">
                            <User className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        {conv.isAutomated && (
                          <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Bot className="h-3 w-3 text-primary-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-foreground truncate">
                            {conv.participant.name || conv.participant.username || "Unbekannt"}
                          </p>
                          {conv.lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatDate(conv.lastMessage.sentAt)}
                            </span>
                          )}
                        </div>
                        {conv.participant.username && (
                          <p className="text-xs text-muted-foreground">@{conv.participant.username}</p>
                        )}
                        {conv.lastMessage && (
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {conv.lastMessage.direction === "OUTBOUND" && "Du: "}
                            {conv.lastMessage.content}
                          </p>
                        )}
                      </div>
                      {conv.unreadCount > 0 && (
                        <span className="flex-shrink-0 h-5 min-w-[1.25rem] rounded-full bg-primary text-primary-foreground text-xs font-medium flex items-center justify-center px-1">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Message Thread */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Header */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedConversation.participant.picture ? (
                      <img
                        src={selectedConversation.participant.picture}
                        alt={selectedConversation.participant.username || "User"}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {selectedConversation.participant.name || selectedConversation.participant.username || "Unbekannt"}
                      </p>
                      {selectedConversation.participant.username && (
                        <p className="text-xs text-muted-foreground">@{selectedConversation.participant.username}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedConversation.isAutomated ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        <Bot className="h-3 w-3" />
                        KI aktiv
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                        Manuell
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card className="flex-1 overflow-hidden">
              <CardContent className="p-4 h-full overflow-y-auto flex flex-col gap-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <MessageCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Keine Nachrichten in dieser Konversation.</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          message.direction === "OUTBOUND"
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-secondary text-foreground rounded-bl-md"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-xs opacity-70">{formatTime(message.sentAt)}</span>
                          {message.direction === "OUTBOUND" && message.aiStatus && (
                            <span className="text-xs opacity-70">
                              {message.aiStatus === "SENT" && <Sparkles className="h-3 w-3 inline" />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <Card className="mt-4">
                <CardHeader className="py-2 px-4">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    KI-Vorschläge
                  </CardTitle>
                </CardHeader>
                <CardContent className="py-2 px-4">
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => setReplyText(suggestion)}
                      >
                        Variante {index + 1}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reply Box */}
            <Card className="mt-4">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={generateAIResponse}
                    disabled={generating || messages.filter(m => m.direction === "INBOUND").length === 0}
                    className="flex-shrink-0"
                  >
                    {generating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </Button>
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Schreibe eine Antwort..."
                    className="min-h-[60px] resize-none"
                  />
                  <Button
                    onClick={sendReply}
                    disabled={!replyText.trim()}
                    className="flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {aiResponse && aiResponse === replyText && (
                  <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    KI-generierte Antwort
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="flex-1 flex items-center justify-center">
            <CardContent className="text-center">
              <MessageCircle className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">Wähle eine Konversation</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Klicke auf eine Konversation links, um die Nachrichten anzuzeigen.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
