import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from '@azure/msal-react';
import { Navbar, Button, Container, Nav, NavDropdown } from 'react-bootstrap';
import { loginRequest } from '../authConfig';
import '../styles/Navbar.css'; // Assuming you have a CSS file for custom styles

export const NavigationBar = () => {
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