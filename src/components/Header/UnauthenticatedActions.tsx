import { Link, useLocation } from "react-router-dom";

const UnauthenticatedActions = () => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";

  return (
    <div className="flex items-center ml-2 pl-4 border-l border-accent transition-colors duration-300">
      <Link
        to="/login"
        className={`font-medium transition-colors px-4 py-2 ${
          isLoginPage
            ? "text-primary bg-primary/10 rounded-md"
            : "text-text-main hover:text-primary"
        }`}
      >
        Sign in
      </Link>
      <Link
        to="/register"
        className={`px-4 py-2 rounded-md transition-all duration-300 ${
          isRegisterPage
            ? "text-primary bg-primary/10 rounded-md"
            : "text-text-main hover:text-primary"
        }`}
      >
        Register
      </Link>
    </div>
  );
};

export default UnauthenticatedActions;
