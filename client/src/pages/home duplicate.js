import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Spinner, Alert } from "react-bootstrap";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

const Home = () => {
  const { user } = useAuth();
  const [news, setNews] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preferences, setPreferences] = useState(null);

  useEffect(() => {
    if (user) {
      fetchPreferences(); // ✅ Fetch preferences first
    } else {
      fetchGeneralNews(); // ✅ If not logged in, fetch general news
    }
  }, [user]);

  useEffect(() => {
    if (user && preferences) {
      fetchNews(preferences);
    }
  }, [preferences]);

  // ✅ Fetch User Preferences
  const fetchPreferences = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/preferences`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setPreferences(response.data.preferences || { categories: [], sources: [], country: "us" });
    } catch (error) {
      setError("Failed to load user preferences.");
    }
  };

  // ✅ Fetch News (Personalized)
  const fetchPersonalizedNews = async (userPreferences) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/news/personalized`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
  
      setNews(response.data.articles || []);
    } catch (error) {
      setError("Failed to load personalized news.");
    } finally {
      setLoading(false);
    }
  };
  

  // ✅ Fetch Bookmarks
  const fetchBookmarks = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API_BASE_URL}/api/bookmark`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setBookmarks(response.data.bookmarkedArticles || []);
    } catch (error) {
      console.error("Error fetching bookmarks:", error.message);
    }
  };

  // ✅ Toggle Bookmark (Add/Remove)
  const toggleBookmark = async (article) => {
    try {
      const isBookmarked = bookmarks.some((b) => b.articleId === article.articleId);
  
      if (isBookmarked) {
        // 🔹 Fix: Use only the unique article identifier (not full URL)
        const encodedId = encodeURIComponent(article.articleId);
  
        await axios.delete(`${API_BASE_URL}/api/bookmark/${encodedId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
  
        setBookmarks((prev) => prev.filter((b) => b.articleId !== article.articleId));
      } else {
        const response = await axios.post(
          `${API_BASE_URL}/api/bookmark`,
          {
            articleId: article.articleId,  // Ensure this is correct
            title: article.title,
            description: article.description,
            url: article.url,
            image: article.image,
          },
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
  
        console.log("✅ Bookmark added:", response.data.bookmarkedArticles);
        setBookmarks(response.data.bookmarkedArticles || []);
      }
    } catch (error) {
      console.error("❌ Error toggling bookmark:", error.response?.data || error.message);
    }
  };
  

  return (
    <Container className="mt-4">
      <h2>{user ? `📰 News for You, ${user.username}` : "📰 Latest News"}</h2>

      {loading && <Spinner animation="border" />}
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {news.map((article) => (
          <Col key={article.articleId} md={4} className="mb-3">
            <Card>
              <Card.Img variant="top" src={article.image || "https://via.placeholder.com/150"} />
              <Card.Body>
                <Card.Title>{article.title}</Card.Title>
                <Card.Text>{article.description}</Card.Text>
                <Button variant="primary" href={article.url} target="_blank">
                  Read More
                </Button>
                {user && (
                  <Button
                    variant={bookmarks.some((b) => b.articleId === article.articleId) ? "danger" : "outline-primary"}
                    onClick={() => toggleBookmark(article)}
                    className="ms-2"
                  >
                    {bookmarks.some((b) => b.articleId === article.articleId) ? "❌ Remove Bookmark" : "📌 Bookmark"}
                  </Button>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

    </Container>
  );
};

export default Home;