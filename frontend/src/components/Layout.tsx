import React from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { LogOut, Menu, X, User } from "lucide-react";
import axios from "axios";
import loginImg from "../assets/logo.svg";

export const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const { user, logout, updateUser, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/"); // Redirect to landing page
    setIsMenuOpen(false);
  };

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    updateUser({
      ...user!,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
    });

    setIsProfileOpen(false);
  };

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone."
      )
    ) {
      try {
        const response = await axios.delete(
          `http://localhost:8000/api/auth/${user?.id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        const data = response.data as { success: boolean };
        if (data.success) {
          logout();
          navigate("/"); // Redirect to landing page
          alert("Your account has been deleted successfully.");
        }
      } catch (err) {
        console.error("Error deleting account:", err);
        alert("Failed to delete account. Please try again.");
      }
    }
  };

  const isLandingPage = location.pathname === "/" && !isAuthenticated;
  const showNavLinks = isAuthenticated || location.pathname !== "/";

  return (
    <div className="flex flex-col min-h-screen w-full overflow-x-hidden">
      <nav className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                to="/"
                className="flex items-center space-x-2 flex-shrink-0"
              >
                <img
                  src={loginImg}
                  alt="FairTrade Logo"
                  className="w-10 h-10 object-contain"
                />
                <span className="text-xl font-bold text-white">FairTrade</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {isLandingPage ? (
                  <>
                    <button
                      onClick={() => navigate("/login")}
                      className="px-3 py-2 rounded-md hover:bg-blue-700"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => navigate("/register")}
                      className="px-3 py-2 rounded-md hover:bg-blue-700"
                    >
                      Register
                    </button>
                  </>
                ) : showNavLinks ? (
                  <>
                    {user?.role === "admin" && (
                      <Link
                        to="/"
                        className="px-3 py-2 rounded-md hover:bg-blue-700"
                      >
                        Home
                      </Link>
                    )}
                    {user?.role === "user" && (
                      <Link
                        to="/"
                        className="px-3 py-2 rounded-md hover:bg-blue-700"
                      >
                        Home
                      </Link>
                    )}
                    {user?.role === "admin" && (
                      <Link
                        to="/waste-products"
                        className="px-3 py-2 rounded-md hover:bg-blue-700"
                      >
                        Support
                      </Link>
                    )}
                    {user?.role === "user" && (
                      <Link
                        to="/marketplace"
                        className="px-3 py-2 rounded-md hover:bg-blue-700"
                      >
                        Products
                      </Link>
                    )}
                    {user?.role === "admin" && (
                      <Link
                        to="/admin/orders"
                        className="px-3 py-2 rounded-md hover:bg-blue-700"
                      >
                        Orders
                      </Link>
                    )}
                    {user?.role === "user" && (
                      <Link
                        to="/orders"
                        className="px-3 py-2 rounded-md hover:bg-blue-700"
                      >
                        Orders
                      </Link>
                    )}
                    {user?.role === "admin" && (
                      <Link
                        to="/admin"
                        className="px-3 py-2 rounded-md hover:bg-blue-700"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    {user?.role === "user" && (
                      <Link
                        to="/Waste"
                        className="px-3 py-2 rounded-md hover:bg-blue-700"
                      >
                        Support
                      </Link>
                    )}
                    {user?.role === "delivery" && (
                      <>
                        <Link to="/deliveries" className="px-3 py-2 rounded-md hover:bg-blue-700">
                          Deliveries
                        </Link>
                        <Link to="/inventory" className="px-3 py-2 rounded-md hover:bg-blue-700">
                          Inventory
                        </Link>
                        <Link
                          to="/suppliers"
                          className="px-3 py-2 rounded-md hover:bg-blue-700"
                        >
                          Suppliers
                        </Link>
                        <Link to="/reports" className="px-3 py-2 rounded-md hover:bg-blue-700">
                          Reports
                        </Link>
                      </>
                    )}

                    {isAuthenticated && (
                      <>
                        <button
                          onClick={() => setIsProfileOpen(true)}
                          className="flex items-center px-3 py-2 rounded-md hover:bg-blue-700"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex items-center px-3 py-2 rounded-md hover:bg-blue-700"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </>
                    )}
                  </>
                ) : null}
              </div>
            </div>
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md hover:bg-blue-700"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {isLandingPage ? (
                <>
                  <button
                    onClick={() => {
                      navigate("/login");
                      setIsMenuOpen(false);
                    }}
                    className="block px-3 py-2 rounded-md hover:bg-blue-700"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      navigate("/register");
                      setIsMenuOpen(false);
                    }}
                    className="block px-3 py-2 rounded-md hover:bg-blue-700"
                  >
                    Register
                  </button>
                </>
              ) : showNavLinks ? (
                <>
                  {user?.role === "user" && (
                    <Link
                      to="/"
                      className="block px-3 py-2 rounded-md hover:bg-blue-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Home
                    </Link>
                  )}
                  {user?.role === "admin" && (
                    <Link
                      to="/"
                      className="block px-3 py-2 rounded-md hover:bg-blue-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Home
                    </Link>
                  )}
                  {user?.role === "user" && (
                    <Link
                      to="/marketplace"
                      className="block px-3 py-2 rounded-md hover:bg-blue-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Products
                    </Link>
                  )}
                  {user?.role === "admin" && (
                    <Link
                      to="/admin/orders"
                      className="block px-3 py-2 rounded-md hover:bg-blue-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Orders
                    </Link>
                  )}
                  {user?.role === "user" && (
                    <Link
                      to="/orders"
                      className="block px-3 py-2 rounded-md hover:bg-blue-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Orders
                    </Link>
                  )}
                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      className="block px-3 py-2 rounded-md hover:bg-blue-700"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  {user?.role === "delivery" && (
                    <>
                      <Link
                        to="/deliveries"
                        className="block px-3 py-2 rounded-md hover:bg-blue-700"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Deliveries
                      </Link>
                      <Link
                        to="/inventory"
                        className="block px-3 py-2 rounded-md hover:bg-blue-700"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Inventory
                      </Link>
                      <Link
                        to="/suppliers"
                        className="block px-3 py-2 rounded-md hover:bg-blue-700"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Suppliers
                      </Link>
                      <Link
                        to="/reports"
                        className="block px-3 py-2 rounded-md hover:bg-blue-700"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Reports
                      </Link>
                    </>
                  )}
                  {isAuthenticated && (
                    <>
                      <button
                        onClick={() => {
                          setIsProfileOpen(true);
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2 rounded-md hover:bg-blue-700"
                      >
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2 rounded-md hover:bg-blue-700"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </button>
                    </>
                  )}
                </>
              ) : null}
            </div>
          </div>
        )}
      </nav>

      <main
        className={
          isLandingPage
            ? "flex-grow w-full"
            : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow"
        }
      >
        <Outlet />
      </main>

      {isProfileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Profile Settings</h2>
              <button onClick={() => setIsProfileOpen(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  defaultValue={user?.name}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={user?.email}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <input
                  type="text"
                  value={
                    user?.role === "admin"
                      ? "Admin"
                      : user?.role === "delivery"
                        ? "Logistics Manager"
                        : "User"
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                  disabled
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>

            <div className="mt-6 border-t border-gray-200 pt-4">
              <button
                onClick={handleDeleteAccount}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-blue-700 text-white mt-auto">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Brand Info */}
      <div>
        <h2 className="text-xl font-bold">FairTrade</h2>
        <p className="mt-2 text-sm">
          Empowering sustainable supply chains. Ensuring transparency, quality,
          and fairness in every trade.
        </p>
      </div>

      {/* Navigation Links */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a href="/suppliers" className="hover:underline">
              Suppliers
            </a>
          </li>
          <li>
            <a href="/inventory" className="hover:underline">
              Inventory
            </a>
          </li>
          <li>
            <a href="/reports" className="hover:underline">
              Reports
            </a>
          </li>
          <li>
            <a href="/contact" className="hover:underline">
              Contact Us
            </a>
          </li>
        </ul>
      </div>

      {/* Contact & Socials */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Get in Touch</h3>
        <p className="text-sm mb-2">Email: support@fairtrade.com</p>
        <p className="text-sm mb-4">Phone: +1 (800) 123-4567</p>

        <div className="flex space-x-4">
          <a href="#" aria-label="Facebook" className="hover:text-gray-300">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M22 12a10 10 0 1 0-11.63 9.87v-7h-2v-2.87h2v-2.17c0-2 1.2-3.1 3.04-3.1.88 0 1.8.16 1.8.16v2h-1.01c-.99 0-1.3.62-1.3 1.26v1.85h2.22l-.35 2.87h-1.87v7A10 10 0 0 0 22 12z" />
            </svg>
          </a>
          <a href="#" aria-label="Twitter" className="hover:text-gray-300">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.26 4.26 0 0 0 1.88-2.35c-.82.49-1.73.85-2.7 1.04a4.24 4.24 0 0 0-7.23 3.86A12 12 0 0 1 3.15 4.57a4.24 4.24 0 0 0 1.31 5.66 4.22 4.22 0 0 1-1.92-.53v.05c0 2 1.4 3.67 3.25 4.05a4.3 4.3 0 0 1-1.91.07c.53 1.67 2.07 2.88 3.89 2.91A8.5 8.5 0 0 1 2 19.55a12 12 0 0 0 6.29 1.84c7.55 0 11.68-6.26 11.68-11.68v-.53c.8-.58 1.5-1.3 2.06-2.13z" />
            </svg>
          </a>
          <a href="#" aria-label="LinkedIn" className="hover:text-gray-300">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14a5 5 0 0 0-5 5v14a5 5 0 0 0 5 5h14a5 5 0 0 0 5-5v-14a5 5 0 0 0-5-5zm-11 20h-3v-11h3v11zm-1.5-12.25a1.75 1.75 0 1 1 0-3.5 1.75 1.75 0 0 1 0 3.5zm13.5 12.25h-3v-5.5c0-1.38-1.12-2.5-2.5-2.5s-2.5 1.12-2.5 2.5v5.5h-3v-11h3v1.5a3.74 3.74 0 0 1 3-1.5c2.49 0 4.5 2.01 4.5 4.5v6.5z" />
            </svg>
          </a>
        </div>
      </div>
    </div>

    {/* Bottom Bar */}
    <div className="mt-8 border-t border-blue-500 pt-4 text-sm text-center">
      © {new Date().getFullYear()} FairTrade. All rights reserved.
    </div>
  </div>
</footer>
    </div>
  );
};
