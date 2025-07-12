const pool = require("../db/db");
const answerController = require("../controllers/answerController");

exports.askQuestion = async (req, res) => {
  const { title, description, tags } = req.body;
  const userId = req.user.id;

  try {
    const newQuestion = await pool.query(
      "INSERT INTO questions (user_id, title, description) VALUES ($1, $2, $3) RETURNING *",
      [userId, title, description]
    );

    const questionId = newQuestion.rows[0].id;

    for (let tagName of tags) {
      let tag = await pool.query("SELECT * FROM tags WHERE name = $1", [tagName]);

      if (tag.rows.length === 0) {
        tag = await pool.query("INSERT INTO tags (name) VALUES ($1) RETURNING *", [tagName]);
      }

      await pool.query("INSERT INTO question_tags (question_id, tag_id) VALUES ($1, $2)",
        [questionId, tag.rows[0].id]
      );
    }

    res.json({ msg: "Question posted!", question: newQuestion.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await pool.query(`
      SELECT 
        q.id, q.title, q.description, q.created_at, 
        u.username,
        ARRAY_AGG(t.name) AS tags
      FROM questions q
      JOIN users u ON q.user_id = u.id
      LEFT JOIN question_tags qt ON q.id = qt.question_id
      LEFT JOIN tags t ON qt.tag_id = t.id
      GROUP BY q.id, u.username
      ORDER BY q.created_at DESC
    `);

    res.json(questions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.getQuestionById = async (req, res) => {
  const { id } = req.params;
  try {
    // Get question
    const question = await pool.query(`
      SELECT 
        q.id, q.title, q.description, q.created_at, 
        u.username,
        ARRAY_AGG(t.name) AS tags
      FROM questions q
      JOIN users u ON q.user_id = u.id
      LEFT JOIN question_tags qt ON q.id = qt.question_id
      LEFT JOIN tags t ON qt.tag_id = t.id
      WHERE q.id = $1
      GROUP BY q.id, u.username
    `, [id]);

    if (question.rows.length === 0) {
      return res.status(404).json({ msg: "Question not found" });
    }

    // Get answers
    const answers = await pool.query(`
      SELECT 
        a.id, a.description, a.votes, a.is_accepted, a.created_at,
        u.username
      FROM answers a
      JOIN users u ON a.user_id = u.id
      WHERE a.question_id = $1
      ORDER BY a.created_at ASC
    `, [id]);

    res.json({
      question: question.rows[0],
      answers: answers.rows
    });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.postAnswer = async (req, res) => {
  const { description } = req.body;
  const userId = req.user.id;
  const { id: questionId } = req.params;

  try {
    const newAnswer = await pool.query(
      "INSERT INTO answers (question_id, user_id, description) VALUES ($1, $2, $3) RETURNING *",
      [questionId, userId, description]
    );

    res.json({ msg: "Answer posted!", answer: newAnswer.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.voteAnswer = async (req, res) => {
  const { vote } = req.body; // vote should be +1 or -1
  const { id: answerId } = req.params;

  try {
    // Update votes
    const updated = await pool.query(
      "UPDATE answers SET votes = votes + $1 WHERE id = $2 RETURNING *",
      [vote, answerId]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ msg: "Answer not found" });
    }

    res.json({
      msg: `Vote ${vote > 0 ? "upvoted" : "downvoted"}!`,
      answer: updated.rows[0]
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.acceptAnswer = async (req, res) => {
  const { id: answerId } = req.params;
  const userId = req.user.id;

  try {
    // Find the answer & related question
    const answer = await pool.query(
      "SELECT * FROM answers WHERE id = $1",
      [answerId]
    );

    if (answer.rows.length === 0) {
      return res.status(404).json({ msg: "Answer not found" });
    }

    const questionId = answer.rows[0].question_id;

    const question = await pool.query(
      "SELECT * FROM questions WHERE id = $1",
      [questionId]
    );

    if (question.rows.length === 0) {
      return res.status(404).json({ msg: "Question not found" });
    }

    if (question.rows[0].user_id !== userId) {
      return res.status(403).json({ msg: "Only the question owner can accept an answer" });
    }

    // First, unmark any previous accepted answers
    await pool.query(
      "UPDATE answers SET is_accepted = false WHERE question_id = $1",
      [questionId]
    );

    // Mark this one as accepted
    await pool.query(
      "UPDATE answers SET is_accepted = true WHERE id = $1",
      [answerId]
    );

    res.json({ msg: "Answer marked as accepted!" });

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};
