import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { Navbar, Button, Container, Nav, NavDropdown } from 'react-bootstrap';
import { loginRequest } from '../authConfig';
import { useApp, VIEW_TYPES } from '../contexts/AppContext';
import '../styles/Navbar.css';

export const NavigationBar = () => {
    const { instance, accounts } = useMsal();
    const { loadPeople, loadHelloWorld, showClaims, loading } = useApp();
    const account = accounts[0];

    const handleLoginRedirect = () => {
        instance.loginRedirect(loginRequest).catch((error) => console.log(error));
    };

    const handleLogoutRedirect = () => {
        instance.logoutRedirect().catch((error) => console.log(error));
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
                                <NavDropdown.Item 
                                    onClick={loadHelloWorld}
                                    disabled={loading[VIEW_TYPES.HELLO_WORLD]}
                                >
                                    🌍 {loading[VIEW_TYPES.HELLO_WORLD] ? 'Loading...' : 'Hello World API'}
                                </NavDropdown.Item>
                                <NavDropdown.Item 
                                    onClick={loadPeople}
                                    disabled={loading[VIEW_TYPES.PEOPLE]}
                                >
                                    👥 {loading[VIEW_TYPES.PEOPLE] ? 'Loading...' : 'Load People'}
                                </NavDropdown.Item>
                                <NavDropdown.Divider />
                                <NavDropdown.Header>Display Options</NavDropdown.Header>
                                <NavDropdown.Item onClick={showClaims}>
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