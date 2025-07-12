// vote on an answer
exports.voteAnswer = async (req, res) => {
  const { id } = req.params; // answer id
  const { vote } = req.body; // 'up' or 'down'

  try {
    const result = await pool.query(
      "UPDATE answers SET votes = votes + $1 WHERE id = $2 RETURNING *",
      [vote === "up" ? 1 : -1, id]
    );
    res.json({ msg: "Vote recorded!", answer: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Voting failed" });
  }
};

// accept an answer
exports.acceptAnswer = async (req, res) => {
  const { id } = req.params; // answer id

  try {
    // find the answer to get its question id
    const ans = await pool.query("SELECT * FROM answers WHERE id = $1", [id]);
    const questionId = ans.rows[0].question_id;

    // check if the requester owns the question
    const question = await pool.query(
      "SELECT * FROM questions WHERE id = $1",
      [questionId]
    );

    if (question.rows[0].user_id !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized to accept this answer" });
    }

    // mark all other answers as not accepted
    await pool.query(
      "UPDATE answers SET is_accepted = false WHERE question_id = $1",
      [questionId]
    );

    // mark this one as accepted
    await pool.query(
      "UPDATE answers SET is_accepted = true WHERE id = $1",
      [id]
    );

    res.json({ msg: "Answer accepted!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Accepting answer failed" });
  }
};

const pool = require("../db/db"); // make sure you have this at the top if not already

exports.postAnswer = async (req, res) => {
  const { id } = req.params; // question id
  const { description } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO answers (question_id, user_id, description) VALUES ($1, $2, $3) RETURNING *",
      [id, req.user.id, description]
    );
    res.json({ msg: "Answer posted!", answer: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to post answer" });
  }
};