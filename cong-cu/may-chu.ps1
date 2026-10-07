# may-chu.ps1 — máy chủ web tĩnh nhỏ (chỉ dùng để chạy thử trên máy, không bắt buộc).
# Cách dùng:  powershell -ExecutionPolicy Bypass -File cong-cu\may-chu.ps1   rồi mở http://localhost:8765
param([int]$Port = 8765)
$root = Split-Path -Parent $PSScriptRoot
$types = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.css'='text/css; charset=utf-8';
  '.json'='application/json'; '.woff2'='font/woff2'; '.png'='image/png'; '.svg'='image/svg+xml'; '.md'='text/plain; charset=utf-8' }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$Port/")
$l.Start()
Write-Host "Dang chay tai http://localhost:$Port/  (Ctrl+C de dung)"
while ($l.IsListening) {
  $c = $l.GetContext()
  try {
    $p = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath.TrimStart('/'))
    if ($p -eq 'thu-ket-qua') {
      # Giả lập Google Apps Script để chạy thử (mật khẩu: thu)
      $kho = Join-Path $PSScriptRoot 'thu-ket-qua.json'
      $ds = @(); if (Test-Path $kho) { $ds = @((Get-Content $kho -Raw -Encoding UTF8 | ConvertFrom-Json) | ForEach-Object { $_ }) }
      if ($c.Request.HttpMethod -eq 'POST') {
        $body = (New-Object IO.StreamReader($c.Request.InputStream, [Text.Encoding]::UTF8)).ReadToEnd() | ConvertFrom-Json
        $ds = @($ds | Where-Object { $_.id -ne $body.id }) + @([pscustomobject]@{ capNhat = (Get-Date).ToString('o'); id = $body.id; ma = $body.ma })
        [IO.File]::WriteAllText($kho, (ConvertTo-Json @($ds) -Depth 3), (New-Object Text.UTF8Encoding $false))
        $out = '{"ok":true}'
      } elseif ($c.Request.QueryString['khoa'] -eq 'thu') { $out = '{"ok":true,"ds":' + (ConvertTo-Json @($ds) -Depth 3 -Compress) + '}' }
      else { $out = '{"ok":false,"loi":"Sai mật khẩu giáo viên"}' }
      $b = [Text.Encoding]::UTF8.GetBytes($out); $c.Response.ContentType = 'application/json; charset=utf-8'
      $c.Response.OutputStream.Write($b, 0, $b.Length); $c.Response.Close(); continue
    }
    if ($p -eq '') { $p = 'index.html' }
    $f = Join-Path $root $p
    $full = [IO.Path]::GetFullPath($f)
    if ($full.StartsWith($root) -and (Test-Path $full -PathType Leaf)) {
      $b = [IO.File]::ReadAllBytes($full)
      $ext = [IO.Path]::GetExtension($full).ToLower()
      $c.Response.ContentType = $(if ($types.ContainsKey($ext)) { $types[$ext] } else { 'application/octet-stream' })
      $c.Response.Headers.Add('Cache-Control', 'no-store')
      $c.Response.OutputStream.Write($b, 0, $b.Length)
    } else { $c.Response.StatusCode = 404 }
  } catch { $c.Response.StatusCode = 500 }
  $c.Response.Close()
}
