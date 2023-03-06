const express = require("express");
const { Configuration, OpenAIApi } = require("openai");
const app = express();

const api_key = "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"; // Remplacer avec votre clé API OpenAI

const configuration = new Configuration({
  apiKey: api_key,
});

const openai = new OpenAIApi(configuration);

async function generateLessonList(examType, theme) {
  const prompt = `
        Sans mettre aucune introduction ni conclusion dans ta reponse, genere un fichier json bien formatté listant 
        la liste des lessons que je dois maitriser pour mon examen de ${examType} sur le theme de ${theme} en suivant un ordre de priorité.
        Le format devrait etre un peu comme suit:
        {
            datas:["lesson1","lesson2"]
        }
    `;
  const completions = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: 2000,
  });

  const lessonList = completions.data.choices[0].text.trim();
  return lessonList;
}
async function generateLesson(lessonTopic) {
  const prompt = `Sans mettre aucune introduction ni conclusion dans ta reponse, enseigne-moi le sujet ${lessonTopic}.
  Soit precis dans les explications`;
  const completions = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: prompt,
    max_tokens: 2000
  })
  const lesson = completions.data.choices[0].text.trim()
  return lesson
}

app.get("/exam-lessons", async (req, res) => {
  const { examType, theme } = req.query;
  if (!examType || !theme)
    return res.status(500).json({
      error: "Provide an examType and a theme query parameters",
    });
  try {
    const lessonList = await generateLessonList(examType, theme);
    res.send(lessonList);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error generating lesson list",
    });
  }
});

app.get("/generate-lesson", async (req, res) => {
  const { lesson } = req.query;
  if (!lesson)
    return res.status(500).json({
      error: "Provide a lesson query parameter.",
    });
  try {
    const lesson_generated = await generateLesson(lesson)
    res.send(lesson_generated)
  } catch (error) {
    console.log(error);
    res.status(500).json({
      error: error,
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
