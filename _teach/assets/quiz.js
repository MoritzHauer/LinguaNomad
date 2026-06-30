document.addEventListener("DOMContentLoaded", () => {
  const quizzes = document.querySelectorAll("[data-quiz]");

  for (const quiz of quizzes) {
    const questions = quiz.querySelectorAll(".quiz-question");
    const scoreNode = quiz.querySelector("[data-score]");

    const refreshScore = () => {
      let answered = 0;
      let correct = 0;

      for (const question of questions) {
        if (question.dataset.answered === "true") {
          answered += 1;
        }

        if (question.dataset.correct === "true") {
          correct += 1;
        }
      }

      if (scoreNode) {
        scoreNode.textContent = answered === questions.length
          ? `Score: ${correct}/${questions.length}. Review any red cards, then re-read the reference sheet once.`
          : `Answered ${answered}/${questions.length}. Keep going until every prompt has feedback.`;
      }
    };

    for (const question of questions) {
      const answer = question.dataset.answer;
      const explain = question.dataset.explain || "";
      const feedback = question.querySelector(".feedback");
      const options = question.querySelectorAll(".option");

      for (const option of options) {
        option.addEventListener("click", () => {
          if (question.dataset.answered === "true") {
            return;
          }

          question.dataset.answered = "true";

          const guess = option.dataset.value;
          const isCorrect = guess === answer;
          question.dataset.correct = String(isCorrect);

          for (const candidate of options) {
            candidate.disabled = true;

            if (candidate.dataset.value === answer) {
              candidate.classList.add("correct");
            }
          }

          if (!isCorrect) {
            option.classList.add("incorrect");
          }

          if (feedback) {
            feedback.textContent = isCorrect
              ? `Correct. ${explain}`
              : `Not quite. ${explain}`;
          }

          refreshScore();
        });
      }
    }

    refreshScore();
  }
});