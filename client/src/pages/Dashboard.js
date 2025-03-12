import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert, Form } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState({
    categories: [],
    country: "us",
    sources: [],
  });

  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const categoriesList = ["Business", "Technology", "Sports", "Health", "Science", "Entertainment"];
  const countryList = [
    { code: "in", name: "India" },
    { code: "us", name: "USA" },
    { code: "gb", name: "UK" },
  ];
  const sourcesList = ["CNN", "BBC News", "TechCrunch", "The Verge", "NY Times"];

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    fetchPreferences();
    fetchBookmarks();
  }, [user]);

  // ✅ Fetch User Preferences
  const fetchPreferences = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/preferences`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (response.data.preferences) {
        console.log("✅ Preferences fetched:", response.data.preferences);
        setPreferences(response.data.preferences);
      }
    } catch (error) {
      console.error("❌ Error fetching preferences:", error.response?.data?.message || error.message);
      setError("Failed to load preferences.");
    }
  };

  // ✅ Update User Preferences
  const updatePreferences = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/user/preferences`, preferences, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      console.log("✅ Preferences updated successfully!");
      setSuccessMessage("Preferences updated successfully!");

      // Hide message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("❌ Error updating preferences:", error.response?.data?.message || error.message);
      setError("Failed to update preferences.");
      setTimeout(() => setError(""), 9000);
    }
  };

  // ✅ Fetch Bookmarked Articles
  const fetchBookmarks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bookmark`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      console.log("📌 Bookmarks received:", response.data.bookmarkedArticles);
      setBookmarks(response.data.bookmarkedArticles || []);
    } catch (error) {
      console.error("❌ Error fetching bookmarks:", error.response?.data?.message || error.message);
      setError("Failed to load bookmarked articles.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Remove Bookmark
  const removeBookmark = async (articleId) => {
    try {
      const encodedId = encodeURIComponent(articleId); // 🔹 Fix encoding issue

      await axios.delete(`${API_BASE_URL}/api/bookmark/${encodedId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      console.log(`✅ Bookmark removed: ${articleId}`);

      // 🔹 Remove bookmark instantly from UI
      setBookmarks((prev) => prev.filter((article) => article.articleId !== articleId));

      // ✅ Show success message
      setSuccessMessage("Bookmark removed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("❌ Error removing bookmark:", error.response?.data?.message || error.message);
      setError("Failed to remove bookmark. Try again.");
    }
  };

  // ✅ Handle Checkbox Change
  const handleCheckboxChange = (type, value) => {
    setPreferences((prev) => {
      const updatedValues = prev[type].includes(value)
        ? prev[type].filter((item) => item !== value)
        : [...prev[type], value];

      return { ...prev, [type]: updatedValues };
    });
  };

  // ✅ Handle Country Selection
  const handleCountryChange = (event) => {
    setPreferences((prev) => ({ ...prev, country: event.target.value }));
  };

  return (
    <Container className="mt-4">
      <h2>⚙️ Manage Your Preferences</h2>

      {error && <Alert variant="danger">{error}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Form>
        {/* ✅ Categories Selection */}
        <h5>News Categories</h5>
        {categoriesList.map((category) => (
          <Form.Check
            key={category}
            type="checkbox"
            label={category}
            checked={preferences.categories.includes(category)}
            onChange={() => handleCheckboxChange("categories", category)}
          />
        ))}

        {/* ✅ Country Selection */}
        <h5 className="mt-3">Preferred Country</h5>
        <Form.Select value={preferences.country} onChange={handleCountryChange}>
          {countryList.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </Form.Select>

        {/* ✅ News Sources Selection */}
        <h5 className="mt-3">Preferred News Sources</h5>
        {sourcesList.map((source) => (
          <Form.Check
            key={source}
            type="checkbox"
            label={source}
            checked={preferences.sources.includes(source)}
            onChange={() => handleCheckboxChange("sources", source)}
          />
        ))}

        <Button variant="primary" className="mt-3" onClick={updatePreferences}>
          Update Preferences
        </Button>
      </Form>

      <hr />

      <h2>📌 Your Bookmarked Articles</h2>

      {loading && <Spinner animation="border" />}
      {!loading && bookmarks.length === 0 && <p>No bookmarks yet. Start saving articles!</p>}

      <Row>
        {bookmarks.map((article) => (
          <Col key={article.articleId} md={4} className="mb-3">
            <Card>
              <Card.Img variant="top" src={article.image || "https://via.placeholder.com/150"} />
              <Card.Body>
                <Card.Title>{article.title}</Card.Title>
                <Card.Text>{article.description}</Card.Text>

                <Button variant="primary" href={article.url} target="_blank">
                  Read More
                </Button>

                <Button
                  variant="outline-danger"
                  className="ms-2"
                  onClick={() => removeBookmark(article.articleId)}
                >
                  ❌ Remove Bookmark
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Dashboard;
