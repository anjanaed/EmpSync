import axios from "axios";

// === CONFIGURE THESE VALUES ===
const auth0Url = "dev-77pr5yqzs0m53x77.us.auth0.com"; // e.g. your-tenant.auth0.com
const auth0ClientId = "RsxaQQdCDS1kk422wUEJtql0FY9AGFuN";
const email = "anji@gmail.com";
const password = "Anjana12345.";

const signUpUser = async () => {
  try {
    const res = await axios.post(`https://${auth0Url}/dbconnections/signup`, {
      client_id: auth0ClientId,
      email,
      password,
      connection: "New",
    });
    console.log("Registration Success:", res.data);
  } catch (error: any) {
    console.error("Auth0 Registration Error:", error.response?.data || error.message);
    throw error;
  }
};

signUpUser();