local url = require "net.url"
local reqPath = ngx.var.uri
local reqMethod = ngx.var.request_method
ngx.header.content_length = nil

-- Check for Set-Cookie and rewrite
local cookies = ngx.resp.get_headers()["Set-Cookie"]
if (cookies) then
    for i, cookie in ipairs(cookies) do
        cookies[i] = cookie:gsub("Domain=[%w-.]*;", "Domain=ndia.darkedges.au;", 1)
    end
    ngx.header["Set-Cookie"] = cookies
end
-- Check to see if we need to rewrite Location Information
if reqPath == "/am/oauth2/authorize" then
    if reqMethod == "GET" then
        local h = ngx.resp.get_headers()["Location"]
        if h or string.len(h) > 0 then
            local l = url.parse(h)
            if l.host == "openam-ndia-aus-sandbox.id.forgerock.io" then
                l.host = "ndia.darkedges.au"
            end
            if l.query.iss then
                l.query.iss = l.query.iss:gsub("https://[%w-.]*:443/(.*)", "https://ndia.darkedges.au:443/%1", 1)
            end
            if l.query["goto"] then
                l.query["goto"] = l.query["goto"]:gsub("https://[%w-.]*:443/(.*)", "https://ndia.darkedges.au:443/%1", 1)
            end
            ngx.header["Location"] = "" .. l
        end
    end
end
