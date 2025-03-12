import { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useAuth } from "../context/AuthContext"; // ✅ Use Auth Context
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth(); // ✅ Get login function from AuthContext
  const navigate = useNavigate(); // ✅ Use navigate instead of window.location.href

  // ✅ Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle form submission (Login)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await login(formData.email, formData.password);

    if (response.success) {
      navigate("/"); // ✅ Redirect after login
    } else {
      setError(response.message);
    }

    setLoading(false);
  };

  // ✅ Handle Google OAuth Login
  const handleGoogleLogin = () => {
    window.open(`${process.env.REACT_APP_API_BASE_URL}/api/auth/google`, "_self");
  };

  return (
    <Container className="mt-5">
      <h2>Login</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </Form>

      <hr />

      {/* ✅ Google Login */}
      <Button variant="danger" onClick={handleGoogleLogin}>
        Sign in with Google
      </Button>
    </Container>
  );
};

export default Login;
