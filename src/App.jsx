import { useState } from 'react'
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

console.log(import.meta.env.VITE_GEMINI_API_KEY);

function App() {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    company: "",
    skills: "",
  });

  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value,
      });
    };

  const generateLetter = async () => {
  setLoading(true);

  const prompt = `
Write a professional cover letter.

Candidate Name: ${formData.name}
Job Role: ${formData.role}
Company: ${formData.company}
Skills: ${formData.skills}
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );
const data = await response.json();

console.log("Response:", data);

if (!response.ok) {
  throw new Error(data.error?.message || "Request failed");
}

setCoverLetter(data.candidates[0].content.parts[0].text);
  } catch (error) {
    console.error("Error generating cover letter:", error);
  } finally {
    setLoading(false);
  }
};
  const copyToClipboard = () => {
  navigator.clipboard.writeText(coverLetter);
  };

  return (
    <div>

      <h1>AI Cover Letter Generator</h1>
      <form action="submit" method="post">
        <label htmlFor="name">CandidateName:</label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
        <br/>

        <label htmlFor="role">Role:</label>
        <input type="text" id="role" name="role" value={formData.role} onChange={handleChange} required />
        <br/>

        <label htmlFor="company">Company:</label>
        <input type="text" id="company" name="company" value={formData.company} onChange={handleChange} required />
        <br/>

        <label htmlFor="skills">Skills:</label>
        <input type="text" id="skills" name="skills" value={formData.skills} onChange={handleChange} required />
        <br/>

      </form>
       
      <button type="button" onClick={generateLetter}>
        Generate Cover Letter
      </button>

      <button type="button" onClick={copyToClipboard}>
        Copy to Clipboard
      </button>

      <h2>Generated Cover Letter</h2>
      {loading ? (
  <p>Generating...</p>
) : (
  <pre>{coverLetter}</pre>
)}
      
    </div>
  )
}

export default App
