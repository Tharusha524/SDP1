$payload = @{ email="testcustomer@marukawa.com"; password="customer123" } | ConvertTo-Json
$login = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body $payload -UseBasicParsing -ErrorAction SilentlyContinue
$data = $login.Content | ConvertFrom-Json

if ($data.success) {
  $token = $data.token
  $pay = @{ productId="PRD-0001"; quantity=1; details="Test" } | ConvertTo-Json
  $resp = Invoke-WebRequest -Uri "http://localhost:5000/api/payments/card-direct" -Method POST -ContentType "application/json" -Headers @{"Authorization"="Bearer $token"} -Body $pay -UseBasicParsing -ErrorAction SilentlyContinue
  $result = $resp.Content | ConvertFrom-Json
  Write-Host ($result | ConvertTo-Json)
}
