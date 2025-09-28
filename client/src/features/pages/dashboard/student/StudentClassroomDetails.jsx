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
  const [startTestError, setStartTestError] = useState("");

  useEffect(() => {
    const fetchScheduledTests = async () => {
      if (!token || !classroomId) return;
      setIsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5000/api/student/classroom-tests/${classroomId}`,
          { headers: { Authorization: `Bearer ${token}` } }
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

  const handleStartScheduledTest = async (scheduledTestId) => {
    setStartTestError("");
    try {
      const response = await fetch(
        `http://localhost:5000/api/tests/start-scheduled/${scheduledTestId}`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Could not start the test.");

      navigate("/test/engine", {
        state: {
          questions: data.questions,
          testSessionId: data.testSessionId,
          endTime: data.endTime,
          testType: "scheduled",
          scheduledTestId,
        },
      });
    } catch (err) {
      setStartTestError(err.message);
    }
  };

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-900 to-orange-700 animate-gradient-x">
      {/* Glassmorphic blur overlay */}
      <div className="absolute inset-0 backdrop-blur-xl"></div>

      <div className="relative z-10 max-w-5xl mx-auto p-8 space-y-6">
        {/* Header */}
        <header className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => navigate("/student-dashboard")}
            className="bg-white/20 border border-white/30 text-white px-5 py-2.5 rounded-lg hover:bg-white/25 transition shadow-md"
          >
            ← Back to Dashboard
          </button>
          <div>
            <h1 className="text-4xl font-extrabold text-white">
              Scheduled Tests
            </h1>
            <p className="text-white/80">
              All tests scheduled for this classroom will appear here.
            </p>
          </div>
        </header>

        {/* Loading & Errors */}
        {isLoading && (
          <p className="text-white/80 text-center">
            Loading scheduled tests...
          </p>
        )}
        {error && (
          <p className="text-red-400 text-center bg-white/20 backdrop-blur-xl py-3 px-4 rounded-lg">
            {error}
          </p>
        )}
        {startTestError && (
          <p className="text-red-400 text-center bg-white/20 backdrop-blur-xl py-3 px-4 rounded-lg">
            {startTestError}
          </p>
        )}

        {/* No Tests */}
        {!isLoading && scheduledTests.length === 0 && (
          <div className="bg-white/20 backdrop-blur-xl p-10 rounded-2xl text-center border border-white/30 shadow-lg">
            <p className="text-white/80 text-lg">
              No tests are currently scheduled for this classroom.
            </p>
          </div>
        )}

        {/* Test List */}
        <div className="space-y-6">
          {scheduledTests.map((test) => {
            const { status, resultId } = test;
            const startTime = new Date(test.startTime);
            const endTime = new Date(test.endTime);

            return (
              <div
                key={test._id}
                className="bg-white/20 backdrop-blur-xl border border-white/30 p-6 rounded-2xl flex flex-col sm:flex-row sm:justify-between sm:items-center hover:scale-[1.02] transition shadow-lg"
              >
                <div className="mb-4 sm:mb-0">
                  <p className="text-xl font-bold text-white">{test.title}</p>
                  {status === "attempted" ? (
                    <p className="text-white/80 text-sm">
                      Completed on {new Date(test.updatedAt).toLocaleString()}
                    </p>
                  ) : (
                    <p className="text-white/80 text-sm">
                      Available from {startTime.toLocaleString()} to{" "}
                      {endTime.toLocaleString()}
                    </p>
                  )}
                </div>

                {status === "attempted" ? (
                  <Link
                    to={`/scheduled-results/${resultId}`}
                    className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-blue-700 transition shadow-md"
                  >
                    View Result
                  </Link>
                ) : (
                  <button
                    onClick={() => handleStartScheduledTest(test._id)}
                    disabled={status !== "live"}
                    className={`font-bold py-2 px-6 rounded-lg shadow-md transition ${
                      status === "live"
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-white/20 text-white/50 cursor-not-allowed"
                    }`}
                  >
                    {status === "live" && "Start Test"}
                    {status === "upcoming" && "Upcoming"}
                    {status === "ended" && "Ended"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentClassroomDetails;
