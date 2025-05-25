import { useNavigate } from "react-router-dom";
import Hero from "../components/Hero";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <Hero navigate={navigate} />
    </div>
  );
};

export default LandingPage;
