import { Navbar, Nav, Container, Button, Offcanvas } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ Authentication context
import { useState } from "react";

const NavbarComponent = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false); // ✅ Offcanvas state

  const handleLogout = () => {
    logout();
    navigate("/");
    setShowMenu(false); // ✅ Close menu after logout
  };

  return (
    <>
      <Navbar expand="lg" bg="dark" variant="dark">
        <Container>
          <Navbar.Brand as={Link} to="/">📰 News Aggregator</Navbar.Brand>

          {/* ✅ Hamburger Menu Button */}
          <Button
            variant="outline-light"
            className="d-lg-none"
            onClick={() => setShowMenu(true)}
          >
            ☰
          </Button>

          {/* ✅ Navbar for Desktop */}
          <Navbar.Collapse>
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              {user && <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>}
              <Nav.Link as={Link} to="/search">🔍 Search</Nav.Link>
            </Nav>

            {/* ✅ Show Login/Signup (Only for logged-out users) */}
            {!user && (
              <Nav className="ms-auto d-none d-lg-flex">
                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                <Nav.Link as={Link} to="/signup">Signup</Nav.Link>
              </Nav>
            )}

            {/* ✅ Logout Button (Desktop) */}
            {user && (
              <Button variant="danger" className="ms-auto" onClick={handleLogout}>
                Logout
              </Button>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* ✅ Offcanvas (Hamburger Menu for Mobile) */}
      <Offcanvas show={showMenu} onHide={() => setShowMenu(false)} placement="end">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            <Nav.Link as={Link} to="/" onClick={() => setShowMenu(false)}>🏠 Home</Nav.Link>
            {user && (
              <Nav.Link as={Link} to="/dashboard" onClick={() => setShowMenu(false)}>📊 Dashboard</Nav.Link>
            )}
            <Nav.Link as={Link} to="/search" onClick={() => setShowMenu(false)}>🔍 Search</Nav.Link>

            {/* ✅ Show Login/Signup if logged out */}
            {!user && (
              <>
                <Nav.Link as={Link} to="/login" onClick={() => setShowMenu(false)}>🔑 Login</Nav.Link>
                <Nav.Link as={Link} to="/signup" onClick={() => setShowMenu(false)}>✍️ Signup</Nav.Link>
              </>
            )}

            {/* ✅ Show Logout if logged in */}
            {user && (
              <Button variant="danger" className="mt-3" onClick={handleLogout}>
                🚪 Logout
              </Button>
            )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default NavbarComponent;
