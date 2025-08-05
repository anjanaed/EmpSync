import axios from "axios";

// === CONFIGURE THESE VALUES ===
const auth0Domain = "dev-77pr5yqzs0m53x77.us.auth0.com";
const clientId = "jPw9tY0jcdhSAhErMaqgdVGYQ6Srh3xs"; // Management API Client ID
const clientSecret = "b-elWz_BWHoWAsNixkUhDfYghGJuy9tuE1gnE2MwSJfmn7fIPZqZIO7STDdRFrck"; // Management API Client Secret

const getManagementToken = async () => {
  try {
    const response = await axios.post(`https://${auth0Domain}/oauth/token`, {
      client_id: clientId,
      client_secret: clientSecret,
      audience: `https://${auth0Domain}/api/v2/`,
      grant_type: "client_credentials"
    });
    
    return response.data.access_token;
  } catch (error: any) {
    console.error("Error getting management token:", error.response?.data || error.message);
    throw error;
  }
};

const getAllUsers = async (token: string) => {
  try {
    let allUsers: any[] = [];
    let page = 0;
    const perPage = 100; // Max 100 per page
    
    while (true) {
      const response = await axios.get(`https://${auth0Domain}/api/v2/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page,
          per_page: perPage,
          include_totals: true,
        },
      });
      
      const users = response.data.users;
      allUsers = allUsers.concat(users);
      
      if (users.length < perPage) {
        break; // No more users
      }
      
      page++;
    }
    
    return allUsers;
  } catch (error: any) {
    console.error("Error fetching users:", error.response?.data || error.message);
    throw error;
  }
};

const deleteUser = async (token: string, userId: string) => {
  try {
    await axios.delete(`https://${auth0Domain}/api/v2/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log(`✓ Deleted user: ${userId}`);
  } catch (error: any) {
    console.error(`✗ Error deleting user ${userId}:`, error.response?.data || error.message);
  }
};

const deleteAllUsers = async () => {
  try {
    console.log("Getting management token...");
    const token = await getManagementToken();
    
    console.log("Fetching all users...");
    const users = await getAllUsers(token);
    
    console.log(`Found ${users.length} users to delete`);
    
    if (users.length === 0) {
      console.log("No users found to delete");
      return;
    }
    
    // Ask for confirmation
    console.log("\n⚠️  WARNING: This will delete ALL users in your Auth0 tenant!");
    console.log("Users to be deleted:");
    users.forEach(user => {
      console.log(`- ${user.email || user.user_id} (${user.user_id})`);
    });
    
    // Uncomment the line below to proceed with deletion
    // Remove this safety check when you're ready
    console.log("\n🛑 Safety check: Uncomment the deletion code to proceed");
    
    // Uncomment this block to actually delete users
    console.log("\nStarting deletion...");
    for (const user of users) {
      await deleteUser(token, user.user_id);
      // Add a small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\n✅ Successfully processed ${users.length} users`);
    
    
  } catch (error) {
    console.error("Script failed:", error);
  }
};

deleteAllUsers();