import "./homepg.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    
    <div className="home-container">

      {/* Video Background */}
    <video 
      autoPlay 
      muted 
      loop 
      className="video-background"
    >
      <source src="/ocean3.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>

      {/* Header Section */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="header"
      >
        <h1 className="main-title">✮⋆˙BUBBLE˙⋆✮</h1>
        <p className="subtitle">Your safe space to connect, heal, and grow</p>
        <p className="decorative-text">𖦹 ׂ 𓈒 🐇 ／ ⋆ ۪</p>
      </motion.header>

      {/* Centered Content Wrapper */}
      <div className="content-wrapper">
        {/* About Section */}
        <motion.section
          className="info-box"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h2>About</h2>
          <p>
            Need someone to talk to? No worries! There are people who overcame or
            are going through your situation right now. So talk it out! It's never
            over!
          </p>
        </motion.section>

        {/* Features Section */}
        <motion.section
          className="info-box"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <h2>Features</h2>
          <ul>
            <li>♡ Find Supportive Matches</li>
            <li>♡ Track Your Mood</li>
            <li>♡ Real-Time Chat</li>
            <li>♡ View Your Progress</li>
          </ul>
        </motion.section>
      </div>

      {/* Call-to-Action Button */}
      <motion.button
        className="cta-button"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
        onClick={handleLogin}
      >
        Get Started
      </motion.button>
    </div>
  );
}

export default Home;