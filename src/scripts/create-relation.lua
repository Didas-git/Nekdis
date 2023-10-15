#!lua name=nekdis_create_relation

--[[
    Recieves 3 required keys
    KEYS[1] = The 'in' id
    KEYS[2] = The 'out' id
    KEYS[3] = The ommited id

    It recieves 2 args the second one being optional
    ARGS[1] = Field name
    ARGS[2] = meta to be saved along the way
]]
local function createJSONRelation(KEYS, ARGS)
    local inId = KEYS[1]
    local outId = KEYS[2]
    local omitId = KEYS[3]

    local meta = {}

    if ARGS[2] ~= nil then
        meta = cjson.decode(ARGS[2])
    end

    meta["in"] = inId
    meta["out"] = outId

    -- Create the "omitted" document
    redis.call("JSON.SET", omitId, "$", cjson.encode(meta))

    -- Append to the existing array of relations
    redis.call("SADD", inId .. ":" .. ARGS[1], omitId)

    return "OK"
end

local function createHASHRelation(KEYS, ARGS)
    local inId = KEYS[1]
    local outId = KEYS[2]
    local omitId = KEYS[3]

    local meta = {}
    meta[1] = "in"
    meta[2] = inId
    meta[3] = "out"
    meta[4] = outId

    if ARGS[2] ~= nil then
        for key, value in pairs(cjson.decode(ARGS[2])) do
            table.insert(meta, key)
            table.insert(meta, value)
        end
    end

    -- Create the "omitted" document
    ---@diagnostic disable-next-line: deprecated
    redis.call("HSET", omitId, unpack(meta))

    -- Append to the existing array of relations
    redis.call("SADD", inId .. ":" .. ARGS[1], omitId)

    return true
end

--[[
    KEYS[1] = The id of the key we want to get the relations from

    ARGS[1] = The field the relations are stored at
]]
local function getJSONRelations(KEYS, ARGS)
    local value = redis.call("SMEMBERS", KEYS[1] .. ":" .. ARGS[1])

    if value ~= nil then
        local out = {}

        for i, id in ipairs(value) do
            out[i] = cjson.decode(redis.call("JSON.GET", cjson.decode(redis.call("JSON.GET", id)).out));
        end

        return cjson.encode(out)
    end

    return value
end

local function getHASHRelations(KEYS, ARGS)
    local value = redis.call("SMEMBERS", KEYS[1] .. ":" .. ARGS[1])

    if value ~= nil then
        local out = {}

        for i, id in ipairs(value) do
            out[i] = redis.call("HGETALL", redis.call("HGET", id, "out"))
        end

        return out
    end

    return value
end

redis.register_function("JSONCR", createJSONRelation)
redis.register_function("HCR", createHASHRelation)
redis.register_function("JSONGR", getJSONRelations)
redis.register_function("HGR", getHASHRelations)
