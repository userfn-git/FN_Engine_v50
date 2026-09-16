
# Logitech G HUB Lua API Reference (V2023.5)

This document provides a concise reference for the Logitech G HUB Lua API, version 2023.5. It's designed for quick lookups of function specifications and usage examples.

## Core Functions

### `OnEvent`

Handles script events. You must implement this function.

**Specification:**

```lua
function OnEvent(event, arg [family])
end
```

**Parameters:**

*   **`event`** (string): The event identifier.
*   **`arg`** (varies): Argument related to the event.
*   **`family`** (string, optional): Device family ("kb", "lhc", "mouse").

**Events:**

| Event                     | `arg`             | `family` | Description                                                                                           |
| :------------------------ | :---------------- | :------- | :---------------------------------------------------------------------------------------------------- |
| `"PROFILE_ACTIVATED"`     | `nil`             |          | Profile activated. This is the first event seen.                                                    |
| `"PROFILE_DEACTIVATED"`  | `nil`             |          | Profile deactivated. This is the last event seen.                                                     |
| `"G_PRESSED"`             | 1-18 (G1-G18)     |          | G Key pressed.                                                                                     |
| `"G_RELEASED"`            | 1-18 (G1-G18)     |          | G Key released.                                                                                    |
| `"M_PRESSED"`             | 1-3 (M1-M3)       |          | M Key pressed.                                                                                     |
| `"M_RELEASED"`            | 1-3 (M1-M3)       |          | M Key released.                                                                                    |
| `"MOUSE_BUTTON_PRESSED"`  | 2+                | "mouse"  | Mouse button pressed (except left by default, see `EnablePrimaryMouseButtonEvents`).                |
| `"MOUSE_BUTTON_RELEASED"` | 2+                | "mouse"  | Mouse button released (except left by default, see `EnablePrimaryMouseButtonEvents`).               |

**Example:**

```lua
function OnEvent(event, arg, family)
    if event == "PROFILE_ACTIVATED" then
        OutputLogMessage("Profile activated\n")
    elseif event == "G_PRESSED" and arg == 1 then
        OutputLogMessage("G1 key pressed\n")
    end
end
```

### `GetMKeyState`

Gets the current state of the M keys.

**Specification:**

```lua
mkey = GetMKeyState([family])
```

**Parameters:**

*   **`family`** (string, optional): Device family ("kb", "lhc"). Default is "kb".

**Return Value:**

*   **`mkey`** (number): 1 (M1), 2 (M2), or 3 (M3).

**Example:**

```lua
local currentMKey = GetMKeyState()
OutputLogMessage("Current M key state: %d\n", currentMKey)
```

### `SetMKeyState`

Sets the current state of the M keys.

**Specification:**

```lua
SetMKeyState(mkey, [family])
```

**Parameters:**

*   **`mkey`** (number): 1 (M1), 2 (M2), or 3 (M3).
*   **`family`** (string, optional): Device family ("kb", "lhc"). Default is "kb".

**Example:**

```lua
function OnEvent(event, arg)
    if event == "G_PRESSED" and arg == 1 then
        SetMKeyState(1) -- Set M key state to M1
    end
end
```

### `Sleep`

Pauses the script for a specified duration.

**Specification:**

```lua
Sleep(timeout)
```

**Parameters:**

*   **`timeout`** (number): Time to sleep in milliseconds.

**Example:**

```lua
Sleep(100)  -- Pause for 100 milliseconds
```

### `OutputLogMessage`

Sends a formatted message to the script editor's console.

**Specification:**

```lua
OutputLogMessage(...)
```

**Parameters:**

*   **`...`** (string): `printf`-style formatted string and arguments.

**Example:**

```lua
OutputLogMessage("Hello, world! This is a number: %d\n", 42)
```

### `GetRunningTime`

Returns the script's running time in milliseconds.

**Specification:**

```lua
elapsed = GetRunningTime()
```

**Return Value:**

*   **`elapsed`** (number): Elapsed time in milliseconds.

**Example:**

```lua
local runningTime = GetRunningTime()
OutputLogMessage("Script has been running for %d ms\n", runningTime)
```

### `GetDate`

Retrieves the formatted date and time.

**Specification:**

```lua
date = GetDate([format [, time]])
```

**Parameters:**

*   **`format`** (string, optional): Date format string (strftime style). "\*t" for table format.
*   **`time`** (table, optional): Time table.

**Return Value:**

*   **`date`** (string or table): Formatted date/time.

**Example:**

```lua
local today = GetDate("%Y-%m-%d %H:%M:%S")
OutputLogMessage("Today's date and time: %s\n", today)
```

### `ClearLog`

Clears the script editor's output window.

**Specification:**

```lua
ClearLog()
```

**Example:**

```lua
ClearLog()
```

## Keyboard Functions

### `PressKey`

Simulates a keyboard key press.

**Specification:**

```lua
PressKey(scancode [, scancode ...])
PressKey(keyname [, keyname ...])
```

**Parameters:**

*   **`scancode`** (number): Numerical scancode of the key.
*   **`keyname`** (string): Predefined keyname. (See Appendix A in the documentation for a complete list of scancodes and keynames.)

**Example:**

```lua
PressKey("a")      -- Press the "a" key
PressKey(30)       -- Press the key with scancode 30 ("a")
PressKey("shift", "a") -- Press Shift and "a" together
```

### `ReleaseKey`

Simulates a keyboard key release.

**Specification:**

```lua
ReleaseKey(scancode [, scancode ...])
ReleaseKey(keyname [, keyname ...])
```

**Parameters:**

*   **`scancode`** (number): Numerical scancode of the key.
*   **`keyname`** (string): Predefined keyname.

**Example:**

```lua
ReleaseKey("a")    -- Release the "a" key
ReleaseKey(30)     -- Release the key with scancode 30
```

### `PressAndReleaseKey`

Simulates a keyboard key press followed by a release.

**Specification:**

```lua
PressAndReleaseKey(scancode [, scancode ...])
PressAndReleaseKey(keyname [, keyname ...])
```

**Parameters:**

*   **`scancode`** (number): Numerical scancode of the key.
*   **`keyname`** (string): Predefined keyname.

**Example:**

```lua
PressAndReleaseKey("a") -- Press and release "a"
```

### `IsModifierPressed`

Checks if a modifier key (Alt, Shift, Ctrl) is pressed.

**Specification:**

```lua
boolean = IsModifierPressed(keyname)
```

**Parameters:**

*   **`keyname`** (string): "lalt", "ralt", "alt", "lshift", "rshift", "shift", "lctrl", "rctrl", "ctrl".

**Return Value:**

*   **`boolean`** (boolean): `true` if pressed, `false` otherwise.

**Example:**

```lua
if IsModifierPressed("shift") then
    OutputLogMessage("Shift key is pressed\n")
end
```

### `IsKeyLockOn`

Checks if a lock key (Scroll Lock, Caps Lock, Num Lock) is enabled.

**Specification:**

```lua
boolean = IsKeyLockOn(keyname)
```

**Parameters:**

*   **`keyname`** (string): "scrolllock", "capslock", "numlock".

**Return Value:**

*   **`boolean`** (boolean): `true` if enabled, `false` otherwise.

**Example:**

```lua
if IsKeyLockOn("numlock") then
    PressAndReleaseKey("numlock") -- Turn off Num Lock
end
```

## Mouse Functions

### `PressMouseButton`

Simulates a mouse button press.

**Specification:**

```lua
PressMouseButton(button)
```

**Parameters:**

*   **`button`** (number): 1 (Left), 2 (Middle), 3 (Right), 4 (X1), 5 (X2).

**Example:**

```lua
PressMouseButton(1) -- Press the left mouse button
```

### `ReleaseMouseButton`

Simulates a mouse button release.

**Specification:**

```lua
ReleaseMouseButton(button)
```

**Parameters:**

*   **`button`** (number): 1 (Left), 2 (Middle), 3 (Right), 4 (X1), 5 (X2).

**Example:**

```lua
ReleaseMouseButton(1) -- Release the left mouse button
```

### `PressAndReleaseMouseButton`

Simulates a mouse button press followed by a release.

**Specification:**

```lua
PressAndReleaseMouseButton(button)
```

**Parameters:**

*   **`button`** (number): 1 (Left), 2 (Middle), 3 (Right), 4 (X1), 5 (X2).

**Example:**

```lua
PressAndReleaseMouseButton(1) -- Click the left mouse button
```

### `IsMouseButtonPressed`

Checks if a mouse button is pressed.

**Specification:**

```lua
boolean = IsMouseButtonPressed(button)
```

**Parameters:**

*   **`button`** (number): 1 (Left), 2 (Middle), 3 (Right), 4 (X1), 5 (X2).

**Return Value:**

*   **`boolean`** (boolean): `true` if pressed, `false` otherwise.

**Example:**

```lua
if IsMouseButtonPressed(3) then
    OutputLogMessage("Right mouse button is pressed\n")
end
```

### `MoveMouseTo`

Moves the mouse cursor to an absolute screen position.

**Specification:**

```lua
MoveMouseTo(x, y)
```

**Parameters:**

*   **`x`** (number): Normalized X coordinate (0-65535).
*   **`y`** (number): Normalized Y coordinate (0-65535).

**Example:**

```lua
MoveMouseTo(0, 0) -- Move to top-left corner
```

### `MoveMouseWheel`

Simulates mouse wheel movement.

**Specification:**

```lua
MoveMouseWheel(clicks)
```

**Parameters:**

*   **`clicks`** (number): Number of clicks (positive for up, negative for down).

**Example:**

```lua
MoveMouseWheel(3)  -- Scroll up 3 clicks
MoveMouseWheel(-1) -- Scroll down 1 click
```

### `MoveMouseRelative`

Moves the mouse cursor relative to its current position.

**Specification:**

```lua
MoveMouseRelative(x, y)
```

**Parameters:**

*   **`x`** (number): X-axis movement (positive for right, negative for left).
*   **`y`** (number): Y-axis movement (positive for down, negative for up).

**Example:**

```lua
MoveMouseRelative(10, -5) -- Move 10 pixels right and 5 pixels up
```

### `MoveMouseToVirtual`

Moves the mouse cursor to an absolute position on a multi-monitor setup.

**Specification:**

```lua
MoveMouseToVirtual(x, y)
```

**Parameters:**

*   **`x`** (number): Normalized X coordinate (0-65535).
*   **`y`** (number): Normalized Y coordinate (0-65535).

**Example:**

```lua
MoveMouseToVirtual(32767, 32767) -- Move to the center of the virtual desktop
```

### `GetMousePosition`

Gets the current normalized mouse cursor position.

**Specification:**

```lua
x, y = GetMousePosition()
```

**Return Values:**

*   **`x`** (number): Normalized X coordinate (0-65535).
*   **`y`** (number): Normalized Y coordinate (0-65535).

**Example:**

```lua
local x, y = GetMousePosition()
OutputLogMessage("Mouse position: x=%d, y=%d\n", x, y)
```

### `SetMouseDPITable`

**Not implemented in G HUB.** Sets the DPI table for a gaming mouse.

**Specification:**

```lua
SetMouseDPITable({value1, value2, ...}, [index])
```

**Parameters:**

*   **`{value1, value2, ...}`** (table): Array of DPI values.
*   **`index`** (number, optional): 1-based index to set as current DPI.

### `SetMouseDPITableIndex`

**Not implemented in G HUB.** Sets the current DPI table index.

**Specification:**

```lua
SetMouseDPITableIndex(index)
```

**Parameters:**

*   **`index`** (number): 1-based index into the DPI table.

### `EnablePrimaryMouseButtonEvents`

Enables or disables event reporting for the primary (left) mouse button.

**Specification:**

```lua
EnablePrimaryMouseButtonEvents(enable)
```

**Parameters:**

*   **`enable`** (boolean): `true` to enable, `false` to disable.

**Example:**

```lua
EnablePrimaryMouseButtonEvents(true) -- Enable left mouse button events
```

## LCD Functions (G15, G19, etc.)

**Note:** These functions are not implemented in G HUB.

### `OutputLCDMessage`

Adds a line of text to the LCD.

**Specification:**

```lua
OutputLCDMessage(text [, timeout])
```

**Parameters:**

*   **`text`** (string): Text to display.
*   **`timeout`** (number, optional): Timeout in milliseconds (default 1000).

### `ClearLCD`

Clears the LCD.

**Specification:**

```lua
ClearLCD()
```

## Macro Functions

### `PlayMacro`

Plays an existing macro.

**Specification:**

```lua
PlayMacro(macroname)
```

**Parameters:**

*   **`macroname`** (string): Name of the macro.

**Example:**

```lua
PlayMacro("my_macro")
```

### `PressMacro`

Plays a macro by simulating a key press down.

**Specification:**

```lua
PressMacro(macroname)
```

**Parameters:**

*   **`macroname`** (string): Name of the macro.

**Example:**

```lua
PressMacro("my_macro")
```

### `ReleaseMacro`

Plays a macro by simulating a key release.

**Specification:**

```lua
ReleaseMacro(macroname)
```

**Parameters:**

*   **`macroname`** (string): Name of the macro.

**Example:**

```lua
ReleaseMacro("my_macro")
```

### `AbortMacro`

Aborts a currently playing macro started from a script.

**Specification:**

```lua
AbortMacro()
```

**Example:**

```lua
PlayMacro("my_macro")
Sleep(100)
AbortMacro()
```

## Device-Specific Functions

### `SetBacklightColor`

**Not implemented in G HUB.** Sets the backlight color for supported devices.

**Specification:**

```lua
SetBacklightColor(red, green, blue, [family])
```

**Parameters:**

*   **`red`** (number): Red intensity (0-255).
*   **`green`** (number): Green intensity (0-255).
*   **`blue`** (number): Blue intensity (0-255).
*   **`family`** (string, optional): "kb", "lhc".

### `SetSteeringWheelProperty`

**Not implemented in G HUB.** Sets properties for steering wheel devices (G29, G920).

**Specification:**

```lua
SetSteeringWheelProperty(device, property, value)
```

**Parameters:**

*   **`device`** (string): "G29" or "G920".
*   **`property`** (string): "operatingRange", "combinedPedals", "defaultCenteringSpring", "defaultCenteringSpringStrength".
*   **`value`** (number or boolean): Property value.

## G13-Specific Functions

**Note:** These functions are not implemented in G HUB.

### `SetMouseSpeed`

Sets the analog joystick mouse speed on the G13.

**Specification:**

```lua
SetMouseSpeed(speed)
```

**Parameters:**

*   **`speed`** (number): Absolute mouse speed (32-255).

### `GetMouseSpeed`

Gets the current analog joystick mouse speed on the G13.

**Specification:**

```lua
speed = GetMouseSpeed()
```

**Return Value:**

*   **`speed`** (number): Current mouse speed.

### `IncrementMouseSpeed`

Increases the analog joystick mouse speed.

**Specification:**

```lua
IncrementMouseSpeed(increment)
```

**Parameters:**

*   **`increment`** (number): Increment value.

### `DecrementMouseSpeed`

Decreases the analog joystick mouse speed.

**Specification:**

```lua
DecrementMouseSpeed(decrement)
```

**Parameters:**

*   **`decrement`** (number): Decrement value.

## Debugging

### `OutputDebugMessage`

Sends a message to the Windows debugger.

**Specification:**

```lua
OutputDebugMessage(...)
```

**Parameters:**

*   **`...`** (string): `printf`-style formatted string and arguments.

**Example:**

```lua
OutputDebugMessage("This is a debug message: %d\n", 123)
```

## Standard Lua 5.4 Libraries

The following standard Lua 5.4 libraries are supported. For detailed information, refer to the Lua 5.4 documentation:

### Math functions (`math.*`)
### String functions (`string.*`)
### Table functions (`table.*`)

