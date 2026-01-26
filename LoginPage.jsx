import React, { useState } from "react";
import styled from "styled-components";

// Styled Components
const Background = styled.div`
  min-height: 100vh;
  background: #e3f0ff;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  background: #fff;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0px 6px 20px rgba(40, 40, 40, 0.15);
  width: 350px;
  text-align: center;
  border: 2px solid #eee;
`;

const Logo = styled.img`
  width: 100px;
  margin-bottom: 18px;
  margin-top: -10px;
  display: block;
  margin-left: auto;
  margin-right: auto;
`;

const Heading = styled.h2`
  margin-bottom: 20px;
  color: #23272b;
  letter-spacing: 2px;
  text-transform: uppercase;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  text-align: left;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  margin-bottom: 6px;
  color: #23272b;
  font-weight: bold;
  letter-spacing: 1px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 8px;
  outline: none;
  background: #fff;
  color: #23272b;
  transition: border 0.3s, background 0.3s;
  &:focus {
    border-color: #007bff;
    background: #f4f6f8;
  }
`;

const ExtraLinks = styled.div`
  margin-top: 15px;
  font-size: 14px;
`;

const StyledLink = styled.a`
  text-decoration: none;
  color: #007bff;
  margin: 0 5px;
  font-weight: bold;
  transition: color 0.2s;
  &:hover {
    color: #23272b;
  }
`;

const ButtonGroup = styled.div`
  margin-top: 28px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const LoginButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #007bff;
  border: none;
  border-radius: 8px;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(40,40,40,0.3);
  transition: background 0.3s;
  &:hover {
    background: #0056b3;
  }
`;

// Main Component
const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Example: Replace with your actual navigation/auth logic
  const handleLogin = (role) => {
    // Validate form here if needed
    if (!form.email || !form.password) {
      alert("Please enter both email and password.");
      return;
    }
    // Simulate navigation
    switch (role) {
      case "admin":
        window.location.href = "/catalogforadmin";
        break;
      case "staff":
        window.location.href = "/catalogfirstaff";
        break;
      case "storekeeper":
        window.location.href = "/catalogforstorekeeper";
        break;
      case "customer":
        window.location.href = "/catalogforcustomer";
        break;
      default:
        break;
    }
  };

  return (
    <Background>
      <Card>
        <Logo
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLVxsoQpkXmnZcWE2zJ6JuY4aUf_dXw88DAA&s"
          alt="Marukawa Logo"
        />
        <Heading>Login</Heading>
        <form onSubmit={(e) => e.preventDefault()}>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </FormGroup>
          <ExtraLinks>
            <StyledLink href="/forgotpassword">Forgot Password?</StyledLink>
            {" | "}
            <StyledLink href="/register">Register</StyledLink>
          </ExtraLinks>
          <ButtonGroup>
            <LoginButton type="button" onClick={() => handleLogin("admin")}>Login as Admin</LoginButton>
            <LoginButton type="button" onClick={() => handleLogin("staff")}>Login as Staff</LoginButton>
            <LoginButton type="button" onClick={() => handleLogin("storekeeper")}>Login as Storekeeper</LoginButton>
            <LoginButton type="button" onClick={() => handleLogin("customer")}>Login as Customer</LoginButton>
          </ButtonGroup>
        </form>
      </Card>
    </Background>
  );
};

export default LoginPage;
