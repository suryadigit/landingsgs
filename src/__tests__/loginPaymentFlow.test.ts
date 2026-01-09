// 🧪 Test Simulasi Login Flow
// Gunakan ini untuk test tanpa backend

export const testLoginPaymentFlow = () => {
  console.log("\n🧪 Starting Login Payment Flow Test...\n");

  // Simulasi response dari backend saat user belum bayar
  const mockError401PaymentResponse = {
    response: {
      status: 401,
      data: {
        error: "Akun Anda belum aktif",
        message: "Selesaikan pembayaran aktivasi 75.000 IDR untuk login",
        affiliate: {
          status: "PENDING",
          code: "REF12345"
        },
        payment: {
          id: "payment-id-xxx",
          status: "PENDING",
          amount: 75000,
          invoiceUrl: "https://app.xendit.co/inv/6123456789abc",
          expiredAt: new Date(Date.now() + 15 * 60000).toISOString(),
          remainingMinutes: 14
        }
      }
    }
  };

  console.log("📌 Mock Error Response (401 with Payment):");
  console.log(mockError401PaymentResponse);

  // Test Detection Logic
  const errorStatus = mockError401PaymentResponse.response.status;
  const errorData = mockError401PaymentResponse.response.data;

  console.log("\n🔍 Testing Detection Logic:");
  console.log(`Status: ${errorStatus}`);
  console.log(`Has payment object: ${!!errorData?.payment}`);

  // Check condition
  if (errorStatus === 401 && errorData?.payment) {
    console.log("\n✅ CONDITION MET: This is a payment pending scenario!");
    console.log("Payment details detected:");
    console.log(errorData.payment);

    // Simulate storage save
    const payment = {
      id: errorData.payment.id,
      amount: errorData.payment.amount,
      invoiceUrl: errorData.payment.invoiceUrl,
      status: errorData.payment.status,
      expiredAt: errorData.payment.expiredAt,
      remainingMinutes: errorData.payment.remainingMinutes,
    };

    console.log("\n💾 Would save to storage:");
    console.log(JSON.stringify(payment, null, 2));

    // Simulate what would happen next
    console.log("\n➡️ Next actions:");
    console.log("1. Set error message: 'Akun Anda belum aktif. Mengalihkan ke halaman pembayaran...'");
    console.log("2. Wait 1.5 seconds");
    console.log("3. Navigate to /payment with state");
    console.log("4. Success! ✅");
  } else {
    console.log("\n❌ CONDITION NOT MET: Different error scenario");
  }

  // Additional test: Check localStorage behavior
  console.log("\n\n🧪 Testing Storage Behavior:");
  const testPayment = {
    id: "test-payment-123",
    amount: 75000,
    invoiceUrl: "https://test.xendit.co",
    status: "PENDING",
    expiredAt: new Date(Date.now() + 15 * 60000).toISOString(),
    remainingMinutes: 15
  };

  // Simulate storage save
  console.log("Saving to localStorage:", testPayment);
  console.log("Saving to sessionStorage:", testPayment);

  // Simulate storage load
  const loadedData = testPayment; // Simulate JSON.parse(localStorage.getItem(...))
  console.log("\n✅ Loaded from storage:", loadedData);
  console.log("Amount formatted: Rp " + loadedData.amount.toLocaleString('id-ID'));
};

// Test different error scenarios
export const testErrorScenarios = () => {
  console.log("\n🧪 Testing Different Error Scenarios:\n");

  // Scenario 1: Invalid credentials (401 without payment)
  console.log("--- Scenario 1: Invalid Credentials ---");
  const scenario1 = {
    response: {
      status: 401,
      data: {
        error: "Email atau password salah"
      }
    }
  };
  console.log("Response:", scenario1);
  console.log("Has payment? ", !!scenario1.response.data.payment);
  console.log("Action: Show error message ❌\n");

  // Scenario 2: User already paid (200)
  console.log("--- Scenario 2: User Already Paid ---");
  const scenario2 = {
    response: {
      status: 200,
      data: {
        message: "Login successful",
        token: "eyJhbGc...",
        user: {
          id: "user-123",
          email: "user@example.com"
        }
      }
    }
  };
  console.log("Response Status: 200");
  console.log("Has token? ", !!scenario2.response.data.token);
  console.log("Action: Store token and redirect to /dashboard ✅\n");

  // Scenario 3: Payment pending (401 with payment)
  console.log("--- Scenario 3: Payment Pending ---");
  const scenario3 = {
    response: {
      status: 401,
      data: {
        error: "Akun Anda belum aktif",
        payment: {
          id: "payment-xxx",
          amount: 75000,
          invoiceUrl: "https://app.xendit.co/..."
        }
      }
    }
  };
  console.log("Response:", scenario3);
  console.log("Has payment? ", !!scenario3.response.data.payment);
  console.log("Action: Save to storage and redirect to /payment ✅\n");
};

// Export for testing
export const testData = {
  validPaymentError: {
    response: {
      status: 401,
      data: {
        error: "Akun Anda belum aktif",
        payment: {
          id: "payment-test-123",
          status: "PENDING",
          amount: 75000,
          invoiceUrl: "https://app.xendit.co/inv/test123",
          expiredAt: new Date(Date.now() + 15 * 60000).toISOString(),
          remainingMinutes: 14
        }
      }
    }
  },
  invalidCredentials: {
    response: {
      status: 401,
      data: {
        error: "Email atau password salah"
      }
    }
  },
  successResponse: {
    status: 200,
    data: {
      message: "Login successful",
      token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      user: {
        id: "user-123",
        email: "test@example.com",
        fullName: "Test User"
      }
    }
  }
};

// Run tests
console.log("=".repeat(60));
console.log("🧪 LOGIN PAYMENT FLOW - TEST SUITE");
console.log("=".repeat(60));

testLoginPaymentFlow();
testErrorScenarios();

console.log("\n" + "=".repeat(60));
console.log("✅ All tests completed!");
console.log("=".repeat(60));
