import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function QuestionDetailPage() {
  const { id } = useParams();
  const [question, setQuestion] = useState(null);
  const [answerText, setAnswerText] = useState("");

  useEffect(() => {
    axios.get(`http://localhost:5000/api/questions/${id}`)
      .then((res) => {
        setQuestion(res.data);
      })
      .catch((err) => console.error(err));
  }, [id]);

  const handleSubmit = async () => {
    try {
      // Replace with your auth token if you have login working
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:5000/api/questions/${id}/answers`,
        { description: answerText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Answer submitted!");
      window.location.reload(); // reload page to see new answer
    } catch (err) {
      console.error(err);
      alert("Failed to submit answer");
    }
  };

  if (!question) return <div>Loading...</div>;

  return (
    <div>
      <h2>{question.question.title}</h2>
      <p>{question.question.description}</p>
      <p>Tags: {question.question.tags.join(", ")}</p>
      <p>Asked by: {question.question.username}</p>

      <h3>Answers:</h3>
      {question.answers.length === 0 ? (
        <p>No answers yet.</p>
      ) : (
        question.answers.map((a) => (
          <div key={a.id}>
            <p>{a.description}</p>
            <p>Votes: {a.votes}</p>
          </div>
        ))
      )}

      <h3>Submit Your Answer:</h3>
      <textarea
        value={answerText}
        onChange={(e) => setAnswerText(e.target.value)}
        rows="5"
        cols="60"
      ></textarea>
      <br />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default QuestionDetailPage;
