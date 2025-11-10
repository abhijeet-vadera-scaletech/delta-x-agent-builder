import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Agent {
  id: string
  consultantId: string
  name: string
  description?: string
  template: string
  personality: string
  tone?: string
  greetingMessage?: string
  systemInstructions?: string
  knowledgeBase: string[]
  services: string[]
  status: 'draft' | 'testing' | 'live'
  createdAt: string
  updatedAt: string
  users?: number
  version: number
}

export interface Document {
  id: string
  consultantId: string
  name: string
  type: string
  size: number
  uploadedAt: string
  version: number
  content?: string
}

export interface User {
  id: string
  name: string
  email: string
  intent: 'high' | 'medium' | 'low'
  conversations: number
  lastSeen: string
}

export interface Message {
  id: string
  agentId: string
  sender: 'user' | 'agent'
  text: string
  timestamp: string
}

interface AppContextType {
  agents: Agent[]
  documents: Document[]
  users: User[]
  messages: Message[]
  personalization: {
    logo?: string
    profileImage?: string
    businessDescription: string
    primaryColor: string
    secondaryColor: string
    font: string
    socialLinks: {
      linkedin?: string
      twitter?: string
      website?: string
    }
  }
  addAgent: (agent: Agent) => void
  updateAgent: (id: string, agent: Partial<Agent>) => void
  deleteAgent: (id: string) => void
  addDocument: (doc: Document) => void
  deleteDocument: (id: string) => void
  addUser: (user: User) => void
  updateUser: (id: string, user: Partial<User>) => void
  addMessage: (message: Message) => void
  getAgentMessages: (agentId: string) => Message[]
  updatePersonalization: (data: Partial<AppContextType['personalization']>) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

const STORAGE_KEYS = {
  AGENTS: 'coachAi_agents',
  DOCUMENTS: 'coachAi_documents',
  USERS: 'coachAi_users',
  MESSAGES: 'coachAi_messages',
  PERSONALIZATION: 'coachAi_personalization',
}

const DEFAULT_PERSONALIZATION = {
  businessDescription: 'Executive coaching and leadership development platform',
  primaryColor: '#2563eb',
  secondaryColor: '#9333ea',
  font: 'Inter',
  socialLinks: {},
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [agents, setAgents] = useState<Agent[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [personalization, setPersonalizationState] = useState(DEFAULT_PERSONALIZATION)

  // Load from localStorage on mount
  useEffect(() => {
    const savedAgents = localStorage.getItem(STORAGE_KEYS.AGENTS)
    const savedDocuments = localStorage.getItem(STORAGE_KEYS.DOCUMENTS)
    const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS)
    const savedMessages = localStorage.getItem(STORAGE_KEYS.MESSAGES)
    const savedPersonalization = localStorage.getItem(STORAGE_KEYS.PERSONALIZATION)

    if (savedAgents) setAgents(JSON.parse(savedAgents))
    if (savedDocuments) setDocuments(JSON.parse(savedDocuments))
    if (savedUsers) setUsers(JSON.parse(savedUsers))
    if (savedMessages) setMessages(JSON.parse(savedMessages))
    if (savedPersonalization) setPersonalizationState(JSON.parse(savedPersonalization))
  }, [])

  // Save agents to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents))
  }, [agents])

  // Save documents to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents))
  }, [documents])

  // Save users to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  }, [users])

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages))
  }, [messages])

  // Save personalization to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PERSONALIZATION, JSON.stringify(personalization))
  }, [personalization])

  const addAgent = (agent: Agent) => {
    setAgents([...agents, agent])
  }

  const updateAgent = (id: string, updates: Partial<Agent>) => {
    setAgents(agents.map(a => a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a))
  }

  const deleteAgent = (id: string) => {
    setAgents(agents.filter(a => a.id !== id))
  }

  const addDocument = (doc: Document) => {
    setDocuments([...documents, doc])
  }

  const deleteDocument = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id))
  }

  const addUser = (user: User) => {
    setUsers([...users, user])
  }

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u))
  }

  const addMessage = (message: Message) => {
    setMessages([...messages, message])
  }

  const getAgentMessages = (agentId: string) => {
    return messages.filter(m => m.agentId === agentId)
  }

  const updatePersonalization = (data: Partial<typeof personalization>) => {
    setPersonalizationState({ ...personalization, ...data })
  }

  return (
    <AppContext.Provider
      value={{
        agents,
        documents,
        users,
        messages,
        personalization,
        addAgent,
        updateAgent,
        deleteAgent,
        addDocument,
        deleteDocument,
        addUser,
        updateUser,
        addMessage,
        getAgentMessages,
        updatePersonalization,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}
