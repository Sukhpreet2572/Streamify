import { Navigate, Route, Routes } from "react-router";

import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import CallPage from "./pages/CallPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import OnboardingPage from "./pages/OnboardingPage.jsx";

import { Toaster } from "react-hot-toast";

import PageLoader from "./components/PageLoader.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import Layout from "./components/Layout.jsx";
import { useThemeStore } from "./store/useThemeStore.js";

const App = () => {
  try {
    const { isLoading, authUser } = useAuthUser();
    const { theme } = useThemeStore();

    const isAuthenticated = Boolean(authUser);
    const isOnboarded = authUser?.isOnboarded;

    console.log("App state:", {
      isLoading,
      authUser,
      isAuthenticated,
      isOnboarded,
    });

    // If still loading, show loading screen
    if (isLoading) {
      console.log("App is loading...");
      return <PageLoader />;
    }

    // Fallback: if no user data and not loading, treat as not authenticated
    const safeIsAuthenticated = Boolean(authUser);
    const safeIsOnboarded = authUser?.isOnboarded || false;

    console.log(
      "App rendering with authenticated:",
      safeIsAuthenticated,
      "onboarded:",
      safeIsOnboarded
    );

    console.log("Routing state:", {
      safeIsAuthenticated,
      safeIsOnboarded,
    });

    return (
      <div className="h-screen" data-theme={theme}>
        <Routes>
          <Route
            path="/"
            element={
              safeIsAuthenticated && safeIsOnboarded ? (
                <Layout showSidebar={true}>
                  <HomePage />
                </Layout>
              ) : (
                <Navigate
                  to={!safeIsAuthenticated ? "/login" : "/onboarding"}
                />
              )
            }
          />
          <Route
            path="/signup"
            element={
              !safeIsAuthenticated ? (
                <SignUpPage />
              ) : (
                <Navigate to={safeIsOnboarded ? "/" : "/onboarding"} />
              )
            }
          />
          <Route
            path="/login"
            element={
              !safeIsAuthenticated ? (
                <LoginPage />
              ) : (
                <Navigate to={safeIsOnboarded ? "/" : "/onboarding"} />
              )
            }
          />
          <Route
            path="/notifications"
            element={
              safeIsAuthenticated && safeIsOnboarded ? (
                <Layout showSidebar={true}>
                  <NotificationsPage />
                </Layout>
              ) : (
                <Navigate
                  to={!safeIsAuthenticated ? "/login" : "/onboarding"}
                />
              )
            }
          />
          <Route
            path="/call/:id"
            element={
              safeIsAuthenticated && safeIsOnboarded ? (
                <CallPage />
              ) : (
                <Navigate
                  to={!safeIsAuthenticated ? "/login" : "/onboarding"}
                />
              )
            }
          />

          <Route
            path="/chat/:id"
            element={
              safeIsAuthenticated && safeIsOnboarded ? (
                <Layout showSidebar={false}>
                  <ChatPage />
                </Layout>
              ) : (
                <Navigate
                  to={!safeIsAuthenticated ? "/login" : "/onboarding"}
                />
              )
            }
          />

          <Route
            path="/onboarding"
            element={
              safeIsAuthenticated ? (
                !safeIsOnboarded ? (
                  <OnboardingPage />
                ) : (
                  <Navigate to="/" />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        </Routes>

        <Toaster />
      </div>
    );
  } catch (error) {
    console.error("App error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-4">Please refresh the page</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
};
export default App;
