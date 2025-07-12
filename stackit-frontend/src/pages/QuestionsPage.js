import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

function QuestionsPage() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/questions")
      .then((res) => {
        setQuestions(res.data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>All Questions</h1>
      {questions.map((q) => (
        <div key={q.id} style={{ border: "1px solid #ccc", margin: "10px" }}>
          <h3>
            <Link to={`/question/${q.id}`}>{q.title}</Link>
          </h3>
          <p>{q.description.slice(0, 100)}...</p>
          <p>Tags: {q.tags.join(", ")}</p>
          <p>Asked by: {q.username}</p>
        </div>
      ))}
    </div>
  );
}

export default QuestionsPage;
