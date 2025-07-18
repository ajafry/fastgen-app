import React from 'react';
import { Container } from 'react-bootstrap';
import { useMsal } from '@azure/msal-react';
import { useApp, VIEW_TYPES } from '../contexts/AppContext';
import { IdTokenData } from './DataDisplay';
import { PeopleDisplay } from './PeopleDisplay';

// Component to render Hello World data
const HelloWorldDisplay = ({ data, loading, error }) => {
    if (loading) return <div>Loading Hello World...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!data) return <div>No Hello World data</div>;

    return (
        <Container className="mt-4">
            <h3>Hello World Response</h3>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </Container>
    );
};

export const ViewRenderer = () => {
    const { instance } = useMsal();
    const { currentView, data, loading, errors } = useApp();
    const activeAccount = instance.getActiveAccount();

    if (!activeAccount) return null;

    const renderView = () => {
        switch (currentView) {
            case VIEW_TYPES.CLAIMS:
                return <IdTokenData idTokenClaims={activeAccount.idTokenClaims} />;
            
            case VIEW_TYPES.PEOPLE:
                return (
                    <PeopleDisplay 
                        people={data[VIEW_TYPES.PEOPLE]} 
                        loading={loading[VIEW_TYPES.PEOPLE]} 
                        error={errors[VIEW_TYPES.PEOPLE]} 
                    />
                );
            
            case VIEW_TYPES.HELLO_WORLD:
                return (
                    <HelloWorldDisplay 
                        data={data[VIEW_TYPES.HELLO_WORLD]} 
                        loading={loading[VIEW_TYPES.HELLO_WORLD]} 
                        error={errors[VIEW_TYPES.HELLO_WORLD]} 
                    />
                );
            
            default:
                return <IdTokenData idTokenClaims={activeAccount.idTokenClaims} />;
        }
    };

    return <Container>{renderView()}</Container>;
};