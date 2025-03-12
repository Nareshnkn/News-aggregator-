import { useState } from "react";
import { Container, Form, Button, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import axios from "axios";

const Search = () => {
  const [query, setQuery] = useState("");
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`http://localhost:5000/api/news/search?query=${query}`);
      console.log("✅ API Response:", response.data);

      if (response.data && Array.isArray(response.data.articles)) {
        setNews(response.data.articles);
      } else {
        console.error("❌ Unexpected API response:", response.data);
        setError("Invalid response from server.");
        setNews([]);
      }
    } catch (error) {
      console.error("❌ API Error:", error.response?.data || error.message);
      setError(error.response?.data?.message || "Failed to fetch search results.");
      setNews([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="text-center">🔍 Search News</h2>
      {error && <Alert variant="danger" className="text-center">{error}</Alert>}
      <Form onSubmit={handleSearch} className="mb-4">
        <Form.Group controlId="searchQuery">
          <Form.Control
            type="text"
            placeholder="Enter keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </Form.Group>
        <Button type="submit" variant="primary" className="mt-2" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </Form>

      {loading && <Spinner animation="border" className="d-block mx-auto" />}

      <Row>
        {news.length > 0 ? (
          news.map((article, index) => (
            <Col key={index} md={4} className="mb-4">
              <Card>
                <Card.Img
                  variant="top"
                  src={article.urlToImage || article.image || "https://via.placeholder.com/300x200?text=No+Image"}
                  alt="News Thumbnail"
                />
                <Card.Body>
                  <Card.Title>{article.title}</Card.Title>
                  <Card.Text>{article.description}</Card.Text>
                  <Button variant="primary" href={article.url} target="_blank">
                    Read More
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          !loading && <p className="text-center w-100">No news found. Try another search.</p>
        )}
      </Row>
    </Container>
  );
};

export default Search;