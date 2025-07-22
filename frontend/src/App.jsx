import { MsalProvider, AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { Button } from 'react-bootstrap';
import { PageLayout } from './components/PageLayout';
import { ViewRenderer } from './components/ViewRenderer';
import { AppProvider } from './contexts/AppContext';
import { loginRequest } from './authConfig';

import './styles/App.css';

const MainContent = () => {
    return (
        <div className="App">
            <AuthenticatedTemplate>
                <ViewRenderer />
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                Sign-In to unlock additional features
            </UnauthenticatedTemplate>
        </div>
    );
};

const App = ({ instance }) => {
    console.log('App component rendering with instance:', instance);
    
    if (!instance) {
        console.error('MSAL instance is null or undefined');
        return <div>Error: MSAL instance not provided</div>;
    }
    
    return (
        <MsalProvider instance={instance}>
            <AppProvider>
                <PageLayout>
                    <MainContent />
                </PageLayout>
            </AppProvider>
        </MsalProvider>
    );
};

export default App;