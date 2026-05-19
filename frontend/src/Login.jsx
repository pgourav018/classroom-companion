function Login({ onLogin }) {

  const handleLogin = () => {

    localStorage.setItem(
      "teacher",
      "loggedin"
    );

    onLogin("loggedin");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background:
          "linear-gradient(to bottom, #020617, #0f172a)",
        color: "white",
        fontFamily: "Arial",
      }}
    >

      <div
        style={{
          background: "#111827",
          padding: "40px",
          borderRadius: "20px",
          width: "350px",
          textAlign: "center",
        }}
      >

        <h1
          style={{
            marginBottom: "20px",
          }}
        >
          Teacher Login
        </h1>

        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            padding: "14px",
            border: "none",
            borderRadius: "12px",
            background: "#2563eb",
            color: "white",
            fontSize: "16px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Login
        </button>

      </div>

    </div>
  );
}

export default Login;