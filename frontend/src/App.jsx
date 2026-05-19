import { useEffect, useState } from "react";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function App() {

  const [assignments, setAssignments] =
    useState([]);

  const [view, setView] =
    useState("teacher");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");


  // LOAD ASSIGNMENTS

  useEffect(() => {

    fetch(
      "https://classroom-companion-3hvr.onrender.com/assignments"
    )
      .then((res) => res.json())
      .then((data) => {

        setAssignments(data);

      })
      .catch((err) => {
        console.log(err);
      });

  }, []);


  // SUBMIT ASSIGNMENT

  const submitAssignment =
    async (id, submission) => {

      try {

        await fetch(
          `https://classroom-companion-3hvr.onrender.com/assignments/${id}/submit`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              submission,
            }),
          }
        );

        window.location.reload();

      } catch (error) {

        console.log(error);

      }
    };


  // COMPLETE ASSIGNMENT

  const completeAssignment =
    async (id) => {

      try {

        await fetch(
          `https://classroom-companion-3hvr.onrender.com/assignments/${id}/complete`,
          {
            method: "POST",
          }
        );

        window.location.reload();

      } catch (error) {

        console.log(error);

      }
    };


  // STATUS COLORS

  const getStatusColor =
    (status) => {

      if (status === "completed") {
        return "#22c55e";
      }

      if (status === "submitted") {
        return "#3b82f6";
      }

      return "#f59e0b";
    };


  // ANALYTICS

  const analyticsData = [

    {
      name: "Pending",
      value:
        assignments.filter(
          (a) =>
            a.status ===
            "pending"
        ).length,
    },

    {
      name: "Submitted",
      value:
        assignments.filter(
          (a) =>
            a.status ===
            "submitted"
        ).length,
    },

    {
      name: "Completed",
      value:
        assignments.filter(
          (a) =>
            a.status ===
            "completed"
        ).length,
    },

  ];

  const COLORS = [
    "#f59e0b",
    "#3b82f6",
    "#22c55e",
  ];


  // FILTERS

  const filteredAssignments =
    assignments.filter((assignment) => {

      const matchesSearch =

        assignment.title
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )

        ||

        assignment.student?.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          );

      const matchesStatus =

        statusFilter === "all"

        ||

        assignment.status ===
        statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });


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

      {/* HEADER */}

      <h1
        style={{
          textAlign: "center",
          fontSize: "60px",
        }}
      >
        Classroom Companion 🚀
      </h1>

      <p
        style={{
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "24px",
          marginBottom: "40px",
        }}
      >
        AI Powered Assignment Dashboard
      </p>


      {/* TOGGLE BUTTONS */}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "40px",
        }}
      >

        <button
          onClick={() =>
            setView("teacher")
          }
          style={{
            padding: "12px 25px",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
            background:
              view === "teacher"
                ? "#2563eb"
                : "#1e293b",
            color: "white",
          }}
        >
          Teacher Dashboard
        </button>

        <button
          onClick={() =>
            setView("student")
          }
          style={{
            padding: "12px 25px",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
            background:
              view === "student"
                ? "#2563eb"
                : "#1e293b",
            color: "white",
          }}
        >
          Student Dashboard
        </button>

      </div>


      {/* SEARCH */}

      <div
        style={{
          display: "flex",
          gap: "20px",
          marginBottom: "30px",
        }}
      >

        <input
          placeholder="Search..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          style={{
            padding: "14px",
            borderRadius: "12px",
            border: "none",
            width: "300px",
          }}
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(
              e.target.value
            )
          }
          style={{
            padding: "14px",
            borderRadius: "12px",
            border: "none",
          }}
        >

          <option value="all">
            All
          </option>

          <option value="pending">
            Pending
          </option>

          <option value="submitted">
            Submitted
          </option>

          <option value="completed">
            Completed
          </option>

        </select>

      </div>


      {/* ANALYTICS */}

      <div
        style={{
          width: "100%",
          height: "400px",
          background: "#111827",
          borderRadius: "24px",
          padding: "20px",
          marginBottom: "40px",
        }}
      >

        <h2
          style={{
            textAlign: "center",
          }}
        >
          Assignment Analytics 📊
        </h2>

        <ResponsiveContainer
          width="100%"
          height="85%"
        >

          <PieChart>

            <Pie
              data={analyticsData}
              dataKey="value"
              nameKey="name"
              outerRadius={120}
              label
            >

              {analyticsData.map(
                (entry, index) => (

                  <Cell
                    key={index}
                    fill={
                      COLORS[index]
                    }
                  />

                )
              )}

            </Pie>

            <Tooltip />

            <Legend />

          </PieChart>

        </ResponsiveContainer>

      </div>


      {/* ASSIGNMENTS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(350px, 1fr))",
          gap: "25px",
        }}
      >

        {filteredAssignments.map(
          (assignment) => (

            <div
              key={assignment.id}
              style={{
                background:
                  "#111827",
                padding: "25px",
                borderRadius:
                  "24px",
              }}
            >

              <h2>
                {assignment.title}
              </h2>

              <p>
                <strong>
                  Student:
                </strong>{" "}
                {
                  assignment.student
                    ?.name
                }
              </p>

              <p>
                <strong>
                  Status:
                </strong>{" "}

                <span
                  style={{
                    color:
                      getStatusColor(
                        assignment.status
                      ),
                    fontWeight:
                      "bold",
                  }}
                >
                  {
                    assignment.status
                  }
                </span>
              </p>

              <p>
                <strong>
                  Due:
                </strong>{" "}
                {new Date(
                  assignment.dueDate
                ).toLocaleDateString()}
              </p>


              {/* STUDENT DASHBOARD */}

              {view ===
                "student" && (

                <div
                  style={{
                    marginTop:
                      "20px",
                  }}
                >

                  <textarea
                    placeholder="Write submission..."
                    onChange={(e) => {
                      assignment.tempSubmission =
                        e.target.value;
                    }}
                    style={{
                      width: "100%",
                      height: "100px",
                      borderRadius:
                        "12px",
                      padding: "10px",
                      marginBottom:
                        "10px",
                    }}
                  />

                  <button
                    onClick={() =>
                      submitAssignment(
                        assignment.id,
                        assignment.tempSubmission
                      )
                    }
                    style={{
                      padding:
                        "10px 20px",
                      borderRadius:
                        "12px",
                      border: "none",
                      background:
                        "#2563eb",
                      color:
                        "white",
                      cursor:
                        "pointer",
                    }}
                  >
                    Submit Assignment
                  </button>

                </div>
              )}


              {/* TEACHER DASHBOARD */}

              {view ===
                "teacher" && (

                <div
                  style={{
                    marginTop:
                      "20px",
                  }}
                >

                  <button
                    onClick={() =>
                      completeAssignment(
                        assignment.id
                      )
                    }
                    style={{
                      padding:
                        "10px 20px",
                      borderRadius:
                        "12px",
                      border: "none",
                      background:
                        "#22c55e",
                      color:
                        "white",
                      cursor:
                        "pointer",
                    }}
                  >
                    Mark Completed
                  </button>

                </div>
              )}


              {/* PROGRESS LOGS */}

              <div
                style={{
                  marginTop:
                    "20px",
                }}
              >

                <h3>
                  Progress Logs
                </h3>

                {assignment
                  .progressLogs
                  ?.length ===
                0 ? (

                  <p>
                    No progress yet
                  </p>

                ) : (

                  assignment.progressLogs?.map(
                    (log) => (

                      <div
                        key={log.id}
                        style={{
                          background:
                            "#1e293b",
                          padding:
                            "10px",
                          borderRadius:
                            "10px",
                          marginTop:
                            "10px",
                        }}
                      >
                        ✅ {log.message}
                      </div>

                    )
                  )

                )}

              </div>

            </div>

          )
        )}

      </div>

    </div>
  );
}

export default App;