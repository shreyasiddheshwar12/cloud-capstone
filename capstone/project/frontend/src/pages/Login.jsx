import React from "react";

const Login = () => {
  return (
    <div>
      <h1>Login Page</h1>
      <p>Please sign in to continue.</p>

      <form>
        <div>
          <label>Email:</label>
          <input type="email" placeholder="Enter your email" />
        </div>

        <div>
          <label>Password:</label>
          <input type="password" placeholder="Enter your password" />
        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
