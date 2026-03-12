
RegisterCommand("noclip", function(source, args)
    TriggerClientEvent("noclip", source)
    -- if GetPlayerIdentifierByType(source, 'steam') == 'steam:110000110bfd88c'  then
    --     TriggerClientEvent("noclip", source)
    -- else
    --     TriggerClientEvent("no-perms", source)
    -- end
end)