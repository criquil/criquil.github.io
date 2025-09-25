import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavigationBar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-3">
      <Container>
        <Navbar.Brand>Cristian Bank</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/dashboard">Dashboard</Nav.Link>
            <Nav.Link href="/accounts">Accounts</Nav.Link>
            <Nav.Link href="/transfers">Transfers</Nav.Link>
            <Nav.Link href="/exchange">Exchange</Nav.Link>
            {user?.isAdmin && (
              <Nav.Link href="/admin">Admin Panel</Nav.Link>
            )}
          </Nav>
          <Nav>
            <span className="navbar-text me-3">
              Welcome, {user?.firstName} {user?.lastName}
            </span>
            <Button
              variant="outline-primary"
              onClick={handleLogout}
              data-testid="logout-button"
            >
              Logout
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;