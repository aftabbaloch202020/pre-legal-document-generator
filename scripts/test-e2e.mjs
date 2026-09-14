// Automated E2E verification test for Pre-Legal Document Generator SaaS
import assert from "assert";

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== STARTING COMPLETE E2E TEST SUITE ===");

  // 1. Test Public Pages
  console.log("\n[TEST 1] Verifying Public Routes...");
  const pages = ["/", "/templates", "/how-it-works", "/about", "/faq", "/login", "/register"];
  for (const page of pages) {
    const res = await fetch(`${BASE_URL}${page}`);
    assert.strictEqual(res.status, 200, `Page ${page} should return 200`);
    console.log(`  ✓ ${page} returned 200 OK`);
  }

  // 2. Test Templates API
  console.log("\n[TEST 2] Verifying Templates API...");
  const tplRes = await fetch(`${BASE_URL}/api/templates`);
  const tplData = await tplRes.json();
  assert.strictEqual(tplData.success, true);
  assert(tplData.templates.length >= 8, "Must have at least 8 seeded templates");
  console.log(`  ✓ Fetched ${tplData.templates.length} templates successfully`);
  console.log(`  ✓ Categories returned: ${tplData.categories.map((c) => c.name).join(", ")}`);

  // 3. Test Registration
  console.log("\n[TEST 3] Testing User Registration...");
  const testEmail = `testuser_${Date.now()}@example.com`;
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "E2E Test User",
      email: testEmail,
      password: "TestPassword123",
      confirmPassword: "TestPassword123",
    }),
  });
  const regData = await regRes.json();
  assert.strictEqual(regData.success, true);
  const userCookie = regRes.headers.get("set-cookie");
  assert(userCookie, "Registration must return auth session cookie");
  console.log(`  ✓ Registered new user: ${testEmail}`);

  // 4. Test Login
  console.log("\n[TEST 4] Testing User Login...");
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "user@prelegal.com",
      password: "User@123456",
    }),
  });
  const loginData = await loginRes.json();
  assert.strictEqual(loginData.success, true);
  assert.strictEqual(loginData.user.email, "user@prelegal.com");
  const authCookie = loginRes.headers.get("set-cookie");
  console.log(`  ✓ Login successful for demo user: ${loginData.user.email}`);

  // 5. Test Auth Identity (/api/auth/me)
  console.log("\n[TEST 5] Testing /api/auth/me with session cookie...");
  const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: authCookie },
  });
  const meData = await meRes.json();
  assert.strictEqual(meData.success, true);
  assert.strictEqual(meData.user.email, "user@prelegal.com");
  console.log(`  ✓ Identity verified for: ${meData.user.name} (${meData.user.role})`);

  // 6. Test Document Generation via Dynamic Form
  console.log("\n[TEST 6] Generating Pre-Legal Document from Template...");
  const targetTpl = tplData.templates.find((t) => t.slug === "nda-agreement");
  assert(targetTpl, "NDA agreement template must exist");

  const formData = {
    disclosingParty: "Acme Tech Innovations Inc.",
    receivingParty: "Global Consulting Partners LLC",
    purpose: "Evaluation of strategic software integration",
    confidentialityTerm: "3 Years",
    governingLaw: "State of California",
    returnPeriodDays: 14,
  };

  const createDocRes = await fetch(`${BASE_URL}/api/documents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie,
    },
    body: JSON.stringify({
      templateId: targetTpl.id,
      title: "NDA - Acme Tech & Global Consulting",
      formData,
    }),
  });

  const createDocData = await createDocRes.json();
  assert.strictEqual(createDocData.success, true);
  assert(createDocData.document.id, "Document must have generated ID");
  assert(
    createDocData.document.generatedContent.includes("Acme Tech Innovations Inc."),
    "Generated content must interpolate disclosingParty"
  );
  assert(
    createDocData.document.generatedContent.includes("3 Years"),
    "Generated content must interpolate confidentialityTerm"
  );
  console.log(`  ✓ Document generated successfully with ID: ${createDocData.document.id}`);
  const docId = createDocData.document.id;

  // 7. Test Fetching Document By ID
  console.log("\n[TEST 7] Fetching Document by ID (Preview)...");
  const getDocRes = await fetch(`${BASE_URL}/api/documents/${docId}`, {
    headers: { Cookie: authCookie },
  });
  const getDocData = await getDocRes.json();
  assert.strictEqual(getDocData.success, true);
  assert.strictEqual(getDocData.document.title, "NDA - Acme Tech & Global Consulting");
  console.log(`  ✓ Document retrieved with full details`);

  // 8. Test Document Update / Re-generate
  console.log("\n[TEST 8] Updating / Re-generating Document...");
  const updateRes = await fetch(`${BASE_URL}/api/documents/${docId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Cookie: authCookie,
    },
    body: JSON.stringify({
      title: "NDA - Acme Tech & Global Consulting (Amended)",
      formData: {
        ...formData,
        confidentialityTerm: "5 Years",
      },
    }),
  });
  const updateData = await updateRes.json();
  assert.strictEqual(updateData.success, true);
  assert(
    updateData.document.generatedContent.includes("5 Years"),
    "Re-generated content must reflect updated term"
  );
  console.log(`  ✓ Document successfully re-generated with updated term: 5 Years`);

  // 9. Test "My Documents" Listing & Search
  console.log("\n[TEST 9] Testing My Documents listing and search...");
  const myDocsRes = await fetch(`${BASE_URL}/api/documents?search=Amended`, {
    headers: { Cookie: authCookie },
  });
  const myDocsData = await myDocsRes.json();
  assert.strictEqual(myDocsData.success, true);
  assert(myDocsData.documents.length >= 1, "Should find the amended document");
  console.log(`  ✓ Search returned ${myDocsData.documents.length} matching document(s)`);

  // 10. Test Document Deletion
  console.log("\n[TEST 10] Testing Document Deletion...");
  const delRes = await fetch(`${BASE_URL}/api/documents/${docId}`, {
    method: "DELETE",
    headers: { Cookie: authCookie },
  });
  const delData = await delRes.json();
  assert.strictEqual(delData.success, true);
  console.log(`  ✓ Document deleted successfully`);

  // Verify it no longer exists
  const checkRes = await fetch(`${BASE_URL}/api/documents/${docId}`, {
    headers: { Cookie: authCookie },
  });
  assert.strictEqual(checkRes.status, 404);
  console.log(`  ✓ Verified document is gone (404)`);

  // 11. Test Admin Login & Admin Endpoints
  console.log("\n[TEST 11] Testing Admin Privileges...");
  const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "admin@prelegal.com",
      password: "Admin@123456",
    }),
  });
  const adminLoginData = await adminLoginRes.json();
  assert.strictEqual(adminLoginData.success, true);
  assert.strictEqual(adminLoginData.user.role, "ADMIN");
  const adminCookie = adminLoginRes.headers.get("set-cookie");
  console.log(`  ✓ Admin logged in: ${adminLoginData.user.email}`);

  // Test Admin Stats API
  const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { Cookie: adminCookie },
  });
  const statsData = await statsRes.json();
  assert.strictEqual(statsData.success, true);
  console.log(
    `  ✓ Admin stats retrieved: ${statsData.stats.totalUsers} users, ${statsData.stats.totalDocuments} docs, ${statsData.stats.totalTemplates} templates`
  );

  // 12. Test Role-Based Protection (User cannot access Admin Stats)
  console.log("\n[TEST 12] Testing Route Protection (Non-Admin Blocked)...");
  const forbiddenRes = await fetch(`${BASE_URL}/api/admin/stats`, {
    headers: { Cookie: authCookie },
  });
  assert.strictEqual(forbiddenRes.status, 403, "Regular user must get 403 Forbidden");
  console.log(`  ✓ Regular user correctly blocked from admin route (403 Forbidden)`);

  console.log("\n=============================================");
  console.log("🎉 ALL 12 END-TO-END TESTS PASSED SUCCESSFULLY!");
  console.log("=============================================\n");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
