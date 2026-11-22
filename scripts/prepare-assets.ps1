Add-Type -AssemblyName System.Drawing
$patchProjectRoot = Split-Path $PSScriptRoot -Parent
$patchJpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$patchEncoderParameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
$patchEncoderParameters.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]90)
foreach ($patchAssetName in @('campaign', 'product', 'evening')) {
  $patchSourcePath = Join-Path $patchProjectRoot "output/imagegen/$patchAssetName.png"
  $patchTargetPath = Join-Path $patchProjectRoot "assets/$patchAssetName.jpg"
  $patchSourceImage = [System.Drawing.Image]::FromFile($patchSourcePath)
  try { $patchSourceImage.Save($patchTargetPath, $patchJpegEncoder, $patchEncoderParameters) }
  finally { $patchSourceImage.Dispose() }
}
$patchEncoderParameters.Dispose()
