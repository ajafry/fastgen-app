import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { Navbar, Button, Container, Nav, NavDropdown } from 'react-bootstrap';
import { loginRequest, apiRequest } from '../authConfig'; // MODIFIED: Added apiRequest import
import '../styles/Navbar.css'; // Assuming you have a CSS file for custom styles

export const NavigationBar = ({ onLoadPeople, isLoadingPeople, onDisplayClaims }) => { // MODIFIED: Added props
    const { instance, accounts } = useMsal();
    const account = accounts[0];

    const handleLoginRedirect = () => {
        instance.loginRedirect(loginRequest).catch((error) => console.log(error));
    };

    const handleLogoutRedirect = () => {
        instance.logoutRedirect().catch((error) => console.log(error));
    };

    const callHelloWorldApi = () => {
        console.log('Calling Hello World API...');
    };

    const displayClaims = () => {
        console.log('Displaying Claims...');
        onDisplayClaims();
    };

    // MODIFIED: Added loadPeople function
    const loadPeople = async () => {
        console.log('Calling Load People API...');

        // Signal loading start
        onLoadPeople(); // Call with no arguments to start loading
        
        try {
            const account = instance.getActiveAccount();
            const tokenResponse = await instance.acquireTokenSilent({
                ...apiRequest,
                account: account,
            });
            const api_base_url = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'; // Ensure the base URL is set
            const response = await fetch(`${api_base_url}/api/people/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${tokenResponse.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('====> Loaded people data:', data);
            onLoadPeople(data);
        } catch (error) {
            console.error('Error loading people:', error);
            onLoadPeople(null, error.message);
        }
    };

    return (
        <Navbar bg="primary" variant="dark" expand="lg" className="navbar-custom">
            <Container>
                <Navbar.Brand href="/" className="brand-custom">
                    React SPA with MSAL Authentication
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <AuthenticatedTemplate>
                            <Nav.Link className="text-light me-3">
                                Welcome, {account?.name?.split(' ')[0] || 'User'}!
                            </Nav.Link>
                            <NavDropdown 
                                title="⚙️ Actions"
                                id="actions-dropdown"
                                align="end"
                                className="actions-dropdown"
                            >
                                <NavDropdown.Header>API Calls</NavDropdown.Header>
                                <NavDropdown.Item onClick={callHelloWorldApi}>
                                    🌍 Hello World API
                                </NavDropdown.Item>
                                {/* MODIFIED: Added Load People menu item */}
                                <NavDropdown.Item 
                                    onClick={loadPeople}
                                    disabled={isLoadingPeople}
                                >
                                    👥 {isLoadingPeople ? 'Loading...' : 'Load People'}
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Header>Display Options</NavDropdown.Header>
                                <NavDropdown.Item onClick={displayClaims}>
                                    📋 Display Claims
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Header>Account</NavDropdown.Header>
                                <NavDropdown.Item onClick={handleLogoutRedirect}>
                                    🚪 Sign out
                                </NavDropdown.Item>
                            </NavDropdown>
                        </AuthenticatedTemplate>
                        <UnauthenticatedTemplate>
                            <Button 
                                variant="outline-light" 
                                onClick={handleLoginRedirect}
                                className="nav-button"
                            >
                                🔐 Sign in
                            </Button>
                        </UnauthenticatedTemplate>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};