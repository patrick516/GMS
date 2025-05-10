const logout = () => {
  // Clear session
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Redirect to login page
  window.location.href = "/login";
};

export default logout;
