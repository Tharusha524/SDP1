$loginPayload = @{ email="testcustomer@marukawa.com"; password="customer123" } | ConvertTo-Json

Write-Host "Testing login..."
$loginResp = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginPayload -UseBasicParsing -ErrorAction SilentlyContinue
$loginData = $loginResp.Content | ConvertFrom-Json

if ($loginData.token) {
  $token = $loginData.token
  Write-Host "Login OK"
  
  $paymentPayload = @{ productId="PRD-0013"; quantity=2; details="Test" } | ConvertTo-Json
  
  Write-Host "Testing payment with PRD-0013..."
  $payResp = Invoke-WebRequest -Uri "http://localhost:5000/api/payments/card-direct" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer $token"} -Body $paymentPayload -UseBasicParsing -ErrorAction SilentlyContinue
  $paymentData = $payResp.Content | ConvertFrom-Json
  
  Write-Host "Payment result:"
  Write-Host $paymentData
} else {
  Write-Host "Login failed"
  Write-Host $loginData
}
