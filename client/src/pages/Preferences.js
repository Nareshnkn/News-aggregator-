import { useState, useEffect } from "react";
import { Form, Button, Row, Col, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const Preferences = ({ onUpdatePreferences }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ✅ State with default values
  const [preferences, setPreferences] = useState({
    categories: [],
    sources: [],
    country: "us",
  });

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const categoryOptions = ["Business", "Technology", "Sports", "Entertainment", "Health", "Science"];
  const sourceOptions = ["BBC", "CNN", "The Guardian", "NY Times", "Reuters"];

  // ✅ Fetch user preferences on component mount
  useEffect(() => {
    if (!user || !user.token) {
      console.error("🚨 No user token found. Redirecting to login.");
      navigate("/login");
      return;
    }

    fetchPreferences();
  }, [user, navigate]);

  // ✅ Fetch User Preferences
  const fetchPreferences = async () => {
    setLoading(true);
    try {
      console.log("🔍 Fetching user preferences...");

      const res = await axios.get(`${API_BASE_URL}/api/user/preferences`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      console.log("✅ Preferences Fetched:", res.data);

      if (res.data && res.data.preferences) {
        setPreferences({
          categories: res.data.preferences.categories || [],
          sources: res.data.preferences.sources || [],
          country: res.data.preferences.country || "us",
        });
      } else {
        console.warn("⚠️ No preferences found, using defaults.");
      }
    } catch (error) {
      console.error("❌ Error fetching preferences:", error.response?.data || error.message);
      setErrorMessage("Failed to load preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Checkbox Selection for Categories & Sources
  const handleCheckboxChange = (type, value) => {
    setPreferences((prev) => ({
      ...prev,
      [type]: prev[type]?.includes(value)
        ? prev[type].filter((item) => item !== value) // Remove if already selected
        : [...(prev[type] || []), value], // Add if not selected
    }));
  };

  // ✅ Handle Country Selection Change
  const handleCountryChange = (e) => {
    setPreferences((prev) => ({ ...prev, country: e.target.value }));
  };

  // ✅ Handle Preferences Update Submission
  const handleUpdatePreferences = async (e) => {
    e.preventDefault();
    if (!user || !user.token) {
      console.error("🚨 No user token found. Cannot update preferences.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      console.log("📤 Sending preferences update:", preferences);

      await axios.put(`${API_BASE_URL}/api/user/preferences`, preferences, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      setSuccessMessage("✅ Your preferences have been updated!");
      setTimeout(() => setSuccessMessage(""), 3000);

      // ✅ Refresh News Feed after updating preferences
      if (onUpdatePreferences) {
        onUpdatePreferences();
      }
    } catch (error) {
      console.error("❌ Error updating preferences:", error.response?.data || error.message);
      setErrorMessage("Failed to update preferences. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleUpdatePreferences}>
      <h3>🛠️ Update Your Preferences</h3>

      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      {loading ? (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <Row>
            <Col md={6}>
              <h5>📂 Select Categories:</h5>
              {categoryOptions.map((category) => (
                <Form.Check
                  key={category}
                  type="checkbox"
                  label={category}
                  checked={preferences.categories?.includes(category) || false}
                  onChange={() => handleCheckboxChange("categories", category)}
                />
              ))}
            </Col>

            <Col md={6}>
              <h5>📰 Select Sources:</h5>
              {sourceOptions.map((source) => (
                <Form.Check
                  key={source}
                  type="checkbox"
                  label={source}
                  checked={preferences.sources?.includes(source) || false}
                  onChange={() => handleCheckboxChange("sources", source)}
                />
              ))}
            </Col>
          </Row>

          <Form.Group className="mt-3">
            <Form.Label>🌍 Select Country:</Form.Label>
            <Form.Control as="select" value={preferences.country} onChange={handleCountryChange}>
              <option value="us">United States</option>
              <option value="gb">United Kingdom</option>
              <option value="in">India</option>
              <option value="ca">Canada</option>
              <option value="au">Australia</option>
            </Form.Control>
          </Form.Group>

          <Button type="submit" className="mt-3" disabled={loading}>
            {loading ? "Updating..." : "Update Preferences"}
          </Button>
        </>
      )}
    </Form>
  );
};

export default Preferences;
