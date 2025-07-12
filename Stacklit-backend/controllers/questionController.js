const pool = require("../db/db");

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
