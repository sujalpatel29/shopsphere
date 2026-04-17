import { Outlet } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ScrollToTop from "../common/ScrollToTop";

function AppLayout() {
  const { darkMode } = useTheme();

  return (
    <div
      className={`flex min-h-screen flex-col font-sans ${darkMode ? "bg-[#132420] text-[#F6F3EE]" : "bg-[#F6F3EE] text-[#111111]"}`}
    >
      <ScrollToTop />
      <Navbar />

      <main className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-8 md:px-8 lg:px-12">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;
