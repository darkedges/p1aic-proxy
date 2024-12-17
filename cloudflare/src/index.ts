const NDIS_HOST = "openam-ndia-aus-sandbox.id.forgerock.io"
const NDIS_SCHEME = "https"
const NDIS_PORT = ":443"
const CLOUDFLARE_HOST = "localhost"
const CLOUDFLARE_PORT = ":8787"
const CLOUDFLARE_SCHEME = "http"

async function handleRequest(request, ctx) {
	const url = new URL(request.url)
	const pathname = url.pathname
	const search = url.search
	const pathWithParams = pathname + search

	if (pathname.startsWith("/")) {
		return retrieveStatic(request, pathWithParams, ctx)
	} else {
		return forwardRequest(request, pathWithParams)
	}
}

async function retrieveStatic(request, pathname, ctx) {
	if (pathname.startsWith('/am/oauth2/authorize') && request.method === "GET") {
		pathname = pathname.replaceAll(
			encodeURIComponent(`${CLOUDFLARE_SCHEME}://${CLOUDFLARE_HOST}${CLOUDFLARE_PORT}`),
			encodeURIComponent(`${NDIS_SCHEME}://${NDIS_HOST}`)
		);
	}
	let body = request.body
	if (pathname.startsWith('/am/oauth2/access_token') && request.method === "POST") {
		const formData = await request.formData();
		formData.set('redirect_uri', formData.get('redirect_uri').replaceAll(`${CLOUDFLARE_SCHEME}://${CLOUDFLARE_HOST}${CLOUDFLARE_PORT}`, `${NDIS_SCHEME}://${NDIS_HOST}`))
		body = formData
	}
	let response = await caches.default.match(request)
	let responseClone: any = response
	if (!response) {
		response = await fetch(`https://${NDIS_HOST}${pathname}`, {
			headers: request.headers,
			body: body,
			method: request.method,
			redirect: 'manual'
		})
		var content: any = response.body
		if (pathname.endsWith('.js')) {
			content = (await response.text()).replaceAll(`${NDIS_SCHEME}://${NDIS_HOST}`, `${CLOUDFLARE_SCHEME}://${CLOUDFLARE_HOST}${CLOUDFLARE_PORT}`)
		}
		responseClone = new Response(content, response)
		response.headers.getSetCookie().forEach((cookie) => {
			cookie = cookie.replace(NDIS_HOST, CLOUDFLARE_HOST)
			cookie = cookie.replace(' Secure;', '')
			cookie = cookie.replace(' SameSite=none', '')
			responseClone?.headers.append('Set-Cookie', cookie)
		})
		if (pathname.startsWith('/am/oauth2/authorize') && request.method === "GET") {
			let location = response.headers.get('location');
			if (location) {
				location = location.replaceAll(`${NDIS_SCHEME}://${NDIS_HOST}`, '')
				location = location.replaceAll(encodeURIComponent(`${NDIS_SCHEME}://${NDIS_HOST}${NDIS_PORT}`), encodeURIComponent(`${CLOUDFLARE_SCHEME}://${CLOUDFLARE_HOST}`))
				responseClone?.headers.set('Location', location)
			}
		}
		if (request.method === "GET" && (response.status >= 200 && response.status < 300)) {
			ctx.waitUntil(caches.default.put(request, responseClone.clone()))
		}
	}
	return responseClone
}

async function forwardRequest(request, pathWithSearch) {
	const originRequest = new Request(request)
	originRequest.headers.delete("cookie")
	return await fetch(`https://${NDIS_HOST}${pathWithSearch}`, originRequest)
}

export default {
	async fetch(request, env, ctx) {
		return handleRequest(request, ctx);
	}
};