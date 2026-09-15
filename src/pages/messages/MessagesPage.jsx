import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { messagesApi } from '@/api/endpoints'
import useAuthStore from '@/store/auth'

export default function MessagesPage() {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    messagesApi.conversations().then((res) => {
      setConversations(res.data)
      setLoading(false)
    })
  }, [])

  const openConversation = async (conv) => {
    setActiveConv(conv)
    const res = await messagesApi.thread(conv.other_user.id, conv.listing.id)
    setMessages(res.data)
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeConv) return

    const res = await messagesApi.send({
      listing_id: activeConv.listing.id,
      receiver_id: activeConv.other_user.id,
      body: newMessage,
    })
    setMessages([...messages, res.data])
    setNewMessage('')
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Poruke</h1>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nemate poruka.</div>
      ) : (
        <div className="flex gap-4 h-[600px] border border-border rounded-lg overflow-hidden">
          {/* Conversation list */}
          <div className="w-80 border-r border-border overflow-y-auto">
            {conversations.map((conv, i) => (
              <button
                key={i}
                onClick={() => openConversation(conv)}
                className={`w-full text-left p-4 border-b border-border hover:bg-muted transition-colors ${
                  activeConv?.other_user?.id === conv.other_user?.id &&
                  activeConv?.listing?.id === conv.listing?.id
                    ? 'bg-muted'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{conv.other_user?.name}</span>
                  {conv.unread_count > 0 && (
                    <Badge variant="destructive" className="text-xs">{conv.unread_count}</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                  {conv.listing?.title}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                  {conv.last_message?.body}
                </p>
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 flex flex-col">
            {activeConv ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-border">
                  <span className="font-medium">{activeConv.other_user?.name}</span>
                  <Link
                    to={`/kategorija/oglas/${activeConv.listing?.slug}`}
                    className="text-sm text-primary hover:underline ml-2"
                  >
                    {activeConv.listing?.title}
                  </Link>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        msg.sender_id === user?.id
                          ? 'ml-auto bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {msg.body}
                      <div className={`text-xs mt-1 ${msg.sender_id === user?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('sr-RS', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-border flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Napiši poruku..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Izaberi razgovor
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
