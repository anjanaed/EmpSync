import axios from "axios";

// === CONFIGURE THESE VALUES ===
const auth0Url = "dev-77pr5yqzs0m53x77.us.auth0.com"; // e.g. your-tenant.auth0.com
const auth0ClientId = "RsxaQQdCDS1kk422wUEJtql0FY9AGFuN";
const email = "chamilka2002@gmail.com";
const username = "superadminTest"; // Use this if you want to register with a username
const password = "chamilka2002.";
const id = "e20020705"; // If you want to use this as username

const signUpUser = async () => {
  try {
    const res = await axios.post(`https://${auth0Url}/dbconnections/signup`, {
      client_id: auth0ClientId,
      email,
      username: id, // or use username if you prefer
      password,
      connection: "SuperAdmin",
    });
    console.log("Registration Success:", res.data);
  } catch (error: any) {
    console.error("Auth0 Registration Error:", error.response?.data || error.message);
    throw error;
  }
};

signUpUser();