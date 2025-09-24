import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    role: "Student",
    rollNo: "",
    regId: "",
    batch: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // Refs for animations
  const formRef = useRef(null);
  const shapesRef = useRef([]);

  useEffect(() => {
    // Animate register box on load
    gsap.fromTo(
      formRef.current,
      { scale: 0.8, opacity: 0, y: -40 },
      { scale: 1, opacity: 1, y: 0, duration: 1, ease: "power3.out" }
    );

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim())
      newErrors.fullName = "Full Name is required.";
    if (!formData.password.trim()) newErrors.password = "Password is required.";
    if (!formData.confirmPassword.trim())
      newErrors.confirmPassword = "Confirm Password is required.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    if (formData.role === "Student" || formData.role === "HOD") {
      if (!formData.regId.trim()) {
        newErrors.regId = "Registration ID is required.";
      }
    }
    if (formData.role === "Student") {
      if (!formData.rollNo.trim()) newErrors.rollNo = "Roll No is required.";
      else if (!/^\d{2}MCA\d{2}$/.test(formData.rollNo))
        newErrors.rollNo = "Invalid Roll No format (e.g., 24MCA01)";
      if (!formData.batch.trim()) newErrors.batch = "Batch is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch(
          "http://localhost:5000/api/auth/register",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message);
        } else {
          alert(data.message); // success
          setFormData({
            fullName: "",
            role: "Student",
            rollNo: "",
            regId: "",
            batch: "",
            password: "",
            confirmPassword: "",
          });
          navigate("/login");
        }
      } catch (err) {
        console.error("Error submitting form:", err);
        alert("Something went wrong.");
      }
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-blue-500 to-orange-400 animate-gradient-x"></div>
      <div className="absolute inset-0 backdrop-blur-sm"></div>

      {/* Floating shapes */}
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

      {/* Register Box */}
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="relative bg-white/10 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-10 w-full max-w-4xl text-white"
      >
        <h2 className="text-3xl font-bold mb-8 text-center drop-shadow-md">
          Create Your Account
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border border-white/30 bg-white/20 text-white px-4 py-2 rounded-md focus:ring-2 focus:ring-orange-400"
              />
              {errors.fullName && (
                <p className="text-red-300 text-sm">{errors.fullName}</p>
              )}
            </div>

            {formData.role === "Student" && (
              <>
                <div>
                  <label className="block mb-1">Roll No (e.g., 24MCA01)</label>
                  <input
                    type="text"
                    name="rollNo"
                    value={formData.rollNo}
                    onChange={handleChange}
                    className="w-full border border-white/30 bg-white/20 text-white px-4 py-2 rounded-md focus:ring-2 focus:ring-orange-400"
                  />
                  {errors.rollNo && (
                    <p className="text-red-300 text-sm">{errors.rollNo}</p>
                  )}
                </div>

                <div>
                  <label className="block mb-1">Batch</label>
                  <input
                    type="text"
                    name="batch"
                    value={formData.batch}
                    onChange={handleChange}
                    className="w-full border border-white/30 bg-white/20 text-white px-4 py-2 rounded-md focus:ring-2 focus:ring-orange-400"
                  />
                  {errors.batch && (
                    <p className="text-red-300 text-sm">{errors.batch}</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full border border-white/30 bg-white/20 text-white px-4 py-2 rounded-md focus:ring-2 focus:ring-orange-400"
              >
                <option value="Student">Student</option>
                <option value="HOD">HOD</option>
              </select>
            </div>

            {(formData.role === "Student" || formData.role === "HOD") && (
              <div>
                <label className="block mb-1">Registration ID</label>
                <input
                  type="text"
                  name="regId"
                  value={formData.regId}
                  onChange={handleChange}
                  className="w-full border border-white/30 bg-white/20 text-white px-4 py-2 rounded-md focus:ring-2 focus:ring-orange-400"
                />
                {errors.regId && (
                  <p className="text-red-300 text-sm">{errors.regId}</p>
                )}
              </div>
            )}

            <div>
              <label className="block mb-1">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-white/30 bg-white/20 text-white px-4 py-2 rounded-md focus:ring-2 focus:ring-orange-400"
              />
              {errors.password && (
                <p className="text-red-300 text-sm">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-white/30 bg-white/20 text-white px-4 py-2 rounded-md focus:ring-2 focus:ring-orange-400"
              />
              {errors.confirmPassword && (
                <p className="text-red-300 text-sm">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-3 rounded-md text-lg font-semibold hover:bg-orange-600 transition transform hover:scale-105"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
