import { useAuth0 } from "@auth0/auth0-react";
import styles from "./Loginbutton.module.css"; // Import the CSS module

function Login() {
  const { loginWithRedirect } = useAuth0();
  
  // Make sure your component is rendering something
  return (
    <div>
      <button className={styles.loginButton} onClick={() => loginWithRedirect()}>Log In</button>
    </div>
  );
}

export default Login;
