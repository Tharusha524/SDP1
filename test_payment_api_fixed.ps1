# Test payment API with test customer credentials
$loginPayload = @{
  email = "testcustomer@marukawa.com"
  password = "customer123"
} | ConvertTo-Json

Write-Host "Logging in with testcustomer@marukawa.com..."
try {
  $loginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginPayload -UseBasicParsing
  $loginData = $loginResponse.Content | ConvertFrom-Json
  
  if ($loginData.token) {
    $token = $loginData.token
    Write-Host "✓ Login successful`n"
    
    $paymentPayload = @{
      productId = "PROD001"
      quantity = 2
      details = "Test payment"
    } | ConvertTo-Json
    
    Write-Host "Sending payment request (Product: PROD001, Quantity: 2)..."
    $paymentResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/payments/card-direct" `
      -Method POST `
      -ContentType "application/json" `
      -Headers @{"Authorization" = "Bearer $token"} `
      -Body $paymentPayload `
      -UseBasicParsing
    
    $paymentData = $paymentResponse.Content | ConvertFrom-Json
    Write-Host "✓ Payment response received:"
    Write-Host ($paymentData | ConvertTo-Json -Depth 3)
  } else {
    Write-Host "✗ Login failed"
    Write-Host ($loginData | ConvertTo-Json)
  }
} catch {
  Write-Host "✗ Error occurred"
  Write-Host $_
}
