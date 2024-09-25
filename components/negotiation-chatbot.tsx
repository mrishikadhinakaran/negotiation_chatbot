'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ThumbsUp, ThumbsDown, Meh } from 'lucide-react'
import { callOpenAI } from '@/lib/openai'

const analyzeSentiment = (message: string) => {
  const lowercaseMessage = message.toLowerCase()
  if (lowercaseMessage.includes('great') || lowercaseMessage.includes('happy') || lowercaseMessage.includes('deal')) {
    return 'positive'
  } else if (lowercaseMessage.includes('no') || lowercaseMessage.includes('won\'t') || lowercaseMessage.includes('bad')) {
    return 'negative'
  } else {
    return 'neutral'
  }
}

export default function NegotiationChatbot() {
  const [messages, setMessages] = useState<{role: 'user' | 'bot', content: string}[]>([
    {role: 'bot', content: "Welcome to our negotiation! We're discussing a product priced at $100. What's your initial offer?"}
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sentiment, setSentiment] = useState<'positive' | 'negative' | 'neutral'>('neutral')

  const minPrice = 80
  const maxPrice = 100
  const [currentPrice, setCurrentPrice] = useState(maxPrice)

  const handleSend = async () => {
    if (input.trim() === '') return

    setIsLoading(true)
    setMessages(prev => [...prev, {role: 'user', content: input}])
    
    const newSentiment = analyzeSentiment(input)
    setSentiment(newSentiment)
    
    const context = `Current price: $${currentPrice}. User sentiment: ${newSentiment}. Minimum acceptable price: $${minPrice}.`
    
    try {
      const botResponse = await callOpenAI(input, context)
      setMessages(prev => [...prev, {role: 'bot', content: botResponse}])
    } catch (error) {
      console.error('Error calling OpenAI:', error)
      setMessages(prev => [...prev, {role: 'bot', content: "I'm sorry, I'm having trouble responding right now. Can we try again?"}])
    }
    
    setInput('')
    setIsLoading(false)

    const priceMatch = input.match(/\$?(\d+)/)
    if (priceMatch) {
      const offeredPrice = parseInt(priceMatch[1])
      if (offeredPrice >= minPrice && offeredPrice <= currentPrice) {
        setCurrentPrice(offeredPrice)
      }
    }
  }

  useEffect(() => {
    const messageContainer = document.getElementById('message-container')
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight
    }
  }, [messages])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Negotiation Chatbot
          <span className="flex items-center space-x-2">
            <span className="text-sm">Sentiment:</span>
            {sentiment === 'positive' && <ThumbsUp className="w-5 h-5 text-green-500" />}
            {sentiment === 'negative' && <ThumbsDown className="w-5 h-5 text-red-500" />}
            {sentiment === 'neutral' && <Meh className="w-5 h-5 text-yellow-500" />}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent id="message-container" className="h-[400px] overflow-y-auto space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${
              message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
            }`}>
              {message.content}
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex w-full space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your offer or response..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}