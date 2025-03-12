import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import for redirection
import { Container, Form, Button, Alert } from "react-bootstrap";
import axios from "axios";

const Signup = () => {
  // ✅ State for form data
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  
  // ✅ State for success and error messages
  const [successMessage, setSuccessMessage] = useState(null);
  const [error, setError] = useState(null);
  
  const navigate = useNavigate(); // ✅ For redirection

  // ✅ Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", formData);

      // ✅ Set success message
      setSuccessMessage("Signup successful! Redirecting to login...");

      // ✅ Clear error
      setError(null);

      // ✅ Redirect to login after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed.");
      setSuccessMessage(null);
    }
  };

  return (
    <Container className="mt-5">
      <h2>Signup</h2>
      
      {/* ✅ Success Alert */}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}
      
      {/* ✅ Error Alert */}
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={handleSubmit}>
        {/* ✅ Username */}
        <Form.Group className="mb-3">
          <Form.Label>Username</Form.Label>
          <Form.Control
            type="text"
            name="username"
            placeholder="Enter username"
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* ✅ Email */}
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            placeholder="Enter email"
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* ✅ Password */}
        <Form.Group className="mb-3">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* ✅ Submit Button */}
        <Button type="submit" variant="primary">Signup</Button>
      </Form>
    </Container>
  );
};

export default Signup;
