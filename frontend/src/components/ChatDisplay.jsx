import React, { useState, useRef, useEffect } from 'react';
import { Container, Form, Button, Alert, Card } from 'react-bootstrap';

export const ChatDisplay = ({ chatHistory, loading, error, onSendMessage, onResetConversation }) => {
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatHistory]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim() && !loading) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    // Debug logging
    useEffect(() => {
        console.log('ChatDisplay - chatHistory:', chatHistory);
    }, [chatHistory]);

    return (
        <Container className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3>💬 Chat Assistant</h3>
                <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={onResetConversation}
                    disabled={loading}
                >
                    🔄 Reset Conversation
                </Button>
            </div>

            {error && (
                <Alert variant="danger" className="mb-3">
                    Error: {error}
                </Alert>
            )}

            <div 
                className="chat-container mb-3"
                style={{
                    height: '400px',
                    overflowY: 'auto',
                    border: '1px solid #dee2e6',
                    borderRadius: '0.375rem',
                    padding: '1rem',
                    backgroundColor: '#f8f9fa'
                }}
            >
                {chatHistory && chatHistory.length > 0 ? (
                    chatHistory.map((exchange, index) => {
                        console.log('Rendering exchange:', exchange); // Debug log
                        return (
                            <div key={index} className="mb-3">
                                {/* User Message */}
                                <Card className="mb-2 ms-auto" style={{ maxWidth: '80%' }}>
                                    <Card.Body className="py-2 px-3 bg-primary text-white">
                                        <div className="d-flex align-items-start">
                                            <div className="me-2">👤</div>
                                            <div style={{ whiteSpace: 'pre-wrap' }}>
                                                {exchange.user_message || exchange.userMessage || 'No message'}
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>

                                {/* Assistant Response */}
                                {(exchange.assistant_response || exchange.assistantResponse) && (
                                    <Card className="me-auto" style={{ maxWidth: '80%' }}>
                                        <Card.Body className="py-2 px-3">
                                            <div className="d-flex align-items-start">
                                                <div className="me-2">🤖</div>
                                                <div style={{ whiteSpace: 'pre-wrap' }}>
                                                    {exchange.assistant_response || exchange.assistantResponse || 'No response'}
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center text-muted mt-5">
                        <h5>👋 Welcome to Chat!</h5>
                        <p>Start a conversation by typing a message below.</p>
                    </div>
                )}

                {loading && (
                    <Card className="me-auto" style={{ maxWidth: '80%' }}>
                        <Card.Body className="py-2 px-3">
                            <div className="d-flex align-items-start">
                                <div className="me-2">🤖</div>
                                <div className="text-muted">
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Thinking...
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                )}

                <div ref={messagesEndRef} />
            </div>

            <Form onSubmit={handleSubmit}>
                <div className="d-flex gap-2">
                    <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Type your message here... (Press Enter to send, Shift+Enter for new line)"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        style={{ resize: 'none' }}
                    />
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={!message.trim() || loading}
                        style={{ 
                            minWidth: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {loading ? (
                            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : (
                            '📤'
                        )}
                    </Button>
                </div>
            </Form>
        </Container>
    );
};