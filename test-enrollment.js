// Test enrollment submission directly
const testEnrollment = async () => {
  const testData = {
    locationId: "00000000-0000-0000-0000-000000000000", // Will need real location ID
    guardianFirstName: "Test",
    guardianLastName: "Parent",
    guardianEmail: "test@example.com",
    guardianPhone: "555-555-5555",
    childFirstName: "Gracie",
    childLastName: "Test",
    childDateOfBirth: "2022-07-11",
    emergencyContactName: "Emergency Contact",
    emergencyContactPhone: "555-555-5555",
    planType: "monthly",
    digitalSignature: "Test Parent",
    photoMediaConsent: false,
    agreedToTerms: true
  };

  try {
    const response = await fetch('http://localhost:3000/api/enrollment/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testData),
    });

    const data = await response.json();
    console.log('Response:', response.status, data);
  } catch (error) {
    console.error('Error:', error);
  }
};

testEnrollment();
