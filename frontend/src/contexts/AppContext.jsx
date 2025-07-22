import React, { createContext, useContext, useReducer, useMemo, useState } from 'react';
import { useMsal } from '@azure/msal-react';
import { apiRequest } from '../authConfig';

// Define view types
export const VIEW_TYPES = {
    CLAIMS: 'claims',
    PEOPLE: 'people',
    HELLO_WORLD: 'hello_world',
    CHAT: 'chat',
};

// Define action types
const ACTION_TYPES = {
    SET_VIEW: 'SET_VIEW',
    SET_LOADING: 'SET_LOADING',
    SET_DATA: 'SET_DATA',
    SET_ERROR: 'SET_ERROR',
    CLEAR_ERROR: 'CLEAR_ERROR',
};

// Initial state
const initialState = {
    currentView: VIEW_TYPES.CHAT,
    loading: {},
    data: {},
    errors: {},
};

// Reducer
const appReducer = (state, action) => {
    switch (action.type) {
        case ACTION_TYPES.SET_VIEW:
            return {
                ...state,
                currentView: action.payload,
            };
        case ACTION_TYPES.SET_LOADING:
            return {
                ...state,
                loading: {
                    ...state.loading,
                    [action.payload.view]: action.payload.isLoading,
                },
            };
        case ACTION_TYPES.SET_DATA:
            return {
                ...state,
                data: {
                    ...state.data,
                    [action.payload.view]: action.payload.data,
                },
                loading: {
                    ...state.loading,
                    [action.payload.view]: false,
                },
            };
        case ACTION_TYPES.SET_ERROR:
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [action.payload.view]: action.payload.error,
                },
                loading: {
                    ...state.loading,
                    [action.payload.view]: false,
                },
            };
        case ACTION_TYPES.CLEAR_ERROR:
            return {
                ...state,
                errors: {
                    ...state.errors,
                    [action.payload.view]: null,
                },
            };
        default:
            return state;
    }
};

// Create context
const AppContext = createContext();

// Custom hook to use the context
export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};

// Provider component
export const AppProvider = ({ children }) => {
    const { instance } = useMsal();
    const [state, dispatch] = useReducer(appReducer, initialState);
    
    // Chat-specific state
    const [chatHistory, setChatHistory] = useState([]);
    const [conversationId, setConversationId] = useState('-1');

    // Generic API call function
    const callApi = async (view, apiCall) => {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: { view, isLoading: true } });
        dispatch({ type: ACTION_TYPES.CLEAR_ERROR, payload: { view } });

        try {
            const data = await apiCall();
            dispatch({ type: ACTION_TYPES.SET_DATA, payload: { view, data } });
            dispatch({ type: ACTION_TYPES.SET_VIEW, payload: view });
        } catch (error) {
            dispatch({ type: ACTION_TYPES.SET_ERROR, payload: { view, error: error.message } });
            dispatch({ type: ACTION_TYPES.SET_VIEW, payload: view });
        }
    };

    // Generic token acquisition
    const getAccessToken = async () => {
        const account = instance.getActiveAccount();
        if (!account) throw new Error('No active account found');

        const response = await instance.acquireTokenSilent({
            ...apiRequest,
            account: account,
        });
        return response.accessToken;
    };

    // Chat functions
    const sendChatMessage = async (message) => {
        dispatch({ type: ACTION_TYPES.SET_LOADING, payload: { view: VIEW_TYPES.CHAT, isLoading: true } });
        dispatch({ type: ACTION_TYPES.CLEAR_ERROR, payload: { view: VIEW_TYPES.CHAT } });

        try {
            const token = await getAccessToken();
            console.log(`Call chat API at URL: ${process.env.REACT_APP_API_BASE_URL}/api/chat/message`);
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/chat/message`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    conversation_id: conversationId === '-1' ? null : conversationId
                }),
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            console.log('==> Chat response:', result);
            
            // Update conversation ID
            setConversationId(result.conversation_id);
            
            // Add to chat history
            const newExchange = {
                user_message: message,
                assistant_response: result.response,
                timestamp: result.timestamp
            };
            
            setChatHistory(prev => [...prev, newExchange]);
            
        } catch (error) {
            dispatch({ type: ACTION_TYPES.SET_ERROR, payload: { view: VIEW_TYPES.CHAT, error: error.message } });
        } finally {
            dispatch({ type: ACTION_TYPES.SET_LOADING, payload: { view: VIEW_TYPES.CHAT, isLoading: false } });
        }
    };

    const resetChatConversation = () => {
        setConversationId('-1');
        setChatHistory([]);
        dispatch({ type: ACTION_TYPES.CLEAR_ERROR, payload: { view: VIEW_TYPES.CHAT } });
    };

    // API functions
    const apiActions = useMemo(() => ({
        loadPeople: () => callApi(VIEW_TYPES.PEOPLE, async () => {
            console.log('API Base URL:', process.env.REACT_APP_API_BASE_URL);
            console.log(`Call load people API at URL: ${process.env.REACT_APP_API_BASE_URL}/api/people/`);
            const token = await getAccessToken();
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/people/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        }),

        loadHelloWorld: () => callApi(VIEW_TYPES.HELLO_WORLD, async () => {
            const token = await getAccessToken();
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/hello/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        }),

        // Chat functions
        sendChatMessage,
        resetChatConversation,
    }), [instance, conversationId]);

    // View actions
    const viewActions = useMemo(() => ({
        showClaims: () => dispatch({ type: ACTION_TYPES.SET_VIEW, payload: VIEW_TYPES.CLAIMS }),
        showPeople: () => dispatch({ type: ACTION_TYPES.SET_VIEW, payload: VIEW_TYPES.PEOPLE }),
        showHelloWorld: () => dispatch({ type: ACTION_TYPES.SET_VIEW, payload: VIEW_TYPES.HELLO_WORLD }),
        showChat: () => dispatch({ type: ACTION_TYPES.SET_VIEW, payload: VIEW_TYPES.CHAT }),
    }), []);

    const value = {
        ...state,
        ...apiActions,
        ...viewActions,
        chatHistory,
        conversationId,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};