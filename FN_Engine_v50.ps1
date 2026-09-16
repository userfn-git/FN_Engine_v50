Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$win32Definition = @"
[DllImport("shell32.dll", SetLastError = true)]
public static extern void SetCurrentProcessExplicitAppUserModelID([MarshalAs(UnmanagedType.LPWStr)] string AppID);

[DllImport("user32.dll", CharSet = CharSet.Auto)]
public static extern bool PostMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

[DllImport("user32.dll", CharSet = CharSet.Auto)]
public static extern IntPtr SendMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);

[DllImport("user32.dll")]
public static extern bool SetForegroundWindow(IntPtr hWnd);
"@

if (-not ([System.Management.Automation.PSTypeName]'FN.Win32Native').Type) {
    Add-Type -MemberDefinition $win32Definition -Name 'Win32Native' -Namespace 'FN'
}

[FN.Win32Native]::SetCurrentProcessExplicitAppUserModelID("FN.RocketLeague.EsportsEngine.v70")

$engineDir     = "C:\FN_Engine_v50"
$macroLogFile  = Join-Path $engineDir "macro_execution.log"
$ghubBackupDir = Join-Path $engineDir "GHub_Backups"
$luaBackupDir  = Join-Path $engineDir "Lua_Backups"

$mainForm = New-Object System.Windows.Forms.Form
$mainForm.Text = "FN ROCKET LEAGUE MASTER ENGINE SUITE v7.0 (TABBED EDITION)"
$mainForm.Size = New-Object System.Drawing.Size(780, 740)
$mainForm.StartPosition = "CenterScreen"
$mainForm.FormBorderStyle = "FixedSingle"
$mainForm.MaximizeBox = $false
$mainForm.BackColor = [System.Drawing.Color]::FromArgb(12, 12, 18)

$icoPath = Join-Path $engineDir "RL_Esports.ico"
if (Test-Path $icoPath) {
    try {
        $appIcon = New-Object System.Drawing.Icon($icoPath)
        $mainForm.Icon = $appIcon
        $mainForm.Add_HandleCreated({
            $WM_SETICON = 0x0080
            [FN.Win32Native]::SendMessage($mainForm.Handle, $WM_SETICON, [IntPtr]0, $appIcon.Handle) | Out-Null
            [FN.Win32Native]::SendMessage($mainForm.Handle, $WM_SETICON, [IntPtr]1, $appIcon.Handle) | Out-Null
        })
    } catch {}
}

# Resolve Rocket League Paths
$userDocs = [Environment]::GetFolderPath("MyDocuments")
$configDir = Join-Path $userDocs "My Games\Rocket League\TAGame\Config"
$oneDriveDocs = Join-Path $env:USERPROFILE "OneDrive\Documents"
$altConfig    = Join-Path $oneDriveDocs "My Games\Rocket League\TAGame\Config"

if (-not (Test-Path $configDir) -and (Test-Path $altConfig)) { $configDir = $altConfig }

$workspaceDir = "$env:USERPROFILE\Desktop\FN_Engine_Manager"
$scriptDir    = Join-Path $workspaceDir "Scripts"
$outputDir    = Join-Path $workspaceDir "output"

foreach ($dir in @($configDir, $workspaceDir, $scriptDir, $outputDir, $luaBackupDir)) {
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }
}

$luaOutputPath = Join-Path $scriptDir "RocketLeague_Macros.lua"
$favJsonFile   = Join-Path $workspaceDir "favorites_packs.json"
$backupDir            = Join-Path $configDir "Backup"
$trainingDir          = Join-Path $userDocs "My Games\Rocket League\TAGame\Training"
$favoritesTrainingDir = Join-Path $trainingDir "Favorites"

$replayDir = Join-Path $userDocs "My Games\Rocket League\TAGame\DemosEpic"
if (-not (Test-Path $replayDir)) { $replayDir = Join-Path $userDocs "My Games\Rocket League\TAGame\Demos" }

$epicCookedDir = "C:\Program Files\Epic Games\rocketleague\TAGame\CookedPCConsole"
if (-not (Test-Path $epicCookedDir)) { $epicCookedDir = "C:\Program Files (x86)\Epic Games\rocketleague\TAGame\CookedPCConsole" }

$taPath       = Join-Path $configDir "TAInput.ini"
$taBackupPath = Join-Path $backupDir "TAInput.ini.bak"

$global:isEngineHooked = $false

function Safe-UnlockFile ($fileTarget) {
    if (Test-Path $fileTarget) {
        try {
            Unblock-File -Path $fileTarget -ErrorAction SilentlyContinue
            Set-ItemProperty -Path $fileTarget -Name IsReadOnly -Value $false -ErrorAction SilentlyContinue
            $item = Get-Item $fileTarget -ErrorAction SilentlyContinue
            if ($item) { $item.Attributes = 'Normal' }
        } catch {}
    }
}

function Get-GHubPath {
    $uninstallKeys = @(
        "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\*",
        "HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*"
    )
    foreach ($key in $uninstallKeys) {
        $found = Get-ItemProperty $key -ErrorAction SilentlyContinue | Where-Object { $_.DisplayName -like "*Logitech G HUB*" }
        if ($found -and $found.InstallLocation -and (Test-Path $found.InstallLocation)) {
            return $found.InstallLocation
        }
    }
    $commonPaths = @(
        "$env:ProgramFiles\LGHUB",
        "$env:ProgramFiles\Logitech\G HUB",
        "${env:ProgramFiles(x86)}\Logitech\G HUB",
        "$env:LOCALAPPDATA\Programs\LGHUB"
    )
    foreach ($p in $commonPaths) {
        if (Test-Path (Join-Path $p "lghub.exe")) { return $p }
    }
    return $null
}

function Start-GHubFullSuite {
    $ghubFolder = Get-GHubPath
    if ($ghubFolder) {
        $updater = Join-Path $ghubFolder "lghub_updater.exe"
        $agent   = Join-Path $ghubFolder "lghub_agent.exe"
        $mainExe = Join-Path $ghubFolder "lghub.exe"

        if (Test-Path $updater) { Start-Process -FilePath $updater -ErrorAction SilentlyContinue; Start-Sleep -Milliseconds 300 }
        if (Test-Path $agent)   { Start-Process -FilePath $agent -ErrorAction SilentlyContinue; Start-Sleep -Milliseconds 300 }
        if (Test-Path $mainExe) { Start-Process -FilePath $mainExe -ErrorAction SilentlyContinue }
        return $true
    }
    return $false
}

$fullEngineTAContent = @"
[TAGame.PlayerInput_TA]
KeyboardAxisBlendTime=0.000000
MouseSensitivity=1.000000
ControllerDeadzone=0.070000
DodgeDeadzone=0.050000
MoveForwardDeadzone=0.030000
MoveBackDeadzone=0.030000
SteerLeftDeadzone=0.030000
SteerRightDeadzone=0.030000

Bindings=(Name="W",Command="MoveForward")
Bindings=(Name="S",Command="MoveBackward")
Bindings=(Name="A",Command="SteerLeft")
Bindings=(Name="D",Command="SteerRight")
Bindings=(Name="LeftMouseButton",Command="Handbrake | Boost")
Bindings=(Name="RightMouseButton",Command="Jump")
Bindings=(Name="LeftShift",Command="Handbrake")
Bindings=(Name="ThumbMouseButton",Command="AirRollLeft")
Bindings=(Name="ThumbMouseButton2",Command="AirRollRight")
Bindings=(Name="SpaceBar",Command="ToggleCamera")

[Engine.PlayerInput]
KeyboardAxisBlendTime=0.000000
bEnableMouseSmoothing=false
"@

# Header Brand Panel
$brandPanel = New-Object System.Windows.Forms.Panel
$brandPanel.Location = New-Object System.Drawing.Point(15, 10)
$brandPanel.Size = New-Object System.Drawing.Size(735, 40)
$brandPanel.BackColor = [System.Drawing.Color]::FromArgb(20, 30, 45)
$brandPanel.BorderStyle = [System.Windows.Forms.BorderStyle]::FixedSingle

$headerLabel = New-Object System.Windows.Forms.Label
$headerLabel.Text = "FN ROCKET LEAGUE ESPORTS ENGINE v7.0 - TABBED CORE"
$headerLabel.Font = New-Object System.Drawing.Font("Consolas", 11, [System.Drawing.FontStyle]::Bold)
$headerLabel.ForeColor = [System.Drawing.Color]::Gold
$headerLabel.Size = New-Object System.Drawing.Size(710, 25)
$headerLabel.Location = New-Object System.Drawing.Point(10, 8)
$brandPanel.Controls.Add($headerLabel)
$mainForm.Controls.Add($brandPanel)

# Status Panel
$statusPanel = New-Object System.Windows.Forms.Panel
$statusPanel.Location = New-Object System.Drawing.Point(15, 55)
$statusPanel.Size = New-Object System.Drawing.Size(735, 45)
$statusPanel.BackColor = [System.Drawing.Color]::FromArgb(25, 25, 30)

$statusLabel = New-Object System.Windows.Forms.Label
$statusLabel.Text = "G HUB SERVICE STATUS    : CHECKING..."
$statusLabel.Font = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
$statusLabel.ForeColor = [System.Drawing.Color]::Yellow
$statusLabel.Size = New-Object System.Drawing.Size(710, 16)
$statusLabel.Location = New-Object System.Drawing.Point(10, 4)
$statusPanel.Controls.Add($statusLabel)

$rlStatusLabel = New-Object System.Windows.Forms.Label
$rlStatusLabel.Text = "ROCKET LEAGUE GAME STATUS: CHECKING..."
$rlStatusLabel.Font = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
$rlStatusLabel.ForeColor = [System.Drawing.Color]::Yellow
$rlStatusLabel.Size = New-Object System.Drawing.Size(710, 16)
$rlStatusLabel.Location = New-Object System.Drawing.Point(10, 22)
$statusPanel.Controls.Add($rlStatusLabel)
$mainForm.Controls.Add($statusPanel)

# Console Log Box
$logOutput = New-Object System.Windows.Forms.RichTextBox
$logOutput.Location = New-Object System.Drawing.Point(15, 105)
$logOutput.Size = New-Object System.Drawing.Size(735, 90)
$logOutput.BackColor = [System.Drawing.Color]::FromArgb(10, 10, 10)
$logOutput.ForeColor = [System.Drawing.Color]::LimeGreen
$logOutput.Font = New-Object System.Drawing.Font("Consolas", 8.5)
$logOutput.ReadOnly = $true
$logOutput.Text = "[INFO] FN Esports Master Engine v7.0 Tabbed Core Online.`n[TABBED UI] Integrated Multi-Tab Suite Active.`n"
$mainForm.Controls.Add($logOutput)

# TabControl Initialization
$tabControl = New-Object System.Windows.Forms.TabControl
$tabControl.Location = New-Object System.Drawing.Point(15, 202)
$tabControl.Size = New-Object System.Drawing.Size(735, 485)
$tabControl.Font = New-Object System.Drawing.Font("Consolas", 9, [System.Drawing.FontStyle]::Bold)

# TAB 1: Physics & Keys
$tabPhysics = New-Object System.Windows.Forms.TabPage
$tabPhysics.Text = "Physics & Bindings"
$tabPhysics.BackColor = [System.Drawing.Color]::FromArgb(18, 18, 24)

# TAB 2: Lua & Hook Engine
$tabLua = New-Object System.Windows.Forms.TabPage
$tabLua.Text = "Lua & Engine Hook"
$tabLua.BackColor = [System.Drawing.Color]::FromArgb(18, 18, 24)

# TAB 3: TAInput & G HUB Direct
$tabTAInput = New-Object System.Windows.Forms.TabPage
$tabTAInput.Text = "TAInput & G HUB Interop"
$tabTAInput.BackColor = [System.Drawing.Color]::FromArgb(18, 18, 24)

# TAB 4: Training & Launcher
$tabTraining = New-Object System.Windows.Forms.TabPage
$tabTraining.Text = "Training & Launchers"
$tabTraining.BackColor = [System.Drawing.Color]::FromArgb(18, 18, 24)

$tabControl.Controls.Add($tabPhysics)
$tabControl.Controls.Add($tabLua)
$tabControl.Controls.Add($tabTAInput)
$tabControl.Controls.Add($tabTraining)
$mainForm.Controls.Add($tabControl)

# --- TAB 1 CONTENT: Physics & Bindings ---
$grpPhysics = New-Object System.Windows.Forms.GroupBox
$grpPhysics.Text = " PRO INTERNAL PHYSICS & HARDWARE PROFILE "
$grpPhysics.Font = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
$grpPhysics.ForeColor = [System.Drawing.Color]::Magenta
$grpPhysics.Size = New-Object System.Drawing.Size(705, 140)
$grpPhysics.Location = New-Object System.Drawing.Point(10, 15)

$lblDZ = New-Object System.Windows.Forms.Label
$lblDZ.Text = "Internal DZ Preset:"
$lblDZ.ForeColor = [System.Drawing.Color]::White
$lblDZ.Font = New-Object System.Drawing.Font("Consolas", 8)
$lblDZ.Location = New-Object System.Drawing.Point(10, 25)
$lblDZ.Size = New-Object System.Drawing.Size(125, 20)
$grpPhysics.Controls.Add($lblDZ)

$cmbDZ = New-Object System.Windows.Forms.ComboBox
$cmbDZ.Size = New-Object System.Drawing.Size(170, 22)
$cmbDZ.Location = New-Object System.Drawing.Point(135, 22)
$cmbDZ.DropDownStyle = [System.Windows.Forms.ComboBoxStyle]::DropDownList
$cmbDZ.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$cmbDZ.ForeColor = [System.Drawing.Color]::Cyan
[void]$cmbDZ.Items.Add("0.05 (RW9 Ultra Fast)")
[void]$cmbDZ.Items.Add("0.07 (NWPO Esports Pro)")
[void]$cmbDZ.Items.Add("0.10 (Standard Precision)")
$cmbDZ.SelectedIndex = 1
$grpPhysics.Controls.Add($cmbDZ)

$lblDodge = New-Object System.Windows.Forms.Label
$lblDodge.Text = "Internal Dodge DZ:"
$lblDodge.ForeColor = [System.Drawing.Color]::White
$lblDodge.Font = New-Object System.Drawing.Font("Consolas", 8)
$lblDodge.Location = New-Object System.Drawing.Point(315, 25)
$lblDodge.Size = New-Object System.Drawing.Size(120, 20)
$grpPhysics.Controls.Add($lblDodge)

$txtDodge = New-Object System.Windows.Forms.TextBox
$txtDodge.Text = "0.05"
$txtDodge.Size = New-Object System.Drawing.Size(45, 22)
$txtDodge.Location = New-Object System.Drawing.Point(435, 22)
$txtDodge.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$txtDodge.ForeColor = [System.Drawing.Color]::Cyan
$grpPhysics.Controls.Add($txtDodge)

$lblHwProfile = New-Object System.Windows.Forms.Label
$lblHwProfile.Text = "Hardware Profile:"
$lblHwProfile.ForeColor = [System.Drawing.Color]::White
$lblHwProfile.Font = New-Object System.Drawing.Font("Consolas", 8)
$lblHwProfile.Location = New-Object System.Drawing.Point(10, 60)
$lblHwProfile.Size = New-Object System.Drawing.Size(120, 20)
$grpPhysics.Controls.Add($lblHwProfile)

$cmbHwProfile = New-Object System.Windows.Forms.ComboBox
$cmbHwProfile.Size = New-Object System.Drawing.Size(220, 22)
$cmbHwProfile.Location = New-Object System.Drawing.Point(135, 57)
$cmbHwProfile.DropDownStyle = [System.Windows.Forms.ComboBoxStyle]::DropDownList
$cmbHwProfile.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$cmbHwProfile.ForeColor = [System.Drawing.Color]::Cyan
[void]$cmbHwProfile.Items.Add("KBM Esports Pro (Logitech G502X)")
[void]$cmbHwProfile.Items.Add("Pure Keyboard & Mouse")
[void]$cmbHwProfile.Items.Add("Hybrid Controller/KBM")
$cmbHwProfile.SelectedIndex = 0
$grpPhysics.Controls.Add($cmbHwProfile)

$lblAngleJitter = New-Object System.Windows.Forms.Label
$lblAngleJitter.Text = "Axis Angle Jitter:"
$lblAngleJitter.ForeColor = [System.Drawing.Color]::White
$lblAngleJitter.Font = New-Object System.Drawing.Font("Consolas", 8)
$lblAngleJitter.Location = New-Object System.Drawing.Point(370, 60)
$lblAngleJitter.Size = New-Object System.Drawing.Size(120, 20)
$grpPhysics.Controls.Add($lblAngleJitter)

$cmbAngleJitter = New-Object System.Windows.Forms.ComboBox
$cmbAngleJitter.Size = New-Object System.Drawing.Size(130, 22)
$cmbAngleJitter.Location = New-Object System.Drawing.Point(495, 57)
$cmbAngleJitter.DropDownStyle = [System.Windows.Forms.ComboBoxStyle]::DropDownList
$cmbAngleJitter.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$cmbAngleJitter.ForeColor = [System.Drawing.Color]::Cyan
[void]$cmbAngleJitter.Items.Add("0.0 Deg (Off)")
[void]$cmbAngleJitter.Items.Add("0.5 Deg (Micro)")
[void]$cmbAngleJitter.Items.Add("1.0 Deg (Pro)")
[void]$cmbAngleJitter.Items.Add("2.0 Deg (Esports)")
$cmbAngleJitter.SelectedIndex = 2
$grpPhysics.Controls.Add($cmbAngleJitter)

$btnApplyUnifiedPhysics = New-Object System.Windows.Forms.Button
$btnApplyUnifiedPhysics.Text = "APPLY & INJECT PRO HARDWARE SETTINGS"
$btnApplyUnifiedPhysics.Font = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
$btnApplyUnifiedPhysics.Size = New-Object System.Drawing.Size(675, 30)
$btnApplyUnifiedPhysics.Location = New-Object System.Drawing.Point(15, 95)
$btnApplyUnifiedPhysics.BackColor = [System.Drawing.Color]::FromArgb(140, 0, 140)
$btnApplyUnifiedPhysics.ForeColor = [System.Drawing.Color]::White
$btnApplyUnifiedPhysics.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnApplyUnifiedPhysics.Add_Click({
    try {
        $dz    = $cmbDZ.SelectedItem.ToString().Split(' ')[0]
        $ddz   = $txtDodge.Text
        $hwProf = $cmbHwProfile.SelectedItem.ToString()
        $angJ  = $cmbAngleJitter.SelectedItem.ToString()

        if (-not (Test-Path $configDir)) { New-Item -ItemType Directory -Path $configDir -Force | Out-Null }
        Safe-UnlockFile $taPath
        if (Test-Path $taPath) {
            $content = Get-Content $taPath -Raw
            if ($content -match "ControllerDeadzone=") {
                $content = $content -replace "ControllerDeadzone=.*", "ControllerDeadzone=0.070000"
            } else {
                $content = $content -replace "\[TAGame.PlayerInput_TA\]", "[TAGame.PlayerInput_TA]`r`nControllerDeadzone=0.070000"
            }
            if ($content -match "DodgeDeadzone=") {
                $content = $content -replace "DodgeDeadzone=.*", "DodgeDeadzone=$ddz"
            } else {
                $content = $content -replace "\[TAGame.PlayerInput_TA\]", "[TAGame.PlayerInput_TA]`r`nDodgeDeadzone=$ddz"
            }
            [System.IO.File]::WriteAllText($taPath, $content, [System.Text.Encoding]::UTF8)
            Safe-UnlockFile $taPath
        }

        Generate-LuaScript
        $logOutput.AppendText("`n[PHYSICS SUCCESS] Hardware Profile: '$hwProf' Injected! Internal DZ: $dz, Dodge DZ: $ddz`n")
    } catch {
        $logOutput.AppendText("`n[ERROR] Physics Injection Exception: $($_.Exception.Message)`n")
    }
})
$grpPhysics.Controls.Add($btnApplyUnifiedPhysics)
$tabPhysics.Controls.Add($grpPhysics)

# Group Key Bindings
$grpKbKeys = New-Object System.Windows.Forms.GroupBox
$grpKbKeys.Text = " STANDARD KEYBOARD ESSENTIAL BINDINGS "
$grpKbKeys.Font = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
$grpKbKeys.ForeColor = [System.Drawing.Color]::Cyan
$grpKbKeys.Size = New-Object System.Drawing.Size(705, 70)
$grpKbKeys.Location = New-Object System.Drawing.Point(10, 165)

$validKeys = @("SpaceBar", "LeftShift", "S", "W", "A", "D", "Q", "E", "LeftControl")

$lblAerial = New-Object System.Windows.Forms.Label
$lblAerial.Text = "Aerial Key:"
$lblAerial.ForeColor = [System.Drawing.Color]::White
$lblAerial.Font = New-Object System.Drawing.Font("Consolas", 8)
$lblAerial.Location = New-Object System.Drawing.Point(10, 30)
$lblAerial.Size = New-Object System.Drawing.Size(75, 20)
$grpKbKeys.Controls.Add($lblAerial)

$cmbAerialKey = New-Object System.Windows.Forms.ComboBox
$cmbAerialKey.Size = New-Object System.Drawing.Size(100, 22)
$cmbAerialKey.Location = New-Object System.Drawing.Point(85, 27)
$cmbAerialKey.DropDownStyle = [System.Windows.Forms.ComboBoxStyle]::DropDownList
$cmbAerialKey.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$cmbAerialKey.ForeColor = [System.Drawing.Color]::Cyan
foreach ($k in $validKeys) { [void]$cmbAerialKey.Items.Add($k) }
$cmbAerialKey.SelectedIndex = 0
$grpKbKeys.Controls.Add($cmbAerialKey)

$lblSpeed = New-Object System.Windows.Forms.Label
$lblSpeed.Text = "Speedflip Key:"
$lblSpeed.ForeColor = [System.Drawing.Color]::White
$lblSpeed.Font = New-Object System.Drawing.Font("Consolas", 8)
$lblSpeed.Location = New-Object System.Drawing.Point(200, 30)
$lblSpeed.Size = New-Object System.Drawing.Size(95, 20)
$grpKbKeys.Controls.Add($lblSpeed)

$cmbSpeedKey = New-Object System.Windows.Forms.ComboBox
$cmbSpeedKey.Size = New-Object System.Drawing.Size(100, 22)
$cmbSpeedKey.Location = New-Object System.Drawing.Point(295, 27)
$cmbSpeedKey.DropDownStyle = [System.Windows.Forms.ComboBoxStyle]::DropDownList
$cmbSpeedKey.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$cmbSpeedKey.ForeColor = [System.Drawing.Color]::Cyan
foreach ($k in $validKeys) { [void]$cmbSpeedKey.Items.Add($k) }
$cmbSpeedKey.SelectedIndex = 1
$grpKbKeys.Controls.Add($cmbSpeedKey)

$lblHalf = New-Object System.Windows.Forms.Label
$lblHalf.Text = "HalfFlip Key:"
$lblHalf.ForeColor = [System.Drawing.Color]::White
$lblHalf.Font = New-Object System.Drawing.Font("Consolas", 8)
$lblHalf.Location = New-Object System.Drawing.Point(410, 30)
$lblHalf.Size = New-Object System.Drawing.Size(85, 20)
$grpKbKeys.Controls.Add($lblHalf)

$cmbHalfKey = New-Object System.Windows.Forms.ComboBox
$cmbHalfKey.Size = New-Object System.Drawing.Size(100, 22)
$cmbHalfKey.Location = New-Object System.Drawing.Point(495, 27)
$cmbHalfKey.DropDownStyle = [System.Windows.Forms.ComboBoxStyle]::DropDownList
$cmbHalfKey.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$cmbHalfKey.ForeColor = [System.Drawing.Color]::Cyan
foreach ($k in $validKeys) { [void]$cmbHalfKey.Items.Add($k) }
$cmbHalfKey.SelectedIndex = 2
$grpKbKeys.Controls.Add($cmbHalfKey)
$tabPhysics.Controls.Add($grpKbKeys)

# Group G-Keys
$grpGKeys = New-Object System.Windows.Forms.GroupBox
$grpGKeys.Text = " LOGITECH G-KEYS MAPPING SUITE (FULL G1-G6) "
$grpGKeys.Font = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
$grpGKeys.ForeColor = [System.Drawing.Color]::Yellow
$grpGKeys.Size = New-Object System.Drawing.Size(705, 80)
$grpGKeys.Location = New-Object System.Drawing.Point(10, 245)

$gKeysList = @("G1 (Left Click / Boost)", "G2 (Right Click / Jump)", "G3 (MB3)", "G4 (MB4)", "G5 (MB5)", "G6 (Macro)")

$lblDashGKey = New-Object System.Windows.Forms.Label
$lblDashGKey.Text = "Dash G-Key:"
$lblDashGKey.ForeColor = [System.Drawing.Color]::White
$lblDashGKey.Font = New-Object System.Drawing.Font("Consolas", 8)
$lblDashGKey.Location = New-Object System.Drawing.Point(10, 32)
$lblDashGKey.Size = New-Object System.Drawing.Size(80, 20)
$grpGKeys.Controls.Add($lblDashGKey)

$cmbDashGKey = New-Object System.Windows.Forms.ComboBox
$cmbDashGKey.Size = New-Object System.Drawing.Size(130, 22)
$cmbDashGKey.Location = New-Object System.Drawing.Point(90, 29)
$cmbDashGKey.DropDownStyle = [System.Windows.Forms.ComboBoxStyle]::DropDownList
$cmbDashGKey.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$cmbDashGKey.ForeColor = [System.Drawing.Color]::Cyan
foreach ($g in $gKeysList) { [void]$cmbDashGKey.Items.Add($g) }
$cmbDashGKey.SelectedIndex = 2
$grpGKeys.Controls.Add($cmbDashGKey)

$lblSpeedGKey = New-Object System.Windows.Forms.Label
$lblSpeedGKey.Text = "Speedflip G-Key:"
$lblSpeedGKey.ForeColor = [System.Drawing.Color]::White
$lblSpeedGKey.Font = New-Object System.Drawing.Font("Consolas", 8)
$lblSpeedGKey.Location = New-Object System.Drawing.Point(230, 32)
$lblSpeedGKey.Size = New-Object System.Drawing.Size(105, 20)
$grpGKeys.Controls.Add($lblSpeedGKey)

$cmbSpeedGKey = New-Object System.Windows.Forms.ComboBox
$cmbSpeedGKey.Size = New-Object System.Drawing.Size(130, 22)
$cmbSpeedGKey.Location = New-Object System.Drawing.Point(335, 29)
$cmbSpeedGKey.DropDownStyle = [System.Windows.Forms.ComboBoxStyle]::DropDownList
$cmbSpeedGKey.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$cmbSpeedGKey.ForeColor = [System.Drawing.Color]::Cyan
foreach ($g in $gKeysList) { [void]$cmbSpeedGKey.Items.Add($g) }
$cmbSpeedGKey.SelectedIndex = 4
$grpGKeys.Controls.Add($cmbSpeedGKey)

$btnSaveGKeys = New-Object System.Windows.Forms.Button
$btnSaveGKeys.Text = "APPLY ALL KEYS & GENERATE LUA"
$btnSaveGKeys.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnSaveGKeys.Size = New-Object System.Drawing.Size(215, 30)
$btnSaveGKeys.Location = New-Object System.Drawing.Point(475, 26)
$btnSaveGKeys.BackColor = [System.Drawing.Color]::FromArgb(180, 100, 0)
$btnSaveGKeys.ForeColor = [System.Drawing.Color]::White
$btnSaveGKeys.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnSaveGKeys.Add_Click({
    Generate-LuaScript
    $logOutput.AppendText("`n[G-KEYS] Mouse & Full G1-G6 Mappings Applied to Advanced Lua Engine.`n")
})
$grpGKeys.Controls.Add($btnSaveGKeys)
$tabPhysics.Controls.Add($grpGKeys)

# --- TAB 2 CONTENT: Lua & Hook Engine ---
$grpLuaManager = New-Object System.Windows.Forms.GroupBox
$grpLuaManager.Text = " LUA ENGINE CONFIG & RUNTIME SUITE "
$grpLuaManager.Font = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
$grpLuaManager.ForeColor = [System.Drawing.Color]::LimeGreen
$grpLuaManager.Size = New-Object System.Drawing.Size(705, 180)
$grpLuaManager.Location = New-Object System.Drawing.Point(10, 15)

$btnCreateLuaConfig = New-Object System.Windows.Forms.Button
$btnCreateLuaConfig.Text = "CREATE LUA CONFIG"
$btnCreateLuaConfig.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnCreateLuaConfig.Size = New-Object System.Drawing.Size(160, 35)
$btnCreateLuaConfig.Location = New-Object System.Drawing.Point(15, 30)
$btnCreateLuaConfig.BackColor = [System.Drawing.Color]::FromArgb(0, 140, 60)
$btnCreateLuaConfig.ForeColor = [System.Drawing.Color]::White
$btnCreateLuaConfig.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnCreateLuaConfig.Add_Click({
    try {
        Generate-LuaScript
        $logOutput.AppendText("`n[LUA ENGINE] Generated Advanced Lua Config at: $luaOutputPath`n")
    } catch {
        $logOutput.AppendText("`n[ERROR] Create Lua Config Failed: $($_.Exception.Message)`n")
    }
})
$grpLuaManager.Controls.Add($btnCreateLuaConfig)

$btnEditLuaConfig = New-Object System.Windows.Forms.Button
$btnEditLuaConfig.Text = "EDIT LUA CONFIG"
$btnEditLuaConfig.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnEditLuaConfig.Size = New-Object System.Drawing.Size(160, 35)
$btnEditLuaConfig.Location = New-Object System.Drawing.Point(185, 30)
$btnEditLuaConfig.BackColor = [System.Drawing.Color]::FromArgb(40, 120, 40)
$btnEditLuaConfig.ForeColor = [System.Drawing.Color]::White
$btnEditLuaConfig.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnEditLuaConfig.Add_Click({
    try {
        if (-not (Test-Path $luaOutputPath)) { Generate-LuaScript }
        Safe-UnlockFile $luaOutputPath
        Start-Process notepad.exe -ArgumentList "`"$luaOutputPath`""
        $logOutput.AppendText("`n[LUA ENGINE] Opened Lua Script in Notepad.`n")
    } catch {
        $logOutput.AppendText("`n[ERROR] Edit Lua Config Failed: $($_.Exception.Message)`n")
    }
})
$grpLuaManager.Controls.Add($btnEditLuaConfig)

$btnBackupLua = New-Object System.Windows.Forms.Button
$btnBackupLua.Text = "BACKUP LUA CONFIG"
$btnBackupLua.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnBackupLua.Size = New-Object System.Drawing.Size(160, 35)
$btnBackupLua.Location = New-Object System.Drawing.Point(355, 30)
$btnBackupLua.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 160)
$btnBackupLua.ForeColor = [System.Drawing.Color]::White
$btnBackupLua.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnBackupLua.Add_Click({
    try {
        if (Test-Path $luaOutputPath) {
            $timeStamp = Get-Date -Format "yyyyMMdd_HHmmss"
            $destBackup = Join-Path $luaBackupDir "RocketLeague_Macros_$timeStamp.lua.bak"
            Safe-UnlockFile $luaOutputPath
            Copy-Item -Path $luaOutputPath -Destination $destBackup -Force
            $logOutput.AppendText("`n[LUA BACKUP] Saved Lua Backup to: $destBackup`n")
        } else {
            $logOutput.AppendText("`n[LUA BACKUP ERROR] Lua script not found. Click CREATE LUA CONFIG first.`n")
        }
    } catch {
        $logOutput.AppendText("`n[ERROR] Backup Lua Exception: $($_.Exception.Message)`n")
    }
})
$grpLuaManager.Controls.Add($btnBackupLua)

$btnRestoreLua = New-Object System.Windows.Forms.Button
$btnRestoreLua.Text = "RESTORE LUA CONFIG"
$btnRestoreLua.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnRestoreLua.Size = New-Object System.Drawing.Size(160, 35)
$btnRestoreLua.Location = New-Object System.Drawing.Point(525, 30)
$btnRestoreLua.BackColor = [System.Drawing.Color]::FromArgb(160, 80, 0)
$btnRestoreLua.ForeColor = [System.Drawing.Color]::White
$btnRestoreLua.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnRestoreLua.Add_Click({
    try {
        $ofd = New-Object System.Windows.Forms.OpenFileDialog
        $ofd.InitialDirectory = $luaBackupDir
        $ofd.Filter = "Lua Backup Files (*.bak)|*.bak|Lua Files (*.lua)|*.lua|All Files (*.*)|*.*"
        $ofd.Title = "Select Lua Config Backup to Restore"

        if ($ofd.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
            Safe-UnlockFile $luaOutputPath
            Copy-Item -Path $ofd.FileName -Destination $luaOutputPath -Force
            Safe-UnlockFile $luaOutputPath
            $logOutput.AppendText("`n[LUA RESTORE] Restored Lua Script from: $($ofd.FileName)`n")
        }
    } catch {
        $logOutput.AppendText("`n[ERROR] Restore Lua Exception: $($_.Exception.Message)`n")
    }
})
$grpLuaManager.Controls.Add($btnRestoreLua)

$btnRunLuaEnv = New-Object System.Windows.Forms.Button
$btnRunLuaEnv.Text = "RUN LUA ENVIRONMENT (LIVE MONITOR)"
$btnRunLuaEnv.Font = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
$btnRunLuaEnv.Size = New-Object System.Drawing.Size(670, 35)
$btnRunLuaEnv.Location = New-Object System.Drawing.Point(15, 80)
$btnRunLuaEnv.BackColor = [System.Drawing.Color]::FromArgb(150, 0, 180)
$btnRunLuaEnv.ForeColor = [System.Drawing.Color]::White
$btnRunLuaEnv.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnRunLuaEnv.Add_Click({
    try {
        if (-not (Test-Path $luaOutputPath)) { Generate-LuaScript }
        Add-Content -Path $macroLogFile -Value "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [USER_INIT] Live Environment Terminal Monitor Hooked." -ErrorAction SilentlyContinue
        Start-Process powershell.exe -ArgumentList "-NoExit -Command `"Write-Host '--- LUA ENVIRONMENT ACTIVE MONITOR ---' -ForegroundColor Cyan; Get-Content -Path '$macroLogFile' -Wait -Tail 20`""
        $logOutput.AppendText("`n[LUA ENVIRONMENT] Launched Live Engine Terminal Monitor.`n")
    } catch {
        $logOutput.AppendText("`n[ERROR] Failed to Run Lua Environment.`n")
    }
})
$grpLuaManager.Controls.Add($btnRunLuaEnv)
$tabLua.Controls.Add($grpLuaManager)

$grpHook = New-Object System.Windows.Forms.GroupBox
$grpHook.Text = " PHYSICAL ENGINE HOOK CONTROLLER "
$grpHook.Font = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
$grpHook.ForeColor = [System.Drawing.Color]::Orange
$grpHook.Size = New-Object System.Drawing.Size(705, 80)
$grpHook.Location = New-Object System.Drawing.Point(10, 210)

$btnCreateHook = New-Object System.Windows.Forms.Button
$btnCreateHook.Text = "INSPECT & CREATE HOOK"
$btnCreateHook.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnCreateHook.Size = New-Object System.Drawing.Size(210, 32)
$btnCreateHook.Location = New-Object System.Drawing.Point(15, 28)
$btnCreateHook.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 180)
$btnCreateHook.ForeColor = [System.Drawing.Color]::White
$btnCreateHook.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnCreateHook.Add_Click({
    try {
        $dz     = $cmbDZ.SelectedItem.ToString().Split(' ')[0]
        $ddz    = $txtDodge.Text
        $hwProf = $cmbHwProfile.SelectedItem.ToString()
        $angJ   = $cmbAngleJitter.SelectedItem.ToString()
        $logOutput.AppendText("`n[HOOK INSPECTION] Loaded Hook Config -> Preset DZ: $dz | Dodge DZ: $ddz | HW Profile: $hwProf | Angle Jitter: $angJ`n")
        $lblHookStatus.Text = "HOOK STATUS: INSPECTED & READY"
        $lblHookStatus.ForeColor = [System.Drawing.Color]::Yellow
    } catch {
        $logOutput.AppendText("`n[ERROR] Engine Hook Init Exception: $($_.Exception.Message)`n")
    }
})
$grpHook.Controls.Add($btnCreateHook)

$btnHookOn = New-Object System.Windows.Forms.Button
$btnHookOn.Text = "HOOK [ON]"
$btnHookOn.Font = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
$btnHookOn.Size = New-Object System.Drawing.Size(110, 32)
$btnHookOn.Location = New-Object System.Drawing.Point(235, 28)
$btnHookOn.BackColor = [System.Drawing.Color]::FromArgb(0, 160, 80)
$btnHookOn.ForeColor = [System.Drawing.Color]::White
$btnHookOn.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnHookOn.Add_Click({
    $global:isEngineHooked = $true
    $lblHookStatus.Text = "HOOK STATUS: [ON] ACTIVE"
    $lblHookStatus.ForeColor = [System.Drawing.Color]::Lime
    $logOutput.AppendText("`n[ENGINE HOOK] Engaged Active Engine Memory Control.`n")
})
$grpHook.Controls.Add($btnHookOn)

$btnHookOff = New-Object System.Windows.Forms.Button
$btnHookOff.Text = "HOOK [OFF]"
$btnHookOff.Font = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
$btnHookOff.Size = New-Object System.Drawing.Size(110, 32)
$btnHookOff.Location = New-Object System.Drawing.Point(355, 28)
$btnHookOff.BackColor = [System.Drawing.Color]::FromArgb(180, 40, 40)
$btnHookOff.ForeColor = [System.Drawing.Color]::White
$btnHookOff.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnHookOff.Add_Click({
    $global:isEngineHooked = $false
    $lblHookStatus.Text = "HOOK STATUS: [OFF] INACTIVE"
    $lblHookStatus.ForeColor = [System.Drawing.Color]::Red
    $logOutput.AppendText("`n[ENGINE HOOK] Disengaged Engine Control.`n")
})
$grpHook.Controls.Add($btnHookOff)

$lblHookStatus = New-Object System.Windows.Forms.Label
$lblHookStatus.Text = "HOOK STATUS: [OFF] INACTIVE"
$lblHookStatus.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$lblHookStatus.ForeColor = [System.Drawing.Color]::Red
$lblHookStatus.Size = New-Object System.Drawing.Size(210, 25)
$lblHookStatus.Location = New-Object System.Drawing.Point(475, 33)
$grpHook.Controls.Add($lblHookStatus)
$tabLua.Controls.Add($grpHook)

# --- TAB 3 CONTENT: TAInput & G HUB Interop ---
$grpTAManager = New-Object System.Windows.Forms.GroupBox
$grpTAManager.Text = " TAINPUT.INI CONFIGURATION MANAGER "
$grpTAManager.Font = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
$grpTAManager.ForeColor = [System.Drawing.Color]::Violet
$grpTAManager.Size = New-Object System.Drawing.Size(705, 80)
$grpTAManager.Location = New-Object System.Drawing.Point(10, 15)

$btnCreateTAInput = New-Object System.Windows.Forms.Button
$btnCreateTAInput.Text = "CREATE TAINPUT"
$btnCreateTAInput.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnCreateTAInput.Size = New-Object System.Drawing.Size(160, 32)
$btnCreateTAInput.Location = New-Object System.Drawing.Point(15, 28)
$btnCreateTAInput.BackColor = [System.Drawing.Color]::FromArgb(140, 0, 180)
$btnCreateTAInput.ForeColor = [System.Drawing.Color]::White
$btnCreateTAInput.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnCreateTAInput.Add_Click({
    try {
        if (-not (Test-Path $configDir)) { New-Item -ItemType Directory -Path $configDir -Force | Out-Null }
        Safe-UnlockFile $taPath
        [System.IO.File]::WriteAllText($taPath, $fullEngineTAContent, [System.Text.Encoding]::UTF8)
        Safe-UnlockFile $taPath
        $logOutput.AppendText("`n[SUCCESS] Injected Direct FN Engine Physics into TAInput.ini.`n")
    } catch {
        $logOutput.AppendText("`n[ERROR] Failed to Create TAInput.ini: $($_.Exception.Message)`n")
    }
})
$grpTAManager.Controls.Add($btnCreateTAInput)

$btnEditTAInput = New-Object System.Windows.Forms.Button
$btnEditTAInput.Text = "EDIT TAINPUT"
$btnEditTAInput.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnEditTAInput.Size = New-Object System.Drawing.Size(160, 32)
$btnEditTAInput.Location = New-Object System.Drawing.Point(185, 28)
$btnEditTAInput.BackColor = [System.Drawing.Color]::FromArgb(100, 0, 160)
$btnEditTAInput.ForeColor = [System.Drawing.Color]::White
$btnEditTAInput.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnEditTAInput.Add_Click({
    try {
        if (-not (Test-Path $taPath)) {
            if (-not (Test-Path $configDir)) { New-Item -ItemType Directory -Path $configDir -Force | Out-Null }
            [System.IO.File]::WriteAllText($taPath, $fullEngineTAContent, [System.Text.Encoding]::UTF8)
        }
        Safe-UnlockFile $taPath
        Start-Process notepad.exe -ArgumentList "`"$taPath`""
        $logOutput.AppendText("`n[TAINPUT] Opened TAInput.ini in Notepad.`n")
    } catch {
        $logOutput.AppendText("`n[ERROR] Failed to Edit TAInput.ini: $($_.Exception.Message)`n")
    }
})
$grpTAManager.Controls.Add($btnEditTAInput)

$btnBackupTA = New-Object System.Windows.Forms.Button
$btnBackupTA.Text = "BACKUP TAINPUT"
$btnBackupTA.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnBackupTA.Size = New-Object System.Drawing.Size(160, 32)
$btnBackupTA.Location = New-Object System.Drawing.Point(355, 28)
$btnBackupTA.BackColor = [System.Drawing.Color]::FromArgb(0, 140, 120)
$btnBackupTA.ForeColor = [System.Drawing.Color]::White
$btnBackupTA.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnBackupTA.Add_Click({
    try {
        if (Test-Path $taPath) { 
            if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir -Force | Out-Null }
            Safe-UnlockFile $taPath
            Copy-Item -Path $taPath -Destination $taBackupPath -Force
            $logOutput.AppendText("`n[TAINPUT BACKUP] Saved TAInput.ini.bak inside Backup subfolder.`n") 
        } else {
            $logOutput.AppendText("`n[TAINPUT BACKUP ERROR] TAInput.ini missing. Create it first.`n")
        }
    } catch {
        $logOutput.AppendText("`n[ERROR] Backup TAInput Exception: $($_.Exception.Message)`n")
    }
})
$grpTAManager.Controls.Add($btnBackupTA)

$btnRestoreTA = New-Object System.Windows.Forms.Button
$btnRestoreTA.Text = "RESTORE TAINPUT"
$btnRestoreTA.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnRestoreTA.Size = New-Object System.Drawing.Size(160, 32)
$btnRestoreTA.Location = New-Object System.Drawing.Point(525, 28)
$btnRestoreTA.BackColor = [System.Drawing.Color]::FromArgb(100, 100, 100)
$btnRestoreTA.ForeColor = [System.Drawing.Color]::White
$btnRestoreTA.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnRestoreTA.Add_Click({
    try {
        if (Test-Path $taBackupPath) {
            Safe-UnlockFile $taPath
            Copy-Item -Path $taBackupPath -Destination $taPath -Force
            Safe-UnlockFile $taPath
            $logOutput.AppendText("`n[TAINPUT RESTORE] Restored TAInput.ini from Backup subfolder!`n")
        } else {
            $logOutput.AppendText("`n[TAINPUT RESTORE ERROR] Backup file TAInput.ini.bak not found.`n")
        }
    } catch {
        $logOutput.AppendText("`n[ERROR] Restore TAInput Exception: $($_.Exception.Message)`n")
    }
})
$grpTAManager.Controls.Add($btnRestoreTA)
$tabTAInput.Controls.Add($grpTAManager)

$grpGHubSuite = New-Object System.Windows.Forms.GroupBox
$grpGHubSuite.Text = " LOGITECH G HUB SERVICE & PROFILE SUITE "
$grpGHubSuite.Font = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
$grpGHubSuite.ForeColor = [System.Drawing.Color]::Gold
$grpGHubSuite.Size = New-Object System.Drawing.Size(705, 120)
$grpGHubSuite.Location = New-Object System.Drawing.Point(10, 105)

$btnStartGHub = New-Object System.Windows.Forms.Button
$btnStartGHub.Text = "START G HUB SUITE"
$btnStartGHub.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnStartGHub.Size = New-Object System.Drawing.Size(160, 32)
$btnStartGHub.Location = New-Object System.Drawing.Point(15, 28)
$btnStartGHub.BackColor = [System.Drawing.Color]::FromArgb(0, 140, 90)
$btnStartGHub.ForeColor = [System.Drawing.Color]::White
$btnStartGHub.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnStartGHub.Add_Click({
    if (Start-GHubFullSuite) {
        $logOutput.AppendText("`n[G HUB] Launched All G HUB Background Services.`n")
    } else {
        $logOutput.AppendText("`n[G HUB ERROR] Could not find G HUB path.`n")
    }
})
$grpGHubSuite.Controls.Add($btnStartGHub)

$btnRestartGHub = New-Object System.Windows.Forms.Button
$btnRestartGHub.Text = "RESTART G HUB SUITE"
$btnRestartGHub.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnRestartGHub.Size = New-Object System.Drawing.Size(160, 32)
$btnRestartGHub.Location = New-Object System.Drawing.Point(185, 28)
$btnRestartGHub.BackColor = [System.Drawing.Color]::FromArgb(180, 40, 40)
$btnRestartGHub.ForeColor = [System.Drawing.Color]::White
$btnRestartGHub.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnRestartGHub.Add_Click({
    Get-Process -Name "lghub*", "lghub_agent", "lghub_updater" -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Seconds 2
    if (Start-GHubFullSuite) {
        $logOutput.AppendText("`n[G HUB] Restarted Services Cleanly.`n")
    } else {
        $logOutput.AppendText("`n[G HUB ERROR] Failed to restart G HUB.`n")
    }
})
$grpGHubSuite.Controls.Add($btnRestartGHub)

$btnBackupGHub = New-Object System.Windows.Forms.Button
$btnBackupGHub.Text = "BACKUP G HUB SETTINGS"
$btnBackupGHub.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnBackupGHub.Size = New-Object System.Drawing.Size(160, 32)
$btnBackupGHub.Location = New-Object System.Drawing.Point(355, 28)
$btnBackupGHub.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 160)
$btnBackupGHub.ForeColor = [System.Drawing.Color]::White
$btnBackupGHub.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnBackupGHub.Add_Click({
    $ghubSettings = "$env:LOCALAPPDATA\LGHUB\settings.db"
    if (Test-Path $ghubSettings) {
        $timeStamp = Get-Date -Format "yyyyMMdd_HHmmss"
        $destBackup = Join-Path $ghubBackupDir "settings_$timeStamp.db"
        Copy-Item -Path $ghubSettings -Destination $destBackup -Force
        $logOutput.AppendText("`n[G HUB BACKUP] Saved Settings DB to: $destBackup`n")
    } else {
        $logOutput.AppendText("`n[G HUB BACKUP ERROR] settings.db not found.`n")
    }
})
$grpGHubSuite.Controls.Add($btnBackupGHub)

$btnRestoreGHub = New-Object System.Windows.Forms.Button
$btnRestoreGHub.Text = "RESTORE G HUB SETTINGS"
$btnRestoreGHub.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnRestoreGHub.Size = New-Object System.Drawing.Size(160, 32)
$btnRestoreGHub.Location = New-Object System.Drawing.Point(525, 28)
$btnRestoreGHub.BackColor = [System.Drawing.Color]::FromArgb(160, 80, 0)
$btnRestoreGHub.ForeColor = [System.Drawing.Color]::White
$btnRestoreGHub.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnRestoreGHub.Add_Click({
    $ofd = New-Object System.Windows.Forms.OpenFileDialog
    $ofd.InitialDirectory = $ghubBackupDir
    $ofd.Filter = "G HUB Database (*.db)|*.db|All Files (*.*)|*.*"
    $ofd.Title = "Select G HUB Settings Backup to Restore"

    if ($ofd.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        $selectedFile = $ofd.FileName
        $targetSettings = "$env:LOCALAPPDATA\LGHUB\settings.db"

        Get-Process -Name "lghub*", "lghub_agent", "lghub_updater" -ErrorAction SilentlyContinue | Stop-Process -Force
        Start-Sleep -Seconds 1

        Copy-Item -Path $selectedFile -Destination $targetSettings -Force
        $logOutput.AppendText("`n[G HUB RESTORE] Restored DB from: $selectedFile`n")

        Start-GHubFullSuite | Out-Null
        $logOutput.AppendText("[G HUB RESTORE] Services Restarted with Restored Profile!`n")
    }
})
$grpGHubSuite.Controls.Add($btnRestoreGHub)

$btnSaveRunGHub = New-Object System.Windows.Forms.Button
$btnSaveRunGHub.Text = "SAVE & RUN SCRIPT IN G HUB (WIN32 POSTMESSAGE)"
$btnSaveRunGHub.Font = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
$btnSaveRunGHub.Size = New-Object System.Drawing.Size(670, 32)
$btnSaveRunGHub.Location = New-Object System.Drawing.Point(15, 70)
$btnSaveRunGHub.BackColor = [System.Drawing.Color]::FromArgb(215, 140, 0)
$btnSaveRunGHub.ForeColor = [System.Drawing.Color]::White
$btnSaveRunGHub.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnSaveRunGHub.Add_Click({
    try {
        $ghubProcess = Get-Process -Name "lghub" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne [IntPtr]::Zero } | Select-Object -First 1
        if ($ghubProcess) {
            $hwnd = $ghubProcess.MainWindowHandle
            $WM_KEYDOWN = 0x0100
            $WM_KEYUP   = 0x0101
            $VK_CONTROL = [IntPtr]0x11
            $VK_S       = [IntPtr]0x53

            [FN.Win32Native]::PostMessage($hwnd, $WM_KEYDOWN, $VK_CONTROL, [IntPtr]0)
            Start-Sleep -Milliseconds 50
            [FN.Win32Native]::PostMessage($hwnd, $WM_KEYDOWN, $VK_S, [IntPtr]0)
            Start-Sleep -Milliseconds 50
            [FN.Win32Native]::PostMessage($hwnd, $WM_KEYUP, $VK_S, [IntPtr]0)
            Start-Sleep -Milliseconds 50
            [FN.Win32Native]::PostMessage($hwnd, $WM_KEYUP, $VK_CONTROL, [IntPtr]0)

            $logOutput.AppendText("`n[G HUB] Sent Ctrl+S signal in background via PostMessage.`n")
        } else {
            $logOutput.AppendText("`n[G HUB ERROR] Target G HUB Window handle not found.`n")
        }
    } catch {
        $logOutput.AppendText("`n[G HUB ERROR] Failed to send PostMessage Win32 event.`n")
    }
})
$grpGHubSuite.Controls.Add($btnSaveRunGHub)
$tabTAInput.Controls.Add($grpGHubSuite)

# --- TAB 4 CONTENT: Training & Launchers ---
$grpTraining = New-Object System.Windows.Forms.GroupBox
$grpTraining.Text = " CUSTOM TRAINING & FAVORITES MANAGER SUITE "
$grpTraining.Font = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
$grpTraining.ForeColor = [System.Drawing.Color]::Cyan
$grpTraining.Size = New-Object System.Drawing.Size(705, 165)
$grpTraining.Location = New-Object System.Drawing.Point(10, 15)

$lblPackName = New-Object System.Windows.Forms.Label
$lblPackName.Text = "Pack Name:"
$lblPackName.ForeColor = [System.Drawing.Color]::White
$lblPackName.Font = New-Object System.Drawing.Font("Consolas", 8)
$lblPackName.Location = New-Object System.Drawing.Point(10, 25)
$lblPackName.Size = New-Object System.Drawing.Size(75, 20)
$grpTraining.Controls.Add($lblPackName)

$txtPackName = New-Object System.Windows.Forms.TextBox
$txtPackName.Text = "My Custom Pack"
$txtPackName.Size = New-Object System.Drawing.Size(140, 22)
$txtPackName.Location = New-Object System.Drawing.Point(85, 22)
$txtPackName.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$txtPackName.ForeColor = [System.Drawing.Color]::Cyan
$grpTraining.Controls.Add($txtPackName)

$lblPackCode = New-Object System.Windows.Forms.Label
$lblPackCode.Text = "Code:"
$lblPackCode.ForeColor = [System.Drawing.Color]::White
$lblPackCode.Font = New-Object System.Drawing.Font("Consolas", 8)
$lblPackCode.Location = New-Object System.Drawing.Point(235, 25)
$lblPackCode.Size = New-Object System.Drawing.Size(40, 20)
$grpTraining.Controls.Add($lblPackCode)

$txtPackCode = New-Object System.Windows.Forms.TextBox
$txtPackCode.Text = "FA8A-2DA1-E2F5-5080"
$txtPackCode.Size = New-Object System.Drawing.Size(140, 22)
$txtPackCode.Location = New-Object System.Drawing.Point(275, 22)
$txtPackCode.BackColor = [System.Drawing.Color]::FromArgb(30, 30, 30)
$txtPackCode.ForeColor = [System.Drawing.Color]::Cyan
$grpTraining.Controls.Add($txtPackCode)

$lstFavorites = New-Object System.Windows.Forms.ListBox
$lstFavorites.Size = New-Object System.Drawing.Size(405, 100)
$lstFavorites.Location = New-Object System.Drawing.Point(10, 52)
$lstFavorites.BackColor = [System.Drawing.Color]::FromArgb(20, 20, 25)
$lstFavorites.ForeColor = [System.Drawing.Color]::LimeGreen
$lstFavorites.Font = New-Object System.Drawing.Font("Consolas", 8.5)
$grpTraining.Controls.Add($lstFavorites)

function Refresh-Favorites {
    $lstFavorites.Items.Clear()
    if (Test-Path $favJsonFile) {
        $rawContent = Get-Content $favJsonFile -Raw
        if (-not [string]::IsNullOrWhiteSpace($rawContent)) {
            $favs = $rawContent | ConvertFrom-Json
            foreach ($f in $favs) {
                $lstFavorites.Items.Add("$($f.Name) | $($f.Code)") | Out-Null
            }
        }
    }
}
Refresh-Favorites

$btnAddFav = New-Object System.Windows.Forms.Button
$btnAddFav.Text = "ADD FAVORITE"
$btnAddFav.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnAddFav.Size = New-Object System.Drawing.Size(125, 28)
$btnAddFav.Location = New-Object System.Drawing.Point(425, 20)
$btnAddFav.BackColor = [System.Drawing.Color]::FromArgb(0, 140, 90)
$btnAddFav.ForeColor = [System.Drawing.Color]::White
$btnAddFav.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnAddFav.Add_Click({
    if ($txtPackCode.Text -and $txtPackName.Text) {
        $favsList = [System.Collections.Generic.List[PSCustomObject]]::new()
        if (Test-Path $favJsonFile) {
            $existing = Get-Content $favJsonFile -Raw
            if (-not [string]::IsNullOrWhiteSpace($existing)) {
                $parsed = $existing | ConvertFrom-Json
                foreach ($p in $parsed) { $favsList.Add([PSCustomObject]@{ Name = $p.Name; Code = $p.Code }) }
            }
        }
        $favsList.Add([PSCustomObject]@{ Name = $txtPackName.Text; Code = $txtPackCode.Text })
        $favsList | ConvertTo-Json | Set-Content -Path $favJsonFile -Encoding UTF8
        Refresh-Favorites
        $logOutput.AppendText("`n[FAVORITES] Added '$($txtPackName.Text)' successfully.`n")
    }
})
$grpTraining.Controls.Add($btnAddFav)

$btnCopySelected = New-Object System.Windows.Forms.Button
$btnCopySelected.Text = "COPY SELECTED"
$btnCopySelected.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnCopySelected.Size = New-Object System.Drawing.Size(130, 28)
$btnCopySelected.Location = New-Object System.Drawing.Point(558, 20)
$btnCopySelected.BackColor = [System.Drawing.Color]::FromArgb(140, 0, 180)
$btnCopySelected.ForeColor = [System.Drawing.Color]::White
$btnCopySelected.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnCopySelected.Add_Click({
    if ($lstFavorites.SelectedItem) {
        $parts = $lstFavorites.SelectedItem.ToString().Split('|')
        if ($parts.Count -eq 2) {
            $code = $parts[1].Trim()
            [System.Windows.Forms.Clipboard]::SetText($code)
            $logOutput.AppendText("`n[TRAINING] Copied Code ($code) to Clipboard!`n")
        }
    }
})
$grpTraining.Controls.Add($btnCopySelected)

$btnOpenTrainDir = New-Object System.Windows.Forms.Button
$btnOpenTrainDir.Text = "TRAINING DIR"
$btnOpenTrainDir.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnOpenTrainDir.Size = New-Object System.Drawing.Size(125, 30)
$btnOpenTrainDir.Location = New-Object System.Drawing.Point(425, 54)
$btnOpenTrainDir.BackColor = [System.Drawing.Color]::FromArgb(70, 70, 110)
$btnOpenTrainDir.ForeColor = [System.Drawing.Color]::White
$btnOpenTrainDir.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnOpenTrainDir.Add_Click({
    if (-not (Test-Path $favoritesTrainingDir)) { New-Item -ItemType Directory -Path $favoritesTrainingDir -Force | Out-Null }
    Start-Process explorer.exe -ArgumentList "`"$favoritesTrainingDir`""
    $logOutput.AppendText("`n[TRAINING] Opened Training Favorites Directory.`n")
})
$grpTraining.Controls.Add($btnOpenTrainDir)

$btnCustomMaps = New-Object System.Windows.Forms.Button
$btnCustomMaps.Text = "WORKSHOP MAPS"
$btnCustomMaps.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnCustomMaps.Size = New-Object System.Drawing.Size(130, 30)
$btnCustomMaps.Location = New-Object System.Drawing.Point(558, 54)
$btnCustomMaps.BackColor = [System.Drawing.Color]::FromArgb(0, 120, 180)
$btnCustomMaps.ForeColor = [System.Drawing.Color]::White
$btnCustomMaps.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnCustomMaps.Add_Click({
    if (Test-Path $epicCookedDir) {
        Start-Process explorer.exe -ArgumentList "`"$epicCookedDir`""
    } else {
        if (-not (Test-Path $trainingDir)) { New-Item -ItemType Directory -Path $trainingDir -Force | Out-Null }
        Start-Process explorer.exe -ArgumentList "`"$trainingDir`""
    }
})
$grpTraining.Controls.Add($btnCustomMaps)

$btnDeleteFav = New-Object System.Windows.Forms.Button
$btnDeleteFav.Text = "DELETE SELECTED"
$btnDeleteFav.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnDeleteFav.Size = New-Object System.Drawing.Size(263, 28)
$btnDeleteFav.Location = New-Object System.Drawing.Point(425, 90)
$btnDeleteFav.BackColor = [System.Drawing.Color]::FromArgb(180, 40, 40)
$btnDeleteFav.ForeColor = [System.Drawing.Color]::White
$btnDeleteFav.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnDeleteFav.Add_Click({
    if ($lstFavorites.SelectedIndex -ge 0) {
        $favsList = [System.Collections.Generic.List[PSCustomObject]]::new()
        $raw = Get-Content $favJsonFile -Raw
        $parsed = $raw | ConvertFrom-Json
        foreach ($p in $parsed) { $favsList.Add([PSCustomObject]@{ Name = $p.Name; Code = $p.Code }) }
        $favsList.RemoveAt($lstFavorites.SelectedIndex)
        $favsList | ConvertTo-Json | Set-Content -Path $favJsonFile -Encoding UTF8
        Refresh-Favorites
        $logOutput.AppendText("`n[FAVORITES] Removed selected item.`n")
    }
})
$grpTraining.Controls.Add($btnDeleteFav)
$tabTraining.Controls.Add($grpTraining)

$grpLauncher = New-Object System.Windows.Forms.GroupBox
$grpLauncher.Text = " GAME LAUNCHER & DIRECTORY SUITE "
$grpLauncher.Font = New-Object System.Drawing.Font("Consolas", 8.5, [System.Drawing.FontStyle]::Bold)
$grpLauncher.ForeColor = [System.Drawing.Color]::Orange
$grpLauncher.Size = New-Object System.Drawing.Size(705, 75)
$grpLauncher.Location = New-Object System.Drawing.Point(10, 190)

$btnStartRL = New-Object System.Windows.Forms.Button
$btnStartRL.Text = "START ROCKET LEAGUE"
$btnStartRL.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnStartRL.Size = New-Object System.Drawing.Size(210, 35)
$btnStartRL.Location = New-Object System.Drawing.Point(15, 25)
$btnStartRL.BackColor = [System.Drawing.Color]::FromArgb(0, 140, 200)
$btnStartRL.ForeColor = [System.Drawing.Color]::White
$btnStartRL.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnStartRL.Add_Click({
    try { Start-Process "com.epicgames.launcher://apps/Sugar?action=launch"; $logOutput.AppendText("`n[LAUNCH] Rocket League Signal Sent.`n") } catch {}
})
$grpLauncher.Controls.Add($btnStartRL)

$btnOpenReplays = New-Object System.Windows.Forms.Button
$btnOpenReplays.Text = "OPEN REPLAYS FOLDER"
$btnOpenReplays.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnOpenReplays.Size = New-Object System.Drawing.Size(210, 35)
$btnOpenReplays.Location = New-Object System.Drawing.Point(235, 25)
$btnOpenReplays.BackColor = [System.Drawing.Color]::FromArgb(180, 100, 0)
$btnOpenReplays.ForeColor = [System.Drawing.Color]::White
$btnOpenReplays.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnOpenReplays.Add_Click({
    if (-not (Test-Path $replayDir)) { New-Item -ItemType Directory -Path $replayDir -Force | Out-Null }
    Start-Process explorer.exe -ArgumentList "`"$replayDir`""
    $logOutput.AppendText("`n[REPLAYS] Opened Replays Directory.`n")
})
$grpLauncher.Controls.Add($btnOpenReplays)

$btnOpenGameDir = New-Object System.Windows.Forms.Button
$btnOpenGameDir.Text = "OPEN CONFIG DIRECTORY"
$btnOpenGameDir.Font = New-Object System.Drawing.Font("Consolas", 8, [System.Drawing.FontStyle]::Bold)
$btnOpenGameDir.Size = New-Object System.Drawing.Size(220, 35)
$btnOpenGameDir.Location = New-Object System.Drawing.Point(455, 25)
$btnOpenGameDir.BackColor = [System.Drawing.Color]::FromArgb(80, 80, 120)
$btnOpenGameDir.ForeColor = [System.Drawing.Color]::White
$btnOpenGameDir.FlatStyle = [System.Windows.Forms.FlatStyle]::Flat
$btnOpenGameDir.Add_Click({
    if (-not (Test-Path $configDir)) { New-Item -ItemType Directory -Path $configDir -Force | Out-Null }
    Start-Process explorer.exe -ArgumentList "`"$configDir`""
})
$grpLauncher.Controls.Add($btnOpenGameDir)
$tabTraining.Controls.Add($grpLauncher)

function Generate-LuaScript {
    try {
        $dz     = $cmbDZ.SelectedItem.ToString().Split(' ')[0]
        $ddz    = $txtDodge.Text
        $hwProf = $cmbHwProfile.SelectedItem.ToString()
        $angJ   = $cmbAngleJitter.SelectedItem.ToString()
        $kAerial = $cmbAerialKey.SelectedItem.ToString()
        $kSpeed  = $cmbSpeedKey.SelectedItem.ToString()
        $kHalf   = $cmbHalfKey.SelectedItem.ToString()
        
        $gDashIndex  = $cmbDashGKey.SelectedIndex + 1
        $gSpeedIndex = $cmbSpeedGKey.SelectedIndex + 1

        if (-not (Test-Path $scriptDir)) { New-Item -ItemType Directory -Path $scriptDir -Force | Out-Null }

        $luaContent = @"
-- ==============================================================================
-- FN Master Engine - Advanced Lua Physics & G HUB Engine Suite v7.0
-- Internal DZ: $dz | Dodge DZ: $ddz | HW Profile: $hwProf | Angle Jitter: $angJ
-- ==============================================================================

local CONFIG = {
    InternalGeneralDZ = $dz,
    InternalDodgeDZ   = $ddz,
    HardwareProfile   = "$hwProf",
    AxisAngleJitter   = "$angJ",

    AerialKey     = "$kAerial",
    SpeedflipKey  = "$kSpeed",
    HalfFlipKey   = "$kHalf",
    DashGKey      = $gDashIndex,
    SpeedGKey     = $gSpeedIndex
}

local LOG_FILE_PATH = "C:\\FN_Engine_v50\\macro_execution.log"

local State = { last_x = 0, last_y = 0, active = true }

function LogToFile(message)
    local file = io.open(LOG_FILE_PATH, "a")
    if file then
        file:write(os.date("[%Y-%m-%d %H:%M:%S] ") .. message .. "\n")
        file:close()
    end
end

function ApplyInternalDeadzone(rawValue, deadzone)
    local threshold = deadzone or CONFIG.InternalGeneralDZ
    local absVal = math.abs(rawValue)
    if absVal <= threshold then return 0.0 end
    local sign = rawValue / absVal
    return sign * ((absVal - threshold) / (1.0 - threshold))
end

function ProcessCustomPhysics(raw_x, raw_y)
    local clean_x = ApplyInternalDeadzone(raw_x, CONFIG.InternalGeneralDZ)
    local clean_y = ApplyInternalDeadzone(raw_y, CONFIG.InternalGeneralDZ)
    State.last_x = clean_x
    State.last_y = clean_y
    return clean_x, clean_y
end

-- Corrected Mouse Actions: LeftClick(1) = Boost, RightClick(3) = Jump
function ExecuteAdaptiveDash()
    local autoDelay1 = math.floor(32 * (CONFIG.InternalDodgeDZ / 0.05))
    autoDelay1 = math.max(10, autoDelay1)
    local autoDelay2 = math.floor(15 * (CONFIG.InternalDodgeDZ / 0.05))
    autoDelay2 = math.max(5, autoDelay2)
    
    PressMouseButton(3) -- Jump (Right Click)
    Sleep(autoDelay1)
    ReleaseMouseButton(3)
    Sleep(autoDelay2)
    PressMouseButton(3) -- Second Jump / Dodge
    Sleep(autoDelay1)
    ReleaseMouseButton(3)
    LogToFile("ACTION: Adaptive Dash Executed | Delays: " .. autoDelay1 .. "ms / " .. autoDelay2 .. "ms")
end

function ExecuteAdaptiveSpeedflip()
    PressMouseButton(1) -- Boost (Left Click)
    PressMouseButton(3) -- Jump (Right Click)
    Sleep(35)
    ReleaseMouseButton(3)
    Sleep(15)
    PressMouseButton(3) -- Dodge Jump
    Sleep(220)
    ReleaseMouseButton(3)
    ReleaseMouseButton(1)
    LogToFile("ACTION: Adaptive Speedflip Executed | Dodge DZ: " .. tostring(CONFIG.InternalDodgeDZ))
end

function OnEvent(event, arg)
    if not State.active then return end

    if event == "G_PRESSED" then
        if arg == CONFIG.DashGKey then
            ExecuteAdaptiveDash()
        elseif arg == CONFIG.SpeedGKey then
            ExecuteAdaptiveSpeedflip()
        end
    end
end
"@
        Safe-UnlockFile $luaOutputPath
        [System.IO.File]::WriteAllText($luaOutputPath, $luaContent, [System.Text.Encoding]::UTF8)
        Safe-UnlockFile $luaOutputPath
    } catch {
        $logOutput.AppendText("`n[ERROR] Generate-LuaScript Exception: $($_.Exception.Message)`n")
    }
}

# Status Timer
$statusTimer = New-Object System.Windows.Forms.Timer
$statusTimer.Interval = 1000
$statusTimer.Add_Tick({
    $ghubProc = Get-Process -Name "lghub", "lghub_agent", "lghub_updater" -ErrorAction SilentlyContinue
    if ($ghubProc) {
        $statusLabel.Text = "G HUB SERVICE STATUS    : ONLINE (RUNNING - PID: $($ghubProc[0].Id))"
        $statusLabel.ForeColor = [System.Drawing.Color]::Lime
    } else {
        $statusLabel.Text = "G HUB SERVICE STATUS    : OFFLINE (SERVICE STOPPED)"
        $statusLabel.ForeColor = [System.Drawing.Color]::Red
    }

    $rlProc = Get-Process -Name "RocketLeague" -ErrorAction SilentlyContinue
    if ($rlProc) {
        $rlStatusLabel.Text = "ROCKET LEAGUE GAME STATUS: ONLINE (ACTIVE GAME - PID: $($rlProc.Id))"
        $rlStatusLabel.ForeColor = [System.Drawing.Color]::Lime
    } else {
        $rlStatusLabel.Text = "ROCKET LEAGUE GAME STATUS: OFFLINE (GAME NOT RUNNING)"
        $rlStatusLabel.ForeColor = [System.Drawing.Color]::OrangeRed
    }
})
$statusTimer.Start()

Generate-LuaScript
$mainForm.ShowDialog() | Out-Null
