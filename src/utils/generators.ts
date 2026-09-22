import { PhysicsConfig, KeyBindings, GKeyMapping } from '../types';

export function getGKeyIndex(gKeyName: string): number {
  if (gKeyName.startsWith('G1')) return 1;
  if (gKeyName.startsWith('G2')) return 2;
  if (gKeyName.startsWith('G3')) return 3;
  if (gKeyName.startsWith('G4')) return 4;
  if (gKeyName.startsWith('G5')) return 5;
  if (gKeyName.startsWith('G6')) return 6;
  return 1;
}

export function generateLuaScript(
  physics: PhysicsConfig,
  keys: KeyBindings,
  gkeys: GKeyMapping
): string {
  const dz = physics.internalDeadzone.split(' ')[0] || '0.07';
  const ddz = physics.dodgeDeadzone || '0.05';
  const hwProf = physics.hardwareProfile || 'KBM Esports Pro (Logitech G502X)';
  const angJ = physics.axisAngleJitter || '1.0 Deg (Pro)';
  const gDashIndex = getGKeyIndex(gkeys.dashGKey);
  const gSpeedIndex = getGKeyIndex(gkeys.speedGKey);

  return `-- ==============================================================================
-- FN Master Engine - Advanced Lua Physics & G HUB Engine Suite v7.0
-- Internal DZ: ${dz} | Dodge DZ: ${ddz} | HW Profile: ${hwProf} | Angle Jitter: ${angJ}
-- ==============================================================================

local CONFIG = {
    InternalGeneralDZ = ${dz},
    InternalDodgeDZ   = ${ddz},
    HardwareProfile   = "${hwProf}",
    AxisAngleJitter   = "${angJ}",

    AerialKey     = "${keys.aerialKey}",
    SpeedflipKey  = "${keys.speedflipKey}",
    HalfFlipKey   = "${keys.halfFlipKey}",
    DashGKey      = ${gDashIndex},
    SpeedGKey     = ${gSpeedIndex}
}

local LOG_FILE_PATH = "C:\\\\FN_Engine_v50\\\\macro_execution.log"

local State = { last_x = 0, last_y = 0, active = true }

function LogToFile(message)
    local file = io.open(LOG_FILE_PATH, "a")
    if file then
        file:write(os.date("[%Y-%m-%d %H:%M:%S] ") .. message .. "\\n")
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
`;
}

export function generateTAInputIni(dodgeDeadzone: string = '0.05'): string {
  return `[TAGame.PlayerInput_TA]
KeyboardAxisBlendTime=0.000000
MouseSensitivity=1.000000
ControllerDeadzone=0.070000
DodgeDeadzone=${dodgeDeadzone}
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
`;
}

export function downloadFile(content: string, fileName: string, contentType: string = 'text/plain') {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
