import React, { createContext, useContext, useReducer, useMemo } from 'react';
import { useMsal } from '@azure/msal-react';
import { apiRequest } from '../authConfig';

// Define view types
export const VIEW_TYPES = {
    CLAIMS: 'claims',
    PEOPLE: 'people',
    HELLO_WORLD: 'hello_world',
    // Easy to add more views here
    // USERS: 'users',
    // ORDERS: 'orders',
    // DASHBOARD: 'dashboard',
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
    currentView: VIEW_TYPES.CLAIMS,
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

    // API functions
    const apiActions = useMemo(() => ({
        loadPeople: () => callApi(VIEW_TYPES.PEOPLE, async () => {
            console.log('API Base URL:', process.env.REACT_APP_API_BASE_URL); // Temporary debug line
            console.log(`Call load people API at URL: ${process.env.REACT_APP_API_BASE_URL}/api/people/`); // Temporary debug line
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

        // Easy to add more API calls here
        // loadUsers: () => callApi(VIEW_TYPES.USERS, async () => { ... }),
        // loadOrders: () => callApi(VIEW_TYPES.ORDERS, async () => { ... }),
    }), [instance]);

    // View actions
    const viewActions = useMemo(() => ({
        showClaims: () => dispatch({ type: ACTION_TYPES.SET_VIEW, payload: VIEW_TYPES.CLAIMS }),
        showPeople: () => dispatch({ type: ACTION_TYPES.SET_VIEW, payload: VIEW_TYPES.PEOPLE }),
        showHelloWorld: () => dispatch({ type: ACTION_TYPES.SET_VIEW, payload: VIEW_TYPES.HELLO_WORLD }),
        // Easy to add more view actions here
    }), []);

    const value = {
        ...state,
        ...apiActions,
        ...viewActions,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};