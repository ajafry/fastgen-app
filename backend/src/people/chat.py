from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, List
import uuid
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Pydantic models for request/response
class ChatMessage(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    timestamp: datetime

class ConversationHistory(BaseModel):
    user_message: str
    assistant_response: str
    timestamp: datetime

# In-memory storage for conversations (in production, use a database)
conversations: Dict[str, List[ConversationHistory]] = {}

def generate_conversation_id() -> str:
    """Generate a new conversation ID"""
    return str(uuid.uuid4())

def get_or_create_conversation(conversation_id: Optional[str]) -> str:
    """Get existing conversation or create new one"""
    if conversation_id is None or conversation_id == "-1":
        # Create new conversation
        new_id = generate_conversation_id()
        conversations[new_id] = []
        logger.info(f"Created new conversation: {new_id}")
        return new_id
    elif conversation_id in conversations:
        logger.info(f"Using existing conversation: {conversation_id}")
        return conversation_id
    else:
        # Conversation ID doesn't exist, create new one
        new_id = generate_conversation_id()
        conversations[new_id] = []
        logger.info(f"Conversation {conversation_id} not found, created new one: {new_id}")
        return new_id

def generate_chat_response(message: str, conversation_history: List[ConversationHistory]) -> str:
    """
    Generate a chat response based on the message and conversation history.
    This is a simple implementation - in production, you would integrate with
    OpenAI GPT, Azure OpenAI, or another AI service.
    """
    # Simple response generation for demonstration
    message_lower = message.lower()
    
    if "hello" in message_lower or "hi" in message_lower:
        return "Hello! I'm your AI assistant. How can I help you today?"
    elif "how are you" in message_lower:
        return "I'm doing well, thank you for asking! I'm here to help you with any questions you have."
    elif "what" in message_lower and "time" in message_lower:
        return f"The current time is {datetime.now().strftime('%H:%M:%S')} on {datetime.now().strftime('%Y-%m-%d')}."
    elif "weather" in message_lower:
        return "I don't have access to real-time weather data, but I'd suggest checking a weather service for current conditions."
    elif "help" in message_lower:
        return "I'm here to help! You can ask me questions about various topics. Try asking about time, general information, or just have a conversation with me."
    elif len(conversation_history) > 0:
        return f"Thanks for continuing our conversation! You said: '{message}'. I'm a demo assistant, so my responses are limited, but in a real implementation, I would provide more sophisticated responses based on AI models."
    else:
        return f"I understand you're saying: '{message}'. This is a demo chat system. In a production environment, this would be connected to a more sophisticated AI service like OpenAI's GPT or Azure OpenAI Service for better responses."

chatRouter = APIRouter(prefix="/api/chat", tags=["chat"])

@chatRouter.post("/message", response_model=ChatResponse)
async def send_chat_message(chat_message: ChatMessage):
    """
    Send a chat message and get a response.
    
    - **message**: The user's message
    - **conversation_id**: Optional conversation ID. Use "-1" or None to start a new conversation
    """
    try:
        logger.info(f"Received chat message: {chat_message.message[:50]}...")
        
        # Get or create conversation
        conversation_id = get_or_create_conversation(chat_message.conversation_id)
        
        # Get conversation history
        conversation_history = conversations.get(conversation_id, [])
        
        # Generate response
        response_text = generate_chat_response(chat_message.message, conversation_history)
        
        # Create conversation entry
        conversation_entry = ConversationHistory(
            user_message=chat_message.message,
            assistant_response=response_text,
            timestamp=datetime.now()
        )
        
        # Add to conversation history
        conversations[conversation_id].append(conversation_entry)
        
        # Limit conversation history to last 50 exchanges to prevent memory issues
        if len(conversations[conversation_id]) > 50:
            conversations[conversation_id] = conversations[conversation_id][-50:]
        
        logger.info(f"Generated response for conversation {conversation_id}")
        
        return ChatResponse(
            response=response_text,
            conversation_id=conversation_id,
            timestamp=datetime.now()
        )
        
    except Exception as e:
        logger.error(f"Error processing chat message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing chat message: {str(e)}")

@chatRouter.get("/conversation/{conversation_id}", response_model=List[ConversationHistory])
async def get_conversation_history(conversation_id: str):
    """
    Get the full conversation history for a given conversation ID.
    """
    try:
        if conversation_id not in conversations:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        return conversations[conversation_id]
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving conversation {conversation_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving conversation: {str(e)}")

@chatRouter.delete("/conversation/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """
    Delete a conversation and its history.
    """
    try:
        if conversation_id in conversations:
            del conversations[conversation_id]
            logger.info(f"Deleted conversation: {conversation_id}")
            return {"message": f"Conversation {conversation_id} deleted successfully"}
        else:
            raise HTTPException(status_code=404, detail="Conversation not found")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting conversation {conversation_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error deleting conversation: {str(e)}")

@chatRouter.get("/")
async def chat_health_check():
    """Health check endpoint for the chat service"""
    return {
        "message": "Chat service is running",
        "active_conversations": len(conversations),
        "timestamp": datetime.now()
    }