import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import AuthContext from "../../../../context/AuthContext";

const StudentClassroomDetails = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [scheduledTests, setScheduledTests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NEW: State for handling test start errors ---
  const [startTestError, setStartTestError] = useState("");

  // This useEffect fetches the list of scheduled tests (unchanged)
  useEffect(() => {
    const fetchScheduledTests = async () => {
      if (!token || !classroomId) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/student/classrooms/${classroomId}/scheduled-tests`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch scheduled tests.");
        const data = await response.json();
        setScheduledTests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchScheduledTests();
  }, [token, classroomId]);

  // --- NEW: Function to handle starting a scheduled test ---
  const handleStartScheduledTest = async (scheduledTestId) => {
    setStartTestError(""); // Clear previous errors
    try {
      // 1. Call the new, specific backend endpoint for scheduled tests
      const response = await fetch(
        `http://localhost:5000/api/tests/start-scheduled/${scheduledTestId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Could not start the test.");
      }

      // 2. On success, navigate to the test engine.
      // CRITICAL: Pass the questions, session ID, and fixed end time via navigation state.
      navigate("/test/engine", {
        state: {
          questions: data.questions,
          testSessionId: data.testSessionId,
          endTime: data.endTime,
          testType: "scheduled", // A flag to tell the engine this is a special test
        },
      });
    } catch (err) {
      setStartTestError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <Link
            to="/student-dashboard"
            className="text-blue-400 hover:underline mb-4 block"
          >
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-4xl font-bold">Scheduled Tests</h1>
          <p className="text-gray-400">
            Tests scheduled for this classroom will appear here.
          </p>
        </header>

        <main className="bg-gray-800 p-6 rounded-2xl shadow-lg">
          {isLoading && (
            <p className="text-gray-400">Loading scheduled tests...</p>
          )}
          {error && <p className="text-red-500">Error: {error}</p>}

          {/* Display any error messages from trying to start a test */}
          {startTestError && (
            <p className="text-red-500 text-center mb-4 p-3 bg-red-900/50 rounded-lg">
              {startTestError}
            </p>
          )}

          {!isLoading && scheduledTests.length === 0 && (
            <p className="text-gray-400">
              There are currently no tests scheduled for this classroom.
            </p>
          )}
          <div className="space-y-4">
            {scheduledTests.map((test) => {
              // --- NEW: Logic to determine the status of the test ---
              const now = new Date();
              const startTime = new Date(test.startTime);
              const endTime = new Date(test.endTime);
              let status = "upcoming";
              if (now >= startTime && now <= endTime) {
                status = "live";
              } else if (now > endTime) {
                status = "ended";
              }

              return (
                <div
                  key={test._id}
                  className="bg-gray-700 p-4 rounded-lg flex justify-between items-center"
                >
                  <div>
                    <p className="font-bold text-lg">{test.title}</p>
                    <p className="text-sm text-gray-400">
                      Available from {startTime.toLocaleString()} to{" "}
                      {endTime.toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartScheduledTest(test._id)}
                    // The button is only enabled if the status is 'live'
                    disabled={status !== "live"}
                    className={`font-bold py-2 px-6 rounded-lg transition 
                      ${
                        status === "live"
                          ? "bg-green-600 hover:bg-green-700 cursor-pointer"
                          : ""
                      }
                      ${
                        status === "upcoming"
                          ? "bg-yellow-600 cursor-not-allowed"
                          : ""
                      }
                      ${
                        status === "ended"
                          ? "bg-gray-600 cursor-not-allowed"
                          : ""
                      }
                    `}
                  >
                    {status === "live" && "Start Test"}
                    {status === "upcoming" && "Upcoming"}
                    {status === "ended" && "Ended"}
                  </button>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentClassroomDetails;
