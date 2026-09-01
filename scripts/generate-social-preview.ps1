Add-Type -AssemblyName System.Drawing

$width = 1200
$height = 630
$outputPath = Join-Path (Split-Path $PSScriptRoot -Parent) 'social-preview.png'
$trophyPath = Join-Path (Split-Path $PSScriptRoot -Parent) 'assets/icons/trophy.png'

$bitmap = [System.Drawing.Bitmap]::new($width, $height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#05080D'))

$panelBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#0D1420'))
$haloBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(22, 118, 255, 59))
$limeBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#76FF3B'))
$whiteBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#F8FAFC'))
$mutedBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml('#CBD5E1'))

# Match the application's dark card, lime ambient glow, and blue accent treatment.
$graphics.FillEllipse($haloBrush, 650, -115, 620, 620)
$graphics.FillRectangle($panelBrush, 690, 48, 454, 534)
$accentPen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#1687FF'), 8)
$accentPen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$accentPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$graphics.DrawLine($accentPen, 82, 105, 150, 105)

$brandFont = [System.Drawing.Font]::new('Segoe UI', 82, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$headlineFont = [System.Drawing.Font]::new('Segoe UI', 38, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$urlFont = [System.Drawing.Font]::new('Segoe UI', 24, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)

$graphics.DrawString('SpinOrder', $brandFont, $whiteBrush, 76, 132)
$graphics.DrawString('Free Randomizer for', $headlineFont, $whiteBrush, 82, 286)
$graphics.DrawString('Names, Teams & Draft Orders', $headlineFont, $whiteBrush, 82, 346)
$graphics.DrawString('spinorder.com', $urlFont, $mutedBrush, 84, 516)

# Reproduce the current application wheel: 12 contiguous slices, white rim,
# dark center hub, lime pointer, and the same participant color sequence.
$wheelX = 740
$wheelY = 126
$wheelSize = 390
$wheelCenterX = $wheelX + ($wheelSize / 2)
$wheelCenterY = $wheelY + ($wheelSize / 2)
$wheelColors = @('#DC2626', '#EA580C', '#EAB308', '#45A315', '#0F766E', '#1464C0', '#6D28D9', '#B91C67', '#8B451F', '#626262', '#0F8AA0', '#0A58B0')
$wheelBrushes = @()

$outerGlowPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(38, 118, 255, 59), 20)
$graphics.DrawEllipse($outerGlowPen, $wheelX - 4, $wheelY - 4, $wheelSize + 8, $wheelSize + 8)
for ($index = 0; $index -lt $wheelColors.Count; $index++) {
  $wheelBrush = [System.Drawing.SolidBrush]::new([System.Drawing.ColorTranslator]::FromHtml($wheelColors[$index]))
  $wheelBrushes += $wheelBrush
  $graphics.FillPie($wheelBrush, $wheelX, $wheelY, $wheelSize, $wheelSize, -90 + ($index * 30), 30)
}
$rimPen = [System.Drawing.Pen]::new([System.Drawing.ColorTranslator]::FromHtml('#E5E7EB'), 9)
$graphics.DrawEllipse($rimPen, $wheelX + 4.5, $wheelY + 4.5, $wheelSize - 9, $wheelSize - 9)

$hubSize = 104
$hubX = $wheelCenterX - ($hubSize / 2)
$hubY = $wheelCenterY - ($hubSize / 2)
$hubGlowPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(45, 118, 255, 59), 15)
$graphics.DrawEllipse($hubGlowPen, $hubX - 3, $hubY - 3, $hubSize + 6, $hubSize + 6)
$trophyImage = [System.Drawing.Image]::FromFile($trophyPath)
$graphics.DrawImage($trophyImage, $hubX, $hubY, $hubSize, $hubSize)

$pointer = [System.Drawing.PointF[]]@(
  [System.Drawing.PointF]::new($wheelCenterX - 23, 91),
  [System.Drawing.PointF]::new($wheelCenterX + 23, 91),
  [System.Drawing.PointF]::new($wheelCenterX, 137)
)
$graphics.FillPolygon($limeBrush, $pointer)

$borderPen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(52, 101, 183, 255), 2)
$graphics.DrawRectangle($borderPen, 34, 34, 1132, 562)

$outputDirectory = Split-Path $outputPath -Parent
if (-not (Test-Path -LiteralPath $outputDirectory)) { New-Item -ItemType Directory -Path $outputDirectory | Out-Null }
$bitmap.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

$borderPen.Dispose()
$trophyImage.Dispose()
$hubGlowPen.Dispose()
$rimPen.Dispose()
$outerGlowPen.Dispose()
$accentPen.Dispose()
foreach ($wheelBrush in $wheelBrushes) { $wheelBrush.Dispose() }
$brandFont.Dispose()
$headlineFont.Dispose()
$urlFont.Dispose()
$panelBrush.Dispose()
$haloBrush.Dispose()
$limeBrush.Dispose()
$whiteBrush.Dispose()
$mutedBrush.Dispose()
$graphics.Dispose()
$bitmap.Dispose()

Write-Output "Created $outputPath at ${width}x${height}"
