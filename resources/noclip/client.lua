CyberMP.SetInstanceToGame()

freefly = {
    runtimeData = {
        inMenu = false,
        inGame = false,
        cetOpen = false,
        active = false
    },
    settings = {},
    defaultSettings = {
		speed = 2,
		speedIncrementStep = 0.2,
		angle = 0,
		noWeapon = true,
        timeStop = false,
        noController = false
    },
    logic = {
        lastReload = 0,
        lastSprint = 0,
        lastToggled = 0,
        time = 0,
    
        analogForward = 0,
        analogBackwards = 0,
        analogRight = 0,
        analogLeft = 0,
        analogUp = 0,
        analogDown = 0,
    
        yaw = 0
    }
}

function deepcopy(origin)
	local orig_type = type(origin)
    local copy
    if orig_type == 'table' then
        copy = {}
        for origin_key, origin_value in next, origin, nil do
            copy[deepcopy(origin_key)] = deepcopy(origin_value)
        end
        setmetatable(copy, deepcopy(getmetatable(origin)))
    else
        copy = origin
    end
    return copy
end

function tryNoWeapon(freefly, state)
    if freefly.defaultSettings.noWeapon and state then
        applyStatus("GameplayRestriction.NoCombat")
    else
        removeStatus("GameplayRestriction.NoCombat")
    end
end

function applyStatus(effect)
    Game.GetStatusEffectSystem():ApplyStatusEffect(GetPlayer():GetEntityID(), effect, GetPlayer():GetRecordID(), GetPlayer():GetEntityID())
end

function removeStatus(effect)
    Game.GetStatusEffectSystem():RemoveStatusEffect(GetPlayer():GetEntityID(), effect)
end

function registerInput(this)
    this:UnregisterInputListener(this, 'Forward')
    this:UnregisterInputListener(this, 'Back')
    this:UnregisterInputListener(this, 'Right')
    this:UnregisterInputListener(this, 'Left')
    this:UnregisterInputListener(this, 'ToggleSprint')
    this:UnregisterInputListener(this, 'Jump')
    this:UnregisterInputListener(this, 'ChoiceScrollUp')
    this:UnregisterInputListener(this, 'ChoiceScrollDown')
    this:UnregisterInputListener(this, 'Ping')
    this:UnregisterInputListener(this, 'context_help')

    this:RegisterInputListener(this, 'Forward')
    this:RegisterInputListener(this, 'Back')
    this:RegisterInputListener(this, 'Right')
    this:RegisterInputListener(this, 'Left')
    this:RegisterInputListener(this, 'ToggleSprint')
    this:RegisterInputListener(this, 'Jump')
    this:RegisterInputListener(this, 'ChoiceScrollUp')
    this:RegisterInputListener(this, 'ChoiceScrollDown')
    this:RegisterInputListener(this, 'Ping')
    this:RegisterInputListener(this, 'context_help')
end

function registerObservers(mod)
    ObserveRaw('PlayerPuppet', 'OnGameAttached', function(this)
            registerInput(this)
    end)

    ObserveRaw('PlayerPuppet', 'OnAction', function(this, action)
        this.isAimingAtChild = false
        this.isAimingAtFriendly = false
            local actionName = Game.NameToString(action:GetName(action))
            local actionType = action:GetType(action).value

            if actionName == "MoveX" then -- Controller movement
                local x = action:GetValue(action)
                if x < 0 then
                    mod.logic.analogRight = 0
                    mod.logic.analogLeft = -x
                else
                    mod.logic.analogRight = x
                    mod.logic.analogLeft = 0
                end
                if x == 0 then
                    mod.logic.analogRight = 0
                    mod.logic.analogLeft = 0
                end
            elseif actionName == "MoveY" then
                local x = action:GetValue(action)
                if x < 0 then
                    mod.logic.analogForward = 0
                    mod.logic.analogBackwards = -x
                else
                    mod.logic.analogForward = x
                    mod.logic.analogBackwards = 0
                end
                if x == 0 then
                    mod.logic.analogForward = 0
                    mod.logic.analogBackwards = 0
                end
            elseif actionName == "right_trigger" and actionType == "AXIS_CHANGE" then
                local z = action:GetValue(action)
                if z == 0 then
                    mod.logic.analogUp = 0
                else
                    mod.logic.analogUp = z
                end
            elseif actionName == "left_trigger" and actionType == "AXIS_CHANGE" then
                local z = action:GetValue(action)
                if z == 0 then
                    mod.logic.analogDown = 0
                else
                    mod.logic.analogDown = z
                end
            end

            if actionName == 'Forward' then
                if actionType == 'BUTTON_PRESSED' then
                    mod.logic.analogForward = 1
                elseif actionType == 'BUTTON_RELEASED' then
                    mod.logic.analogForward = 0
                end
            elseif actionName == 'Back' then
                if actionType == 'BUTTON_PRESSED' then
                    mod.logic.analogBackwards = 1
                elseif actionType == 'BUTTON_RELEASED' then
                    mod.logic.analogBackwards = 0
                end
            elseif actionName == 'Right' then
                if actionType == 'BUTTON_PRESSED' then
                    mod.logic.analogRight = 1
                elseif actionType == 'BUTTON_RELEASED' then
                    mod.logic.analogRight = 0
                end
            elseif actionName == 'Left' then
                if actionType == 'BUTTON_PRESSED' then
                    mod.logic.analogLeft = 1
                elseif actionType == 'BUTTON_RELEASED' then
                    mod.logic.analogLeft = 0
                end
            elseif actionName == 'ToggleSprint' and mod.logic.time - mod.logic.lastToggled > 0.2 then
                if actionType == 'BUTTON_PRESSED' then
                    mod.logic.analogDown = 1
                elseif actionType == 'BUTTON_RELEASED' then
                    mod.logic.analogDown = 0
                end
            elseif actionName == 'Jump' then
                if actionType == 'BUTTON_PRESSED' or actionType == 'BUTTON_HOLD_COMPLETE' then
                    mod.logic.analogUp = 1
                elseif actionType == 'BUTTON_RELEASED' then
                    mod.logic.analogUp = 0
                end
            elseif actionName == 'NextWeapon' then
                if actionType == 'BUTTON_PRESSED'then
                    if mod.runtimeData.active then
                            mod.defaultSettings.speed = mod.defaultSettings.speed + mod.defaultSettings.speedIncrementStep
                    end
                    if mod.defaultSettings.speed < 0 then
                            mod.defaultSettings.speed = 0
                    end
                end
            elseif actionName == 'PreviousWeapon' then
                if actionType == 'BUTTON_PRESSED'then
                    if mod.runtimeData.active then
                            mod.defaultSettings.speed = mod.defaultSettings.speed - mod.defaultSettings.speedIncrementStep
                    end
                    if mod.defaultSettings.speed < 0 then
                            mod.defaultSettings.speed = 0
                    end
                end
            elseif actionName == 'context_help' then
                if actionType == 'BUTTON_PRESSED'then
                    if freefly.defaultSettings.noController then return end
                    mod.logic.lastSprint = mod.logic.time
                    if mod.logic.lastSprint - mod.logic.lastReload < 0.2 and mod.logic.time - mod.logic.lastToggled ~= 0 then
                            mod.runtimeData.active = not mod.runtimeData.active
                            toggleFlight(mod, mod.runtimeData.active)
                            mod.logic.lastToggled = mod.logic.time
                    end
                end
            elseif actionName == 'one_click_confirm' then
                if actionType == 'BUTTON_PRESSED'then
                    if freefly.defaultSettings.noController then return end
                    mod.logic.lastReload = mod.logic.time
                    if mod.logic.lastReload - mod.logic.lastSprint < 0.2 and mod.logic.time - mod.logic.lastToggled ~= 0 then
                            mod.runtimeData.active = not mod.runtimeData.active
                            toggleFlight(mod, mod.runtimeData.active)
                            mod.logic.lastToggled = mod.logic.time
                    end
                end
            end

            if actionName == "CameraMouseX" then
            local x = action:GetValue(action)
                    local sens = Game.GetSettingsSystem():GetVar("/controls/fppcameramouse", "FPP_MouseX"):GetValue() / 2.9
                    mod.logic.yaw = - (x / 35) * sens
            end
            if actionName == "right_stick_x" then
            local x = action:GetValue(action)
                    local sens = Game.GetSettingsSystem():GetVar("/controls/fppcamerapad", "FPP_PadX"):GetValue() / 10
                    mod.logic.yaw = - x * 1.7 * sens
            end
    end)
end

function toggleFlight(mod, state)
    if state then
        applyStatus("GameplayRestriction.NoZooming")
        applyStatus("GameplayRestriction.NoMovement")
    elseif not state then
        removeStatus("GameplayRestriction.NoZooming")
        removeStatus("GameplayRestriction.NoMovement")
    end
end

function fly(mod, dt)
    local newPos = GetPlayer():GetWorldPosition()

    newPos = calculateNewPos("forward", newPos, mod.defaultSettings.speed * dt * 15)
    newPos = calculateNewPos("backwards", newPos, mod.defaultSettings.speed * dt * 15)
    newPos = calculateNewPos("right", newPos, mod.defaultSettings.speed * dt * 15)
    newPos = calculateNewPos("left", newPos, mod.defaultSettings.speed * dt * 15)
    newPos = calculateNewPos("up", newPos, mod.defaultSettings.speed * dt * 15)
    newPos = calculateNewPos("down", newPos, mod.defaultSettings.speed * dt * 15)

    local angle = mod.defaultSettings.angle

    if GetPlayer():GetMountedVehicle() then return end
    Game.GetTeleportationFacility():Teleport(GetPlayer(), newPos , EulerAngles.new(0, 0, GetPlayer():GetWorldYaw() + angle + mod.logic.yaw))

    Game.GetStatPoolsSystem():RequestSettingStatPoolValue(GetPlayer():GetEntityID(), gamedataStatPoolType.Health, 100, nil)
end

function calculateNewPos(direction, newPos, speed)
    if direction == "forward" then
            speed = speed * freefly.logic.analogForward
    elseif direction == "backwards" then
            speed = speed * freefly.logic.analogBackwards
    elseif direction == "right" then
            speed = speed * freefly.logic.analogRight
    elseif direction == "left" then
            speed = speed * freefly.logic.analogLeft
    elseif direction == "up" then
            speed = speed * freefly.logic.analogUp
    elseif direction == "down" then
            speed = speed * freefly.logic.analogDown
    end

    local vec
    if direction == "forward" or direction == "backwards" then
            vec = Game.GetCameraSystem():GetActiveCameraForward()
    elseif direction == "right" or direction == "left" then
            vec = Game.GetCameraSystem():GetActiveCameraRight()
    end
    if direction == "forward" or direction == "right" then
            newPos.x = newPos.x + (vec.x * speed)
            newPos.y = newPos.y + (vec.y * speed)
            newPos.z = newPos.z + (vec.z * speed)
    elseif direction == "backwards" or direction == "left" then
            newPos.x = newPos.x - (vec.x * speed)
            newPos.y = newPos.y - (vec.y * speed)
            newPos.z = newPos.z - (vec.z * speed)
    elseif direction == "up" then
            newPos.z = newPos.z + (0.7 * speed)
    elseif direction == "down" then
            newPos.z = newPos.z - (0.7 * speed)
    end

    return newPos
end


registerForEvent("onInit", function()

    registerObservers(freefly)

    Override("ZoomEventsTransition", "OnEnter", function (_, context, interface, wrapped)
        if freefly.runtimeData.active then return end
        wrapped(context, interface)
    end)
end)

registerForEvent("onUpdate", function(dt)
    local deltaTime = dt
    if not freefly.runtimeData.inMenu and freefly.runtimeData.inGame and freefly.runtimeData.active then
        fly(freefly, deltaTime)
    end
    freefly.logic.time = freefly.logic.time + deltaTime
end)

registerForEvent("onGameLoaded", function()
    freefly.runtimeData.inGame = true
    registerInput(GetPlayer())
end)

RegisterNetEvent('noclip')
AddEventHandler('noclip', function(res)
    if not freefly.runtimeData.active then
        freefly.runtimeData.active = true
        toggleFlight(freefly, freefly.runtimeData.active)
    elseif freefly.runtimeData.active then
        freefly.runtimeData.active = false
        toggleFlight(freefly, freefly.runtimeData.active)
    end
end)

RegisterCommand("noclip-speed", function(source, args)
    freefly.defaultSettings.speed = tonumber(args[1] + 0.0)
end)

-- only for test
registerForEvent('onInputKeyEvent', function(action, key)
    if IsOnGameLoadedCalled() then
        if key == EnumInt(EInputKey.IK_F1) and action == EnumInt(EInputAction.IACT_Press) then
            if not freefly.runtimeData.active then
                freefly.runtimeData.active = true
                toggleFlight(freefly, freefly.runtimeData.active)
            elseif freefly.runtimeData.active then
                freefly.runtimeData.active = false
                toggleFlight(freefly, freefly.runtimeData.active)
            end
        end
    end
end)