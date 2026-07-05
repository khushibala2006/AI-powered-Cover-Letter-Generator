import { useState } from 'react';
import './App.css';
import heroImg from './assets/hero.png';
import reactLogo from './assets/react.svg';
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.min.mjs";
import ReactMarkdown from "react-markdown";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    company: "",
    skills: "",
  });

  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resumeText, setResumeText] = useState("");

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
      if (error) {
        setError("");
      }
    };
    const handleResumeUpload = async (e) => {
  const file = e.target.files[0];

  if (!file) return;

  const arrayBuffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({
    data: arrayBuffer,
  }).promise;

  let text = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);

    const content = await page.getTextContent();

    text += content.items.map((item) => item.str).join(" ");
  }

  setResumeText(text);
};

  const generateLetter = async () => {
  setLoading(true);
  setError("");

  const prompt = `
Write a professional one-page cover letter.

Candidate Name: ${formData.name}
Job Role: ${formData.role}
Company: ${formData.company}
Skills: ${formData.skills}

Resume:
${resumeText}

Requirements:
- Keep it between 250 and 350 words.
- Use a professional tone.
- Mention the candidate's skills naturally.
- Explain why the candidate is interested in the company.
- End with a professional closing.
- Do not use placeholders.
`;

  try {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {

  method: "POST",

  headers: {

    Authorization: `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`,

    "Content-Type": "application/json",

  },

  body: JSON.stringify({

    model: "llama-3.3-70b-versatile",

    messages: [

      {

        role: "user",

        content: prompt,

      },

    ],

  }),

});

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})); // Try to get error details
        const errorMessage =
          errorData.error?.message || `API request failed with status ${response.status}`;
        // Provide a more specific message for 401 errors
        if (response.status === 401) {
          throw new Error('Authorization error: Please check your API key.');
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setCoverLetter(data.choices[0].message.content);
  } catch (error) {
    console.error("Error generating cover letter:", error);
    setError(error.message);
  } finally {
    setLoading(false);
  }
};
  const copyToClipboard = () => {
  navigator.clipboard.writeText(coverLetter);
  };

  

  return (
    <div className="app-container">
      <header className="header">
        <img src={reactLogo} className="logo" alt="React logo" />
        <h1>AI Cover Letter Generator</h1>
      </header>

      <main className="main-content">
        <div className="form-section">
          <div className="form-group">
            <label htmlFor="name">Your Name:</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="role">Applying for Role:</label>
            <input type="text" id="role" name="role" value={formData.role} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="company">Company Name:</label>
            <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label htmlFor="skills">Your Skills (comma-separated):</label>
            <input type="text" id="skills" name="skills" value={formData.skills} onChange={handleChange} required />
          </div>
          
          <div>
              <label htmlFor="resume">Upload Resume (PDF): </label><input type="file" id="resume" accept=".pdf" onChange={handleResumeUpload} />
          </div>

          <button type="button" onClick={generateLetter} disabled={loading}>
            {loading ? "Generating..." : "Generate Cover Letter"}
          </button>
          {error && <p style={{ color: 'red', marginTop: '1rem' }}>Error: {error}</p>}
        </div>

        <div className="output-section">
          <h2>Your Cover Letter</h2>
          {loading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Generating, please wait...</p>
            </div>
          )}
            <ReactMarkdown>{coverLetter}</ReactMarkdown>
          {coverLetter && (
            <button type="button" onClick={copyToClipboard} className="btn btn-secondary" style={{marginTop: '1rem'}}>
              Copy to Clipboard
            </button>
          )}

          {resumeText && <textarea rows="8" cols="60" value={resumeText} readOnly />}
          {resumeText && <p>✅ Resume uploaded successfully.</p>}
        </div>
      </main>
    </div>
  )
}

export default App
