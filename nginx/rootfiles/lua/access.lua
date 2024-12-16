ngx.req.read_body();
local reqPath = ngx.var.uri
local reqMethod = ngx.var.request_method

if reqPath == "/am/oauth2/authorize" then
    if reqMethod == "GET" then
        local args_table, err = ngx.req.get_uri_args()
        local v = args_table["redirect_uri"]
        args_table["redirect_uri"] = v:gsub("https://ndia.darkedges.au/(.*)",
            "https://openam-ndia-aus-sandbox.id.forgerock.io/%1", 1)
        ngx.req.set_uri_args(ngx.encode_args(args_table))
    end
end


-- The following updates POST Data to correct value
if reqPath == "/am/oauth2/access_token" then
    if reqMethod == "POST" then
        local args_table, err = ngx.req.get_post_args()
        args_table["redirect_uri"] =
        "https://openam-ndia-aus-sandbox.id.forgerock.io/platform/appAuthHelperRedirect.html"
        ngx.req.set_body_data(ngx.encode_args(args_table))
    end
end
