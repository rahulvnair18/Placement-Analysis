import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          alert(data.message);
        } else {
          alert(data.message); // "User registered successfully"
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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-4xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-md"
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm">{errors.fullName}</p>
              )}
            </div>

            {formData.role === "Student" && (
              <div>
                <label className="block mb-1">Roll No (e.g., 24MCA01)</label>
                <input
                  type="text"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleChange}
                  className="w-full border px-4 py-2 rounded-md"
                />
                {errors.rollNo && (
                  <p className="text-red-500 text-sm">{errors.rollNo}</p>
                )}
              </div>
            )}

            {formData.role === "Student" && (
              <div>
                <label className="block mb-1">Batch</label>
                <input
                  type="text"
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                  className="w-full border px-4 py-2 rounded-md"
                />
                {errors.batch && (
                  <p className="text-red-500 text-sm">{errors.batch}</p>
                )}
              </div>
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
                className="w-full border px-4 py-2 rounded-md"
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
                  className="w-full border px-4 py-2 rounded-md"
                />
                {errors.regId && (
                  <p className="text-red-500 text-sm">{errors.regId}</p>
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
                className="w-full border px-4 py-2 rounded-md"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block mb-1">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border px-4 py-2 rounded-md"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Register
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;
