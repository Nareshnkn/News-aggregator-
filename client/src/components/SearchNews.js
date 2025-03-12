import { useState } from "react";
import axios from "axios";

const SearchNews = () => {
  const [query, setQuery] = useState("");
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return alert("Please enter a search term!");

    setLoading(true);
    try {
      const response = await axios.get("http://localhost:5000/api/news/search", {
        params: { query },
      });

      setNews(response.data.articles);
    } catch (error) {
      console.error("Error searching news:", error);
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <h2>🔍 Search News</h2>
      <form onSubmit={handleSearch} className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Enter keywords..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-primary mt-2">Search</button>
      </form>

      {loading && <p>Loading...</p>}

      <div>
        {news.length > 0 ? (
          news.map((article, index) => (
            <div key={index} className="card mb-3">
              <div className="card-body">
                <h5 className="card-title">{article.title}</h5>
                <p className="card-text">{article.description}</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  Read More
                </a>
              </div>
            </div>
          ))
        ) : (
          <p>No results found.</p>
        )}
      </div>
    </div>
  );
};

export default SearchNews;
