import React, { useEffect, useState } from "react";
import { getTranscripts } from "../db";

export default function TranscriptHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    setHistory(getTranscripts());
  }, []);

  return (
    <div>
      <h2>Transcript History</h2>
      {history.length === 0 ? (
        <p>No transcripts yet.</p>
      ) : (
        <ul>
          {history.map((t, idx) => (
            <li key={idx}>
              <pre style={{ background: "#f5f5f5", padding: "0.5em" }}>{t}</pre>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}