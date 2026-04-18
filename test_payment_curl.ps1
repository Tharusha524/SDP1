# Test payment API
$loginPayload = @{
  username = "akindu"
  password = "password123"
} | ConvertTo-Json

Write-Host "Logging in..."
$loginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginPayload -UseBasicParsing

$loginData = $loginResponse.Content | ConvertFrom-Json
Write-Host "Login response: $($loginData | ConvertTo-Json)"

if ($loginData.token) {
  $token = $loginData.token
  Write-Host "Token received: $token`n"
  
  $paymentPayload = @{
    productId = "PROD001"
    quantity = 2
    details = "Test payment"
  } | ConvertTo-Json
  
  Write-Host "Sending payment request..."
  $paymentResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/payments/card-direct" `
    -Method POST `
    -ContentType "application/json" `
    -Headers @{"Authorization" = "Bearer $token"} `
    -Body $paymentPayload `
    -UseBasicParsing
  
  $paymentData = $paymentResponse.Content | ConvertFrom-Json
  Write-Host "Payment response: $($paymentData | ConvertTo-Json)"
} else {
  Write-Host "Login failed!"
}
