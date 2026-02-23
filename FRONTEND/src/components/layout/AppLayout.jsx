import { Outlet } from "react-router-dom";
import { ScrollPanel } from "primereact/scrollpanel";
import { useTheme } from "../../context/ThemeContext";
import Navbar from "./Navbar";
import Footer from "./Footer";

function AppLayout() {
  const { darkMode } = useTheme();

  return (
    <div
      className={`flex h-screen flex-col overflow-hidden font-sans ${darkMode ? "bg-[#0b1114] text-slate-200" : "bg-gray-50 text-gray-900"}`}
    >
      <Navbar />

      <ScrollPanel
        className="app-scrollpanel flex-1"
        style={{ width: "100%", height: "100%" }}
      >
        <main className="mx-auto w-full max-w-[1600px] px-4 py-8 md:px-8 lg:px-12">
          <Outlet />
        </main>
        <Footer />
      </ScrollPanel>
    </div>
  );
}

export default AppLayout;
