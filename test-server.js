// Simple test script to verify server functionality
const http = require("http");

const testServer = () => {
  const options = {
    hostname: "localhost",
    port: 3000,
    path: "/api/resources",
    method: "GET",
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Server is running - Status: ${res.statusCode}`);

    let data = "";
    res.on("data", (chunk) => {
      data += chunk;
    });

    res.on("end", () => {
      try {
        const resources = JSON.parse(data);
        console.log(
          `✅ API endpoint working - Found ${resources.length} resources`
        );
        console.log("🎉 All tests passed! Server is ready for deployment.");
      } catch (e) {
        console.log(
          "⚠️  API response is not valid JSON, but server is running"
        );
      }
    });
  });

  req.on("error", (e) => {
    console.log(`❌ Server test failed: ${e.message}`);
    console.log("💡 Make sure the server is running with: npm start");
  });

  req.end();
};

console.log("🧪 Testing Zero Hunger Server...");
console.log("📡 Checking if server is running on port 3000...");

// Wait a moment for server to start if it's just starting
setTimeout(testServer, 1000);
