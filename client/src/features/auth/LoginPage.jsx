import React, { useState, useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AuthContext from "../../context/AuthContext";
import gsap from "gsap";

const LoginPage = () => {
  const [regId, setRegId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const { loginAction } = useContext(AuthContext);

  // Refs
  const welcomeRef = useRef(null);
  const loginBoxRef = useRef(null);
  const shapesRef = useRef([]);

  useEffect(() => {
    // Welcome text animation on load
    gsap.set(welcomeRef.current, { opacity: 0, y: -30 });
    gsap.to(welcomeRef.current, {
      y: 0,
      opacity: 1,
      duration: 1.2,
      ease: "power3.out",
    });

    // Floating rotating shapes
    shapesRef.current.forEach((shape, i) => {
      gsap.to(shape, {
        rotate: 360,
        repeat: -1,
        duration: 20 + i * 5,
        ease: "linear",
      });
      gsap.to(shape, {
        y: "+=25",
        yoyo: true,
        repeat: -1,
        duration: 4 + i,
        ease: "sine.inOut",
      });
    });
  }, []);

  useEffect(() => {
    if (showLogin) {
      // Move welcome section left
      gsap.to(welcomeRef.current, {
        x: "-240px",
        duration: 1,
        ease: "power3.inOut",
      });

      // Animate login box in
      gsap.fromTo(
        loginBoxRef.current,
        { x: "240px", scale: 0.8, opacity: 0 },
        {
          x: 0,
          scale: 1,
          opacity: 1,
          duration: 1,
          ease: "elastic.out(1, 0.5)",
        }
      );
    }
  }, [showLogin]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!regId || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await loginAction(regId, password);
    } catch (err) {
      setError(err.message || "Something went wrong during login.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-700 via-blue-500 to-orange-400 overflow-hidden">
      {/* Floating Shapes */}
      <div
        ref={(el) => (shapesRef.current[0] = el)}
        className="absolute top-12 left-12 w-24 h-24 bg-white/20 rounded-full"
      ></div>
      <div
        ref={(el) => (shapesRef.current[1] = el)}
        className="absolute bottom-20 right-24 w-36 h-36 bg-white/10 rotate-45"
      ></div>
      <div
        ref={(el) => (shapesRef.current[2] = el)}
        className="absolute top-1/4 right-1/3 w-20 h-20 bg-white/20 rounded-lg"
      ></div>

      {/* Welcome Section */}
      <div
        ref={welcomeRef}
        className="flex flex-col items-center text-center text-white px-6 max-w-3xl"
      >
        <h1 className="text-6xl font-extrabold mb-6 drop-shadow-lg tracking-wide">
          Welcome to <span className="text-orange-300">ProLearn</span>
        </h1>

        <p className="text-xl md:text-2xl mb-10 leading-relaxed text-white/90 drop-shadow-md">
          Your smart learning companion for the future 🚀. Practice aptitude &
          coding, explore interactive tests, and track your performance with
          powerful insights.
          <br />
          <span className="text-orange-200 font-semibold">
            Learn. Compete. Achieve.
          </span>
        </p>

        {!showLogin && (
          <button
            onClick={() => setShowLogin(true)}
            className="px-10 py-4 bg-orange-500 text-white text-lg font-semibold rounded-full shadow-lg hover:bg-orange-600 transition transform hover:scale-105"
          >
            Get Started
          </button>
        )}
      </div>

      {/* Login Box */}
      {showLogin && (
        <div
          ref={loginBoxRef}
          className="absolute right-20 bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md"
        >
          <h2 className="text-3xl font-bold mb-8 text-center text-blue-600">
            Login to ProLearn
          </h2>
          <form onSubmit={handleLogin}>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}

            <div className="mb-5">
              <label className="block text-gray-700 mb-1">
                Registration ID
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
                placeholder="Enter your Reg ID"
                value={regId}
                onChange={(e) => setRegId(e.target.value)}
              />
            </div>

            <div className="mb-8">
              <label className="block text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring focus:border-blue-400"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-200"
            >
              Login
            </button>
          </form>

          <p className="text-center text-sm mt-6">
            New here?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              Register now
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
