import { MsalProvider, AuthenticatedTemplate, useMsal, UnauthenticatedTemplate } from '@azure/msal-react';
import { Container, Button } from 'react-bootstrap';
import { PageLayout } from './components/PageLayout';
import { IdTokenData } from './components/DataDisplay';
import { PeopleDisplay } from './components/PeopleDisplay';
import { loginRequest } from './authConfig';
import { useState } from 'react';

import './styles/App.css';

/**
* Most applications will need to conditionally render certain components based on whether a user is signed in or not. 
* msal-react provides 2 easy ways to do this. AuthenticatedTemplate and UnauthenticatedTemplate components will 
* only render their children if a user is authenticated or unauthenticated, respectively. For more, visit:
* https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
*/
const MainContent = ({ peopleState }) => {  // FIXED: Added peopleState prop
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();

    // debug logging
    console.log('MSAL instance:', instance);
    console.log('Active account:', activeAccount);
    console.log('All accounts:', instance.getAllAccounts());

    const handleRedirect = () => {
        instance
            .loginRedirect({
                ...loginRequest,
                prompt: 'create',
            })
            .catch((error) => console.log(error));
    };
    return (
        <div className="App">
            <AuthenticatedTemplate>
                {activeAccount ? (
                    <Container>
                        {/* MODIFIED: Conditionally render claims or people data */}
                        {peopleState?.data || peopleState?.loading || peopleState?.error ? (
                            <PeopleDisplay 
                                people={peopleState?.data} 
                                loading={peopleState?.loading} 
                                error={peopleState?.error} 
                            />
                        ) : (
                            <IdTokenData idTokenClaims={activeAccount.idTokenClaims} />
                        )}
                    </Container>
                ) : null}
            </AuthenticatedTemplate>
            <UnauthenticatedTemplate>
                <Button className="signInButton" onClick={handleRedirect} variant="primary">
                    Sign up
                </Button>
            </UnauthenticatedTemplate>
        </div>
    );
};

/**
* msal-react is built on the React context API and all parts of your app that require authentication must be 
* wrapped in the MsalProvider component. You will first need to initialize an instance of PublicClientApplication 
* then pass this to MsalProvider as a prop. All components underneath MsalProvider will have access to the 
* PublicClientApplication instance via context as well as all hooks and components provided by msal-react. For more, visit:
* https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
*/
const App = ({ instance }) => {
    // FIXED: Moved useState to the top of the component, before any conditional logic
    const [peopleState, setPeopleState] = useState({
        data: null,
        loading: false,
        error: null
    });

    console.log('App component rendering with instance:', instance);
    
    if (!instance) {
        console.error('MSAL instance is null or undefined');
        return <div>Error: MSAL instance not provided</div>;
    }

    // Handler for loading people - updated to set loading state before API call
    const handleLoadPeopleWithLoading = (data, error = null) => {
        if (data === undefined && error === undefined) {
            // This is the start of loading
            setPeopleState(prev => ({ ...prev, loading: true, error: null }));
        } else {
            // This is the completion of loading
            setPeopleState({
                data: error ? null : data,
                loading: false,
                error: error
            });
        }
    };

    const handleDisplayClaims = () => {
        setPeopleState({
            data: null,
            loading: false,
            error: null
        });
    };
    
    return (
        <MsalProvider instance={instance}>
            <PageLayout 
                onLoadPeople={handleLoadPeopleWithLoading} 
                isLoadingPeople={peopleState.loading}
                onDisplayClaims={handleDisplayClaims}
            >
                <MainContent peopleState={peopleState} />
            </PageLayout>
        </MsalProvider>
    );
};

export default App;