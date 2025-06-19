import AppRoutes from "@routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ThemeProvider } from "./context/ThemeContext";
import AuthProvider from "./context/AuthProvider";
import ChangePasswordModal from "@components/constants/pages/ChangePasswordModal";

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <>
          <AppRoutes />
          <ChangePasswordModal />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnHover
            draggable
            theme="colored"
          />
        </>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;
