import { useEffect, useState } from "react";

function StudentDashboard() {

  const [assignments, setAssignments] =
    useState([]);

  const [submissionText, setSubmissionText] =
    useState({});

  // LOAD ASSIGNMENTS

  const loadAssignments = () => {

    fetch("http://localhost:3000/assignments")
      .then((res) => res.json())
      .then((data) => {
        setAssignments(data);
      });

  };

  useEffect(() => {

    loadAssignments();

  }, []);


  // SUBMIT ASSIGNMENT

  const submitAssignment =
    async (id) => {

      try {

        await fetch(
          `http://localhost:3000/assignments/${id}/submit`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              submission:
                submissionText[id],
            }),
          }
        );

        alert(
          "Assignment submitted!"
        );

        loadAssignments();

      } catch (error) {

        console.log(error);

      }
    };


  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom, #020617, #0f172a)",
        color: "white",
        padding: "40px",
        fontFamily: "Arial",
      }}
    >

      <h1
        style={{
          textAlign: "center",
          marginBottom: "40px",
          fontSize: "48px",
        }}
      >
        🎓 Student Dashboard
      </h1>

      <div
        style={{
          display: "grid",
          gap: "25px",
        }}
      >

        {assignments.map((assignment) => (

          <div
            key={assignment.id}
            style={{
              background: "#111827",
              padding: "25px",
              borderRadius: "20px",
            }}
          >

            <h2
              style={{
                marginBottom: "15px",
              }}
            >
              {assignment.title}
            </h2>

            <p>
              <strong>Status:</strong>{" "}
              {assignment.status}
            </p>

            <p>
              <strong>Due:</strong>{" "}
              {
                new Date(
                  assignment.dueDate
                ).toLocaleDateString()
              }
            </p>

            <p
              style={{
                marginTop: "10px",
              }}
            >
              <strong>Feedback:</strong>{" "}
              {
                assignment.feedback ||
                "No feedback yet"
              }
            </p>

            <textarea
              placeholder="Write your submission here..."
              value={
                submissionText[
                  assignment.id
                ] || ""
              }
              onChange={(e) =>
                setSubmissionText({
                  ...submissionText,

                  [assignment.id]:
                    e.target.value,
                })
              }
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "15px",
                borderRadius: "12px",
                border: "none",
                minHeight: "120px",
                fontSize: "16px",
              }}
            />

            <button
              onClick={() =>
                submitAssignment(
                  assignment.id
                )
              }
              style={{
                marginTop: "15px",
                padding: "14px",
                width: "100%",
                background: "#2563eb",
                border: "none",
                borderRadius: "12px",
                color: "white",
                fontWeight: "bold",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              📤 Submit Assignment
            </button>

          </div>

        ))}

      </div>

    </div>
  );
}

export default StudentDashboard;